"use client";

import { useEffect, useRef, useState } from "react";
import { AudiencePanel, PersonaRecommendation, ProsperityGraphic, prosperityStages, tabKey } from "./interactive-content";
import { Reveal, useInteractions, useReducedMotion } from "./interactions";
import type { Offering } from "@/data/content";

export function Header() {

  const { y, progress, active, offering } = useInteractions();
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = (restore = false) => { setOpen(false); if (restore) toggle.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => nav.current?.querySelector<HTMLAnchorElement>("#nav-links a")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (!nav.current?.contains(event.target as Node)) setOpen(false); };
    const onFocus = (event: FocusEvent) => { if (!nav.current?.contains(event.target as Node)) setOpen(false); };
    const desktop = matchMedia("(min-width: 921px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("focusin", onFocus); desktop.removeEventListener("change", resize); };
  }, []);
return (<><div className="progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }}></div>

<header className={`site-header ${y > 40 ? "scrolled" : ""}`} id="top">
  <div className="wrap">
    <nav ref={nav} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); close(true); } }} className="nav" aria-label="Main">
      <div className="nav-bar">
        <a className="brand" href="#top" aria-label="Kalvia home"><svg viewBox="0 0 260.2 93.1" style={{height: "30px"}}><use href="#k-logo"/></svg></a>
        <ul className={`nav-links ${open ? "open" : ""}`} onClick={event => { if ((event.target as Element).closest("a")) close(); }} id="nav-links">
          <li><a href="#academy" className={active === "academy" && offering === "academy" ? "active" : ""} aria-current={active === "academy" && offering === "academy" ? "location" : undefined}>Academy</a></li>
          <li><a href="#academy" data-brand="market" className={active === "academy" && offering === "market" ? "active" : ""} aria-current={active === "academy" && offering === "market" ? "location" : undefined}>Marketplace</a></li>
          <li><a href="#soat" className={active === "soat" ? "active" : ""} aria-current={active === "soat" ? "location" : undefined}>SOAT</a></li>
          <li><a href="#about" className={active === "about" ? "active" : ""} aria-current={active === "about" ? "location" : undefined}>About</a></li>
          <li><a href="#contact" className={active === "contact" ? "active" : ""} aria-current={active === "contact" ? "location" : undefined}>Contact</a></li>
        </ul>
        <a className="btn btn-orange nav-cta" href="#finder">Get started</a>
      </div>
      <button ref={toggle} type="button" className="nav-toggle" aria-expanded={open} aria-controls="nav-links" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(value => !value)}><span></span><span></span><span></span></button>
    </nav>
  </div>
</header></>);
}

export function CycleSection() {
const [after, setAfter] = useState(false);
return (<section className="section" id="about" tabIndex={-1} aria-labelledby="why-title">
  <div className="wrap cycle-grid">
    <Reveal className="cycle-copy reveal">
      <span className="eyebrow" style={{color: "var(--orange-ink)", marginBottom: "18px"}}>Why we exist</span>
      <h2 id="why-title">Technical education was underbuilt. That is fixable.</h2>
      <p>Africa&apos;s technical workforce is enormous in number and underserved in quality. Young people enter the trade economy without structure, without credentials, and without the professional formation that turns skill into a career.</p>
      <p>The result is a cycle that has nothing to do with the ability of the people in it, and everything to do with the absence of the right institutions. <strong>Kalvia exists to break that cycle.</strong></p>
      <div className={`switch ${after ? "after" : ""}`} role="group" aria-label="Show the cycle">
        <button type="button" aria-pressed={!after} onClick={() => setAfter(false)} data-cycle="before">The old cycle</button>
        <button type="button" aria-pressed={after} onClick={() => setAfter(true)} data-cycle="after">With Kalvia</button>
      </div>
    </Reveal>
    <Reveal className={`cycle reveal ${after ? "after" : ""}`} data-delay="1" id="cycle" aria-live="polite">
      <div className="cycle-ring" aria-hidden="true"></div>
      <div className="cycle-node"><div><b className="v-before">Low trust</b><b className="v-after">Earned trust</b><small>Customers</small></div></div>
      <div className="cycle-node"><div><b className="v-before">Low pay</b><b className="v-after">Fair pay</b><small>Technicians</small></div></div>
      <div className="cycle-node"><div><b className="v-before">Low aspiration</b><b className="v-after">Real careers</b><small>Young people</small></div></div>
      <div className="cycle-center"><span className="v-before" hidden={after}>No structure, no credentials</span><span className="v-after" hidden={!after}>Training, SOAT &amp; access</span></div>
    </Reveal>
  </div>
</section>);
}

