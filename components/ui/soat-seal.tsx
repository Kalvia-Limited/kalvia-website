import { BrandMark } from "./brand";
export function SoatSeal({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 320 380" aria-hidden="true" className={className}>
    <path d="M160 8 L300 58 V190 C300 280 236 340 160 372 C84 340 20 280 20 190 V58 Z" fill="#FFAE00" />
    <path d="M160 30 L282 73 V190 C282 268 226 320 160 350 C94 320 38 268 38 190 V73 Z" fill="#170C79" />
    <g transform="translate(118 74) scale(1.12)" fill="#fff"><BrandMark width="75" height="93" style={{ color: "#fff" }} /></g>
    <text x="160" y="238" textAnchor="middle" fontFamily="var(--font-parkinsans), sans-serif" fontWeight="800" fontSize="58" fill="#FFAE00" letterSpacing="4">SOAT</text>
    <text x="160" y="262" textAnchor="middle" fontFamily="var(--font-parkinsans), sans-serif" fontWeight="600" fontSize="9.5" fill="#fff" letterSpacing="1">SEAL OF AUTHORISED TECHNICIAN</text>
    <text x="160" y="290" textAnchor="middle" fontFamily="var(--font-parkinsans), sans-serif" fontWeight="700" fontSize="13" fill="#FF5A00" letterSpacing="3">KALVIA CERTIFIED</text>
  </svg>;
}
