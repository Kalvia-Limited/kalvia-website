import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { openBrowser, pause } from './browser-session.mjs';
import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3000';
const browser = await openBrowser();
const { send, evaluate } = browser;
const records = [];
const checks = [];
const check = async (name, expression) => {
  const passed = await evaluate(expression);
  if (!passed) {
    const detail = await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('a,button,input,textarea')].filter(el=>el.getClientRects().length && el.tabIndex>=0 && !el.classList.contains('skip-link')).filter(el=>{const r=el.getBoundingClientRect();return r.left < -2 || r.right > innerWidth+2}).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,60),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))})`);
    console.log(JSON.stringify({name,...detail}));
    const shot=await send('Page.captureScreenshot',{format:'png'}); await writeFile('docs/accessibility/failure.png',Buffer.from(shot.data,'base64'));
  }
  assert.equal(passed, true, name); checks.push(name);
};
const axe = await readFile('node_modules/axe-core/axe.min.js', 'utf8');
await mkdir('docs/accessibility/screenshots', { recursive: true });
try {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const [width, height] of [[320, 740], [360, 800], [390, 844], [430, 932], [768, 1024], [920, 900], [1024, 768], [1440, 1000], [844, 390]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: origin });
    for (let wait = 0; wait < 100; wait++) { if (await evaluate(`document.readyState === 'complete' && !!document.querySelector('#finder')`)) break; await pause(100); }
    await evaluate(`document.fonts.ready`); await pause(400);
    const press = async key => { await send('Input.dispatchKeyEvent', {type:'keyDown',key,code:key,windowsVirtualKeyCode:{Tab:9,Enter:13,Escape:27,ArrowRight:39}[key],...(key==='Enter'?{text:'\r'}:{})}); await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key}); await pause(80); };
    await press('Tab');
    await check(`${width}x${height}: first Tab exposes the skip link`, `document.activeElement.matches('.skip-link') && document.activeElement.getBoundingClientRect().top >= 0`);
    await press('Enter');
    await check(`${width}x${height}: skip link reaches main content`, `document.activeElement.id === 'main-content'`);
    await evaluate(axe);
    const audit = async state => {
      const result = await evaluate(`axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}}).then(result=>({violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}))`);
      records.push({ width, height, state, ...result });
    };
    await audit('initial');
    await check(`${width}x${height}: controls offer 44px touch targets`, `[...document.querySelectorAll('.btn,.nav-toggle,.nav-links a,.aud-tab,.brand-tab,.switch button,.ripple-label,.persona,.value,.motion-toggle,.verify .hint button,.chips span')].filter(el=>el.getClientRects().length).every(el=>el.getBoundingClientRect().height >= 43.5)`);
    await check(`${width}x${height}: prosperity buttons do not overlap`, `(() => {const rects=[...document.querySelectorAll('.ripple-label')].map(el=>el.getBoundingClientRect());return rects.every((a,i)=>rects.slice(i+1).every(b=>a.right<=b.left || b.right<=a.left || a.bottom<=b.top || b.bottom<=a.top));})()`);
    await check(`${width}x${height}: form inputs avoid mobile focus zoom`, `[...document.querySelectorAll('input:not([type=radio]),textarea')].filter(el=>el.tabIndex>=0).every(el=>parseFloat(getComputedStyle(el).fontSize)>=16)`);
    await check(`${width}x${height}: all gallery images remain available`, `[...document.querySelectorAll('.frames figure')].every(el=>el.getClientRects().length>0)`);
    await check(`${width}x${height}: hidden panels exclude their descendants`, `[...document.querySelectorAll('[role=tabpanel][hidden]')].every(panel=>[...panel.querySelectorAll('a,button,input,[tabindex]')].every(el=>el.getClientRects().length===0))`);
    if (width <= 920) {
      await evaluate(`document.querySelector('.nav-toggle').click()`); await pause(100);
      await check(`${width}x${height}: menu opening focuses a link`, `document.activeElement.matches('.nav-links a')`);
      for (let i=0;i<5;i++) {
        if (i>0) await press('Tab');
        await check(`${width}x${height}: menu link ${i+1} is visible`, `(() => {const a=document.activeElement,r=a.getBoundingClientRect(),menu=document.querySelector('.nav-links').getBoundingClientRect();return a.matches('.nav-links a') && r.top>=menu.top && r.bottom<=Math.min(innerHeight,menu.bottom)+1;})()`);
      }
      await press('Escape');
      await check(`${width}x${height}: Escape closes and returns menu focus`, `document.activeElement.matches('.nav-toggle') && document.activeElement.getAttribute('aria-expanded')==='false'`);
      if (width <= 860) await check(`${width}x${height}: mobile journey graphic cannot cover steps`, `getComputedStyle(document.querySelector('.journey-sticky')).position !== 'sticky'`);
    }
    const geometry = await evaluate(`({pageOverflow:document.documentElement.scrollWidth>innerWidth, clippedText:[...document.querySelectorAll('h1,h2,h3,h4,p,.btn,.brand-tab,.aud-tab,.lockup')].filter(el=>!el.classList.contains('sr-only') && el.getClientRects().length && el.scrollWidth > el.clientWidth+2).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.trim().slice(0,75),width:el.clientWidth,scrollWidth:el.scrollWidth})), offscreenControls:[...document.querySelectorAll('a,button,input,textarea')].filter(el=>!el.classList.contains('skip-link') && el.getClientRects().length && el.tabIndex>=0).filter(el=>{const r=el.getBoundingClientRect();return r.left < -2 || r.right > innerWidth+2}).map(el=>({tag:el.tagName,id:el.id,class:el.className}))})`);
    records.push({ width, height, state: 'geometry', ...geometry });
    if (width === 320 || width === 390 || width === 768 || width === 1440) {
      for (const [name, selector] of [['hero','.hero'], ['cycle','#cycle'], ['prosperity','#ripple-stage'], ['offering','#academy'], ['soat','#soat'], ['finder','#finder'], ['journey','.journey'], ['gallery','.frames'], ['contact','#contact-form']]) {
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`); await pause(100);
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(`docs/accessibility/screenshots/${width}-${name}.png`, Buffer.from(shot.data, 'base64'));
      }
    }
    if (width === 390) {
      for (const selector of ['[data-cycle="after"]','#tab-market','#market-audience-tab-1','[data-try="KA17/A"]','[data-try="KA09/C"]','.value']) {
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await pause(100); await audit(selector);
        if (selector==='[data-cycle="after"]') { await evaluate(`document.querySelector('#cycle').scrollIntoView({block:'center',behavior:'instant'})`); const shot=await send('Page.captureScreenshot',{format:'png'}); await writeFile('docs/accessibility/screenshots/390-cycle-after.png',Buffer.from(shot.data,'base64')); }
      }
      await evaluate(`document.querySelector('#contact-form').requestSubmit()`); await pause(100); await audit('invalid contact form');
      await check('Validation focuses the first invalid field clear of the header', `(() => {const el=document.activeElement,r=el.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();return el.id==='f-name' && r.top >= header.bottom && r.bottom <= innerHeight;})()`);
      await check('Contact field focus remains visible', `getComputedStyle(document.activeElement).outlineStyle === 'solid' && parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=3`);
      await evaluate(`document.querySelector('input[name="interest"]:checked').focus()`);
      await press('ArrowRight');
      await check('Keyboard changes the enquiry interest and highlights its chip', `document.querySelector('input[name="interest"]:checked').value === 'Sponsoring' && getComputedStyle(document.activeElement.nextElementSibling).outlineStyle === 'solid'`);
      await check('Contact status is a polite atomic live region', `document.querySelector('#contact-status').getAttribute('aria-live')==='polite' && document.querySelector('#contact-status').getAttribute('aria-atomic')==='true'`);
      await send('Accessibility.enable');
      const tree=await send('Accessibility.getFullAXTree');
      await check('Value descriptions are available in the accessibility tree', JSON.stringify(tree.nodes.some(node=>node.role?.value==='button' && node.name?.value==='Respect the Work and the Worker' && node.description?.value.includes('We value every trade'))));
      await check('Hero headline has a stable readable screen-reader name', JSON.stringify(tree.nodes.some(node=>node.role?.value==='heading' && node.name?.value.includes('technical professionals starts here!'))));
    }
    if (width === 320 || width === 768 || width === 1440) {
      await evaluate(`document.documentElement.style.fontSize='200%'`); await pause(100);
      await audit('200% text');
      await evaluate(`document.querySelectorAll('.value').forEach(button=>button.click())`); await pause(100);
      await audit('200% text with values expanded');
      await check(`${width}px: expanded value descriptions are not clipped at 200%`, `[...document.querySelectorAll('.value-face.back')].every(el=>el.scrollHeight<=el.clientHeight+2 && el.scrollWidth<=el.clientWidth+2)`);
      await check(`${width}px: text at 200% reflows without clipped controls`, `document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('a,button,input,textarea')].filter(el=>el.getClientRects().length && el.tabIndex>=0 && !el.classList.contains('skip-link')).every(el=>{const r=el.getBoundingClientRect();return r.left>=-2 && r.right<=innerWidth+2;})`);
      await evaluate(`scrollTo({top:0,behavior:'instant'})`); const shot=await send('Page.captureScreenshot',{format:'png'}); await writeFile(`docs/accessibility/screenshots/${width}-text-200.png`,Buffer.from(shot.data,'base64'));
      await evaluate(`document.documentElement.style.fontSize=''`);
    }
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await pause(150);
  await evaluate(`document.querySelector('.motion-toggle').click()`); await pause(100);
  await check('Page motion control pauses automatic animation and parallax', `document.querySelector('.motion-toggle').getAttribute('aria-pressed')==='true' && getComputedStyle(document.querySelector('.marquee-track')).animationName==='none' && document.querySelector('.site-interactions').style.getPropertyValue('--py')==='0px'`);
  await writeFile('docs/accessibility/audit.json', JSON.stringify({ origin, engine: 'axe-core', checks, records, errors: browser.errors }, null, 2)+'\n');
  console.log(JSON.stringify(records.map(record=>({width:record.width,height:record.height,state:record.state,violations:record.violations?.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),pageOverflow:record.pageOverflow,clippedText:record.clippedText,offscreenControls:record.offscreenControls})), null, 2));
  assert.ok(records.every(record=>!record.violations?.length && !record.pageOverflow && !record.clippedText?.length && !record.offscreenControls?.length),'Accessibility audits and layout geometry pass');
  assert.deepEqual(browser.errors, [], 'No browser exceptions or console errors');
  console.log(`${checks.length} mobile/accessibility checks passed with zero automated violations.`);
} finally { await browser.close(); }
