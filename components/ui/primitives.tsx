import type { ComponentProps } from "react";
export function Container({ className = "", ...props }: ComponentProps<"div">) { return <div className={`mx-auto w-full max-w-wrap px-gutter ${className}`} {...props} />; }
export function Section({ className = "", ...props }: ComponentProps<"section">) { return <section className={`relative py-section ${className}`} {...props} />; }
export function Card({ className = "", ...props }: ComponentProps<"div">) { return <div className={`rounded-lg bg-white p-[clamp(24px,4vw,44px)] shadow-card ${className}`} {...props} />; }
const base = "inline-flex max-w-full items-center justify-center gap-2 rounded-pill px-[2em] py-[1em] text-[.85rem] font-bold uppercase tracking-[.18em] no-underline transition duration-250 ease-brand hover:-translate-y-0.5 disabled:opacity-50 motion-reduce:transform-none";
const styles = { orange: "bg-orange text-white hover:bg-[#ff6d1f]", blue: "bg-blue-1 text-white hover:bg-blue-2", ghost: "text-current ring-2 ring-inset ring-current" };
type Variant = keyof typeof styles;
export function Button({ variant = "orange", className = "", type = "button", ...props }: ComponentProps<"button"> & { variant?: Variant }) { return <button type={type} className={`${base} ${styles[variant]} ${className}`} {...props} />; }
export function ButtonLink({ variant = "orange", className = "", ...props }: ComponentProps<"a"> & { variant?: Variant }) { return <a className={`${base} ${styles[variant]} ${className}`} {...props} />; }