export function ProsperitySection() {

  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const select = (index: number) => { setManual(true); setActive(index); };
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (manual || reduced || !visible || active >= 3) return;
    const timer = setTimeout(() => setActive(value => value + 1), 2600);
    return () => clearTimeout(timer);
  }, [manual, reduced, visible, active]);
return (<section className="section" style={{paddingTop: "0"}} aria-labelledby="prosper-title">
  <div className="wrap">
    <div className="prosper section" style={{paddingLeft: "var(--gutter)", paddingRight: "var(--gutter)"}}>
      <div className="prosper-grid" ref={ref}>
        <Reveal className="ripple-stage reveal" id="ripple-stage">
          <ProsperityGraphic active={active} select={select} />
        </Reveal>
        <div className="prosper-panel">
          <span className="eyebrow" style={{color: "var(--yellow)", marginBottom: "18px"}}>The chain of prosperity</span>
          <h2 id="prosper-title" className="sr-only">The chain of prosperity</h2>
          <div className="panel-swap" id="prosper-copy" aria-live="polite">
            <h3>{prosperityStages[active].title}</h3>
            <p>{prosperityStages[active].text}</p>
          </div>
          <div className="chain" id="chain" aria-hidden="true">
            {["People", "Businesses", "Families", "Society"].map((label, i) => <span key={label} className={i <= active ? "lit" : ""}>{i > 0 ? "→ " : ""}{label}</span>)}
          </div>
          <p style={{marginTop: "22px", color: "rgba(255,255,255,.7)", fontSize: ".95rem"}}>Tap a ring to follow the ripple. When our people prosper, our businesses prosper. When our businesses prosper, our society prospers.</p>
          <div className="essence"><span className="accent">Our essence:</span><strong style={{fontSize: "1.4rem", color: "var(--white)"}}>Enabling Prosperity</strong></div>
        </div>
      </div>
    </div>
  </div>
</section>);
}

export function OfferingsSection() {
const { offering, setOffering } = useInteractions();
const offerings: Offering[] = ["academy", "market"];
return (<section className="section" id="academy" tabIndex={-1} style={{paddingTop: "0"}} aria-labelledby="brands-title">
  <div className="wrap">
    <Reveal className="section-head reveal">
      <span className="eyebrow">One Kalvia, two ways in</span>
      <h2 id="brands-title">Learn the craft. Then find the work.</h2>
      <p>Kalvia Academy builds the professional. Kalvia Marketplace connects them with the customers and businesses who need them.</p>
    </Reveal>

    <div className="brand-tabs" role="tablist" aria-label="Kalvia offerings">
      <button className="brand-tab" role="tab" id="tab-academy" aria-selected={offering === "academy"} tabIndex={offering === "academy" ? 0 : -1} onClick={() => setOffering("academy")} onKeyDown={event => tabKey(event, 0, 2, i => setOffering(offerings[i]))} aria-controls="panel-academy" data-brand="academy">
        <span className="mk"><svg viewBox="0 0 75.2 93.1"><use href="#k-mark"/></svg></span>Kalvia Academy</button>
      <button className="brand-tab" role="tab" id="tab-market" aria-selected={offering === "market"} onClick={() => setOffering("market")} onKeyDown={event => tabKey(event, 1, 2, i => setOffering(offerings[i]))} aria-controls="panel-market" data-brand="market" tabIndex={offering === "market" ? 0 : -1}>
        <span className="mk"><svg viewBox="0 0 75.2 93.1"><use href="#k-mark"/></svg></span>Kalvia Marketplace</button>
    </div>

    <div className="brand-panel" id="panel-academy" role="tabpanel" aria-labelledby="tab-academy" hidden={offering !== "academy"} tabIndex={0}>
      <Reveal className="brand-hero academy reveal">
        <div className="bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div className="lockup"><svg viewBox="0 0 260.2 93.1"><use href="#k-logo"/></svg><span>Academy</span></div>
        <div>
          <h3>The magic of mastery.</h3>
          <p>Thorough training, strong structures and practical systems that develop technical competence and the professional skills the trade has been missing.</p>
          <a className="btn btn-blue" style={{marginTop: "22px"}} href="#contact" data-interest="Academy">Apply to the Academy <span className="arrow">→</span></a>
        </div>
      </Reveal>
      <AudiencePanel offering="academy" />
    </div>

    <div className="brand-panel" id="panel-market" role="tabpanel" aria-labelledby="tab-market" hidden={offering !== "market"} tabIndex={0}>
      <div className="brand-hero market">
        <div className="bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div className="lockup"><svg viewBox="0 0 260.2 93.1"><use href="#k-logo"/></svg><span>Marketplace</span></div>
        <div>
          <h3>Peace of mind, assured quality.</h3>
          <p>A structured pool of certified technicians, with systems for placement, invoicing and tracking built in.</p>
          <a className="btn btn-orange" style={{marginTop: "22px"}} href="#contact" data-interest="Marketplace">Hire a technician <span className="arrow">→</span></a>
        </div>
      </div>
      <AudiencePanel offering="market" />
    </div>
  </div>
</section>);
}

