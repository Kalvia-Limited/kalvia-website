param([int]$Port = 9337)
$ErrorActionPreference = 'Stop'
$root = if ($PSScriptRoot) { Split-Path $PSScriptRoot -Parent } else { (Get-Location).Path }
$out = Join-Path $root 'docs/foundation'
$chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$profile = Join-Path ([IO.Path]::GetTempPath()) ('kalvia-baseline-' + [guid]::NewGuid())
New-Item -ItemType Directory -Force (Join-Path $out 'screenshots') | Out-Null
$process = Start-Process -FilePath $chrome -WindowStyle Hidden -PassThru -ArgumentList @('--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', "--remote-debugging-port=$Port", "--user-data-dir=$profile", 'about:blank')
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:nextId = 0
$script:exceptions = @()
function Send-CDP([string]$Method, [hashtable]$Params = @{}) {
    $script:nextId++
    $id = $script:nextId
    $json = @{id=$id; method=$Method; params=$Params} | ConvertTo-Json -Depth 30 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    do {
        $stream = [IO.MemoryStream]::new()
        do {
            $buffer = New-Object byte[] 65536
            $part = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            $stream.Write($buffer, 0, $part.Count)
        } until ($part.EndOfMessage)
        $reply = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
        $stream.Dispose()
        if ($reply.method -eq 'Runtime.exceptionThrown') { $script:exceptions += $reply.params }
    } until ($reply.id -eq $id)
    if ($reply.error) { throw ($reply.error | ConvertTo-Json -Compress) }
    return $reply.result
}
function Eval-JS([string]$Expression) {
    $r = Send-CDP 'Runtime.evaluate' @{expression=$Expression; awaitPromise=$true; returnByValue=$true}
    if ($r.exceptionDetails) { throw ($r.exceptionDetails | ConvertTo-Json -Depth 10) }
    return $r.result.value
}
function Save-Shot([string]$Name, [bool]$Full = $false) {
    $p = @{format='png'; captureBeyondViewport=$Full}
    if ($Full) {
        $m = Send-CDP 'Page.getLayoutMetrics'
        $p.clip = @{x=0; y=0; width=$m.cssContentSize.width; height=$m.cssContentSize.height; scale=1}
    }
    $r = Send-CDP 'Page.captureScreenshot' $p
    [IO.File]::WriteAllBytes((Join-Path $out "screenshots/$Name.png"), [Convert]::FromBase64String($r.data))
}
try {
    for ($i=0; $i -lt 50; $i++) {
        try { $targets = Invoke-RestMethod "http://127.0.0.1:$Port/json/list"; break } catch { Start-Sleep -Milliseconds 100 }
    }
    $target = $targets | Where-Object type -eq 'page' | Select-Object -First 1
    $socket.ConnectAsync([uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    Send-CDP 'Page.enable' | Out-Null
    Send-CDP 'Runtime.enable' | Out-Null
    $records = @()
    foreach ($size in @(@{name='mobile'; width=390; height=844}, @{name='tablet'; width=768; height=1024}, @{name='desktop'; width=1440; height=1000})) {
        Send-CDP 'Emulation.setDeviceMetricsOverride' @{width=$size.width; height=$size.height; deviceScaleFactor=1; mobile=$false} | Out-Null
        Send-CDP 'Page.navigate' @{url='http://127.0.0.1:3000'} | Out-Null
        for ($i=0; $i -lt 50; $i++) {
            Start-Sleep -Milliseconds 100
            if ((Eval-JS 'document.readyState') -eq 'complete') { break }
        }
        Eval-JS 'document.fonts.ready.then(() => true)' | Out-Null
        Start-Sleep -Milliseconds 700
        Save-Shot $size.name
        # Scroll through the real viewport to load lazy images and trigger source observers.
        Eval-JS '(async () => { document.querySelectorAll("img").forEach(i=>i.loading="eager"); const height=document.documentElement.scrollHeight; for(let y=0;y<height;y+=innerHeight*0.7){scrollTo({top:y,behavior:"instant"}); await new Promise(r=>setTimeout(r,80));} await Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))); scrollTo({top:0,behavior:"instant"}); await new Promise(r=>setTimeout(r,1000)); })()' | Out-Null
        Save-Shot ($size.name + '-full') $true
        $records += Eval-JS '({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute("src"),width:i.naturalWidth,height:i.naturalHeight,loaded:i.complete&&i.naturalWidth>0})),anchors:[...document.querySelectorAll("a")].map(a=>({text:a.textContent.trim()||a.getAttribute("aria-label"),href:a.getAttribute("href"),brand:a.dataset.brand,interest:a.dataset.interest})),sections:[...document.querySelectorAll("main>section")].map(s=>({id:s.id,label:s.getAttribute("aria-label"),heading:s.querySelector("h1,h2")?.textContent.trim()}))})'

    }
    @{viewports=$records; exceptions=$script:exceptions; browser=(Send-CDP 'Browser.getVersion')} | ConvertTo-Json -Depth 30 | Set-Content -Encoding utf8 (Join-Path $out 'capture-report.json')
    Send-CDP 'Browser.close' | Out-Null
    Write-Output "Captured mobile, tablet and desktop references in $out"
} finally {
    $socket.Dispose()
    # Only the unique temporary profile created by this script is removed.
    if (!$process.HasExited) { $process.WaitForExit(5000) | Out-Null }
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if ($process.HasExited -and $resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
}
