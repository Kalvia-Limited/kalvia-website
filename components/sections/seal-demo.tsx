"use client";

import { useState } from "react";

// Local fixtures only; the demo never queries a technician register.
const samples = new Map([
  ["KA17/A", { name: "Lagbaja Tamedu", trade: "Electrical installation", initials: "LT", valid: true }],
  ["KA09/C", { name: "Adebisi Adebolu", trade: "Solar PV installation", initials: "AA", valid: false }],
]);

export function SealDemo() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const verify = (value: string) => setResult(value.trim().toUpperCase().replace(/\s+/g, ""));
  const record = result ? samples.get(result) : undefined;
  return <form className="verify" id="verify" aria-label="SOAT verification demonstration" onSubmit={event => { event.preventDefault(); verify(input); }}>
    <label htmlFor="soat-id">Check a technician&apos;s seal — demo</label>
    <div className="verify-row"><input id="soat-id" name="soat-id" value={input} onChange={event => setInput(event.target.value)} placeholder="e.g. KA17/A" autoComplete="off" aria-describedby="soat-hint" /><button className="btn btn-orange" type="submit">Verify sample</button></div>
    <p className="hint" id="soat-hint">Preview with sample IDs: {[...samples.keys()].map((id, index) => <span key={id}>{index > 0 ? " · " : ""}<button type="button" data-try={id} onClick={() => { setInput(id); verify(id); }}>{id}</button></span>)}. Demonstration only; no live register is queried. These results do not verify a real technician.</p>
    <div className={`verify-result ${result !== null ? "show" : ""}`} id="verify-result" aria-live="polite" aria-atomic="true">
      {result !== null && (record ? <div className="tech-card"><div className="avatar" aria-hidden="true">{record.initials}</div><div><h3>{record.name}</h3><div className="meta">{record.trade} · ID {result}</div><div className="meta">Sample record only</div></div><span className={`badge ${record.valid ? "ok" : "warn"}`}>{record.valid ? "SOAT valid (demo)" : "Expired (demo)"}</span></div> : <div className="verify-msg">{result ? <>Demo: We couldn&apos;t find <strong>{result}</strong> in the sample register. No live register was queried.</> : "Enter a sample technician ID."}</div>)}
    </div>
  </form>;
}
