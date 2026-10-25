"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { Interest, Offering } from "@/data/content";

function subscribeMotion(callback: () => void) {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const PausedMotionContext = createContext(false);
function useDeviceReducedMotion() {
  return useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
}
export function useReducedMotion() {
  const device = useDeviceReducedMotion();
  const paused = useContext(PausedMotionContext);
  return device || paused;
}
const InteractionContext = createContext({
  offering: "academy" as Offering, setOffering: (value: Offering) => { void value; },
  interest: "Academy" as Interest, setInterest: (value: Interest) => { void value; },
  y: 0, progress: 0, active: "", step: 0,
  motionPaused: false, setMotionPaused: (value: boolean) => { void value; },
});
export const useInteractions = () => useContext(InteractionContext);

export function SiteInteractions({ children }: { children: ReactNode }) {
  const [offering, setOffering] = useState<Offering>("academy");
  const [interest, setInterest] = useState<Interest>("Academy");
  const [motionPaused, setMotionPaused] = useState(false);
  const [scroll, setScroll] = useState({ y: 0, progress: 0, active: "", step: 0 });
  const reduced = useReducedMotion() || motionPaused;
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const active = ["about", "academy", "soat", "contact"].filter(id => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect && rect.top <= innerHeight * .45 && rect.bottom > 100;
      }).at(-1) ?? "";
      const steps = [...document.querySelectorAll<HTMLElement>(".j-step")];
      const nearest = steps.reduce((best, el, i) => Math.abs(el.getBoundingClientRect().top + el.offsetHeight / 2 - innerHeight / 2) < Math.abs(steps[best].getBoundingClientRect().top + steps[best].offsetHeight / 2 - innerHeight / 2) ? i : best, 0);
      setScroll({ y: scrollY, progress: max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0, active, step: nearest });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    schedule();
    return () => { removeEventListener("scroll", schedule); removeEventListener("resize", schedule); observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <InteractionContext.Provider value={{ offering, setOffering, interest, setInterest, motionPaused, setMotionPaused, ...scroll }}><PausedMotionContext.Provider value={motionPaused}>
    <div className="site-interactions" data-motion-reduced={reduced} style={{ "--py": reduced ? "0px" : `${Math.min(scroll.y, 1000) * .12}px` } as CSSProperties} onClickCapture={event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a");
      if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (link.hash === "#academy") setOffering(link.dataset.brand === "market" ? "market" : "academy");
      const value = link.dataset.interest;
      if (value && ["Academy", "Sponsoring", "Marketplace", "Partnership"].includes(value)) setInterest(value as Interest);
    }}>{children}</div>
  </PausedMotionContext.Provider></InteractionContext.Provider>;
}

export function MotionControl() {
  const { motionPaused, setMotionPaused } = useInteractions();
  const device = useDeviceReducedMotion();
  return device ? <span className="motion-note">Reduced motion enabled</span> : <button type="button" className="motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? "Resume animations" : "Pause animations"}</button>;
}

export function Reveal({ as: Tag = "div", className = "", children, ...props }: HTMLAttributes<HTMLElement> & { as?: "div" | "figure" | "a" | "form"; href?: string; noValidate?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { threshold: .12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);
  // Content is always readable, including before hydration and without observers.
  return <Tag {...props} ref={ref as never} className={`${className} ${visible || reduced ? "in" : "reveal-waiting"}`}>{children}</Tag>;
}

export function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const desktop = matchMedia("(min-width: 921px)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      setIndex(0);
      if (desktop.matches && !reduced) timer = setInterval(() => setIndex(i => (i + 1) % 5), 2400);
    };
    desktop.addEventListener("change", sync);
    const frame = requestAnimationFrame(sync);
    return () => { cancelAnimationFrame(frame); clearInterval(timer); desktop.removeEventListener("change", sync); };
  }, [reduced]);
  return <span className="hero-profession"><span className="sr-only">technical professionals</span><span className="rotator" aria-hidden="true">{["technical professionals", "solar installers", "electricians", "plumbers", "HVAC technicians"].map((word, i) => <span key={word} className={i === index ? "on" : ""}>{word}</span>)}</span></span>;
}

export function Counter({ end }: { end: number }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(end);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current) return;
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (time: number) => {
        const progress = Math.min(1, (time - start) / 1200);
        setValue(Math.round(end * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .6 });
    observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [end, reduced]);
  return <><b ref={ref} aria-hidden="true"><span>{reduced ? end : value}</span></b><span className="sr-only">{end}</span></>;
}

export function SealMovement({ children }: { children: ReactNode }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  return <Reveal className="seal-wrap reveal" onPointerMove={event => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientX - rect.left) / rect.width - .5) * 22, y: -((event.clientY - rect.top) / rect.height - .5) * 22 });
  }} onPointerLeave={() => setTilt({ x: 0, y: 0 })} style={{ "--seal-transform": reduced ? "none" : `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` } as CSSProperties}>{children}</Reveal>;
}