export function JourneySection() {
const { step } = useInteractions();
const zones = [{ top: "52%", height: "30%", background: "#FF5A00", opacity: .85 }, { top: "14%", height: "34%", background: "#FF5A00", opacity: .85 }, { top: "0%", height: "100%", background: "#FFAE00", opacity: .9 }];
return (<section className="section journey" aria-labelledby="journey-title">
  <div className="wrap">
    <Reveal className="section-head reveal">
      <span className="eyebrow">Read our mark from the bottom up</span>
      <h2 id="journey-title">Absorb. Apply. Ascend.</h2>
      <p>Our logo tells the story of every Kalvia professional: knowledge enters through the open book, is transformed through skilled work, and produces someone who sees what others cannot.</p>
    </Reveal>
    <div className="journey-grid">
      <div className="journey-sticky">
        <div className="mark-stage arch" id="mark-stage">
          <div className="zone" id="mark-zone" style={zones[step]}></div>
          <svg className="big-mark" viewBox="0 0 75.2 93.1" aria-hidden="true"><use href="#k-mark"/></svg>
          <span className="step-num accent" id="step-num" style={{ color: step === 2 ? "var(--blue-1)" : "var(--yellow)" }}>{String(step + 1).padStart(2, "0")}</span>
        </div>
      </div>
      <div className="journey-steps">
        <article className={step === 0 ? "j-step active" : "j-step"} data-zone="book">
          <span className="tag">01 · The open book</span>
          <h3>Absorb</h3>
          <p>The book faces upward, pages ready to receive. Every Kalvia student begins here, taking in the foundations of their craft.</p>
        </article>
        <article className={step === 1 ? "j-step active" : "j-step"} data-zone="gear">
          <span className="tag">02 · The gear</span>
          <h3>Apply</h3>
          <p>Theory becomes practice. Knowledge becomes skill. In the workshop, the student becomes a maker.</p>
        </article>
        <article className={step === 2 ? "j-step active" : "j-step"} data-zone="eye">
          <span className="tag">03 · The seeing eye</span>
          <h3>Ascend</h3>
          <p>The enlightened professional emerges: technically skilled, customer-trained, career-ready, with credentials recognised wherever opportunity exists.</p>
        </article>
      </div>
    </div>
  </div>
</section>);
}

export function FinderSection() {
const [persona, setPersona] = useState<"student" | "sponsor" | "tech" | "org">("student");
return (<section className="section" id="finder" tabIndex={-1} aria-labelledby="finder-title">
  <div className="wrap">
    <Reveal className="section-head reveal">
      <span className="eyebrow">Start enabling prosperity</span>
      <h2 id="finder-title">Who are you here as?</h2>
      <p>Pick the one that fits and we&apos;ll point you to the right door.</p>
    </Reveal>
    <Reveal className="finder reveal">
      <div className="finder-grid" role="group" aria-label="Choose who you are">
        <button className="persona" type="button" aria-pressed={persona === "student"} onClick={() => setPersona("student")} data-persona="student">
          <span className="p-ico" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/></svg></span>
          <span><b>A student</b><small>I want practical skills and a real career.</small></span></button>
        <button className="persona" type="button" aria-pressed={persona === "sponsor"} onClick={() => setPersona("sponsor")} data-persona="sponsor">
          <span className="p-ico" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg></span>
          <span><b>A parent or sponsor</b><small>I want a better future for someone I support.</small></span></button>
        <button className="persona" type="button" aria-pressed={persona === "tech"} onClick={() => setPersona("tech")} data-persona="tech">
          <span className="p-ico" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z"/></svg></span>
          <span><b>A technician</b><small>I want steady jobs and clients.</small></span></button>
        <button className="persona" type="button" aria-pressed={persona === "org"} onClick={() => setPersona("org")} data-persona="org">
          <span className="p-ico" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5"/><path d="M9 10h.01M15 10h.01"/></svg></span>
          <span><b>A business</b><small>I need skilled people or want measurable impact.</small></span></button>
      </div>
      <PersonaRecommendation persona={persona} />
    </Reveal>
  </div>
</section>);
}

