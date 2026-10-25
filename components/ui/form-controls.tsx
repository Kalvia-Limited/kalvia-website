import type { ComponentProps, ReactNode } from "react";
const style = "w-full min-w-0 rounded-[14px] border-2 border-blue-1-7 bg-paper px-4 py-3.5 text-ink transition-colors focus:border-blue-2 focus:bg-white aria-invalid:border-passion";
export function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) { return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-blue-1">{label}</label>{children}{error && <p id={`${id}-error`} className="mt-1.5 text-sm text-passion">{error}</p>}</div>; }
export function Input({ className = "", ...props }: ComponentProps<"input">) { return <input className={`${style} ${className}`} {...props} />; }
export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) { return <textarea className={`${style} min-h-30 resize-y ${className}`} {...props} />; }
export function Select({ className = "", ...props }: ComponentProps<"select">) { return <select className={`${style} ${className}`} {...props} />; }
