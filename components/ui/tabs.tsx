"use client";
import { useId, useRef, useState, type ReactNode } from "react";
export function Tabs({ label, items }: { label: string; items: { key: string; label: string; content: ReactNode }[] }) {
  const id = useId(); const [active, setActive] = useState(0); const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div><div role="tablist" aria-label={label} className="mb-7 flex flex-wrap gap-2.5">{items.map((item, i) => <button key={item.key} ref={el => { refs.current[i] = el; }} type="button" role="tab" id={`${id}-t-${item.key}`} aria-controls={`${id}-p-${item.key}`} aria-selected={active === i} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={e => {
    const next = e.key === "ArrowRight" ? (i + 1) % items.length : e.key === "ArrowLeft" ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (next !== null) { e.preventDefault(); setActive(next); refs.current[next]?.focus(); }
  }} className="rounded-pill bg-white px-[22px] py-3 font-bold text-blue-1 ring-2 ring-inset ring-blue-1-7 aria-selected:bg-blue-1 aria-selected:text-yellow">{item.label}</button>)}</div>{items.map((item, i) => <div key={item.key} role="tabpanel" id={`${id}-p-${item.key}`} aria-labelledby={`${id}-t-${item.key}`} hidden={active !== i} tabIndex={0}>{item.content}</div>)}</div>;
}
