"use client";

import { useState, type KeyboardEvent } from "react";
import { audiences, personas, values, type Offering } from "@/data/content";
import { Reveal } from "./interactions";

export function tabKey(event: KeyboardEvent, index: number, count: number, select: (next: number) => void) {
  const next = event.key === "ArrowRight" ? (index + 1) % count : event.key === "ArrowLeft" ? (index + count - 1) % count : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : null;
  if (next === null) return;
  event.preventDefault();
  select(next);
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
}

export function AudiencePanel({ offering }: { offering: Offering }) {
  const [active, setActive] = useState(0);
  return <div className="audience"><div className="aud-tabs" role="tablist" aria-label={`${offering === "market" ? "Marketplace" : "Academy"} audiences`}>{audiences[offering].map((a, i) => <button type="button" role="tab" className="aud-tab" key={a.tab} id={`${offering}-audience-tab-${i}`} aria-controls={`${offering}-audience-${i}`} aria-selected={active === i} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={event => tabKey(event, i, 3, setActive)}>{a.tab}</button>)}</div>{audiences[offering].map((a, i) => <div hidden={active !== i} role="tabpanel" tabIndex={0} aria-labelledby={`${offering}-audience-tab-${i}`} className="aud-body panel-swap" id={`${offering}-audience-${i}`} key={a.tab}><span className="who">{a.who}</span><h3>{a.title}</h3><p>{a.text}</p><ul>{a.points.map(p => <li key={p}>{p}</li>)}</ul><div className="promise-pill">{a.tags.map(t => <span key={t}>{t}</span>)}</div></div>)}</div>;
}

export function PersonaRecommendation({ persona }: { persona: keyof typeof personas }) {
  const p = personas[persona];
  return <div className="finder-out panel-swap" id="finder-out" aria-live="polite"><div><span className="kicker">{p.kicker}</span><h3>{p.title}</h3><p>{p.text}</p></div><a className="btn btn-blue" href="#contact" data-interest={p.interest}>{p.cta} <span aria-hidden="true">→</span></a></div>;
}

export const prosperityStages = [
  { key: "Students", title: "Students prosper", text: "By gaining the skills, knowledge and opportunities needed to build meaningful, sustainable careers." },
  { key: "Businesses", title: "Businesses prosper", text: "By gaining access to skilled, capable professionals who help them operate better, grow sustainably and thrive." },
  { key: "Parents & sponsors", title: "Families prosper", text: "Parents and sponsors gain the confidence of seeing their children or beneficiaries become self-sufficient and build more secure futures." },
  { key: "Society", title: "Society prospers", text: "When small and medium-sized businesses grow, they create jobs, solve everyday problems and strengthen local economies." },
];
export function ProsperityGraphic({ active, select }: { active: number; select: (index: number) => void }) {
  return <><svg viewBox="0 0 500 500" id="ripple-svg" aria-hidden="true">{prosperityStages.map((stage, i) => { const r = (150 + i * 90) / 2; const top = 440 - (175 + i * 80); return <path className={`ring ${i <= active ? "lit" : ""}`} key={stage.key} d={`M${250-r},440 V${top+r} A${r},${r} 0 0 1 ${250+r},${top+r} V440`} stroke={['#FF5A00','#FFAE00','#271CC1','#C9C6EF'][i]} opacity={i <= active ? 1 : .35} onClick={() => select(i)} style={{ cursor: "pointer", pointerEvents: "stroke" }} />; })}<path key={active} className="pulse go" d="M40,440 V245 A210,210 0 0 1 460,245 V440" /><path className="core" d="M210,440 V385 A40,40 0 0 1 290,385 V440Z" /><line x1="20" x2="480" y1="440" y2="440" stroke="rgba(255,255,255,.25)" strokeWidth="2" /></svg><div className="ripple-controls" role="group" aria-label="Prosperity stages">{prosperityStages.map((stage, i) => <button type="button" key={stage.key} className="ripple-label" aria-controls="prosper-copy" aria-pressed={active === i} onClick={() => select(i)} style={{ left: "50%", top: `${(440-(175+i*80))/5}%` }}>{stage.key}</button>)}</div></>;
}

function ValueCard({ title, description, index }: { title: string; description: string; index: number }) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const flipped = pinned || hover;
  return <button className={`value ${flipped ? "flipped" : ""}`} type="button" aria-label={title} aria-describedby={`value-description-${index}`} aria-expanded={flipped} aria-controls={`value-description-${index}`} onPointerEnter={event => { if (event.pointerType === "mouse") setHover(true); }} onPointerLeave={() => setHover(false)} onKeyDown={event => {
    if (event.key === "Escape") { setPinned(false); setHover(false); }
  }} onClick={() => { setPinned(value => !value); setHover(false); }}><span className="value-inner"><span className="value-face front" aria-hidden={flipped}><span className="n">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3></span><span className="value-face back" id={`value-description-${index}`} aria-hidden={!flipped}>{description}</span></span></button>;
}
export function ValuesWall() {
  return <Reveal className="values-wall reveal">{values.map((value, index) => <ValueCard key={value.title} {...value} index={index} />)}</Reveal>;
}
