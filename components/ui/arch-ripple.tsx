export function ArchRipple({ className = "", count = 14, id }: { className?: string; count?: number; id?: string }) {
  return <svg id={id} viewBox="0 0 600 600" aria-hidden="true" className={className}>{Array.from({ length: count }, (_, i) => { const r = 150 + i * 16; const top = 240 - i * 16; return <path key={i} d={`M${300-r},600 V${top+r} A${r},${r} 0 0 1 ${300+r},${top+r} V600`} fill="none" stroke="currentColor" strokeWidth="2" opacity={1-i/(count+2)} />; })}</svg>;
}
