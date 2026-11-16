/** Marca: cuadro azul con ₡ y la franja roja y blanca de la bandera. Igual que public/favicon.svg. */
export function MarcaLogo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <clipPath id="marca-recorte">
        <rect width="40" height="40" rx="9" />
      </clipPath>
      <g clipPath="url(#marca-recorte)">
        <rect width="40" height="40" fill="#002B7F" />
        <rect y="29" width="40" height="2.5" fill="#fff" />
        <rect y="31.5" width="40" height="5" fill="#C8102E" />
        <rect y="36.5" width="40" height="2.5" fill="#fff" />
      </g>
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M26.4 11.1A9 9 0 1 0 26.4 23.9" strokeWidth="4.2" />
        <path d="M16.6 27.2 20.4 7.8M21.2 27.2 25 7.8" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 sm:gap-3 no-underline" style={{ color: "var(--ink)" }}>
      <MarcaLogo size={34} />
      <span className="text-[20px] sm:text-[23px] font-extrabold" style={{ letterSpacing: "-0.03em" }}>
        micambio<span style={{ color: "var(--red)" }}>.cr</span>
      </span>
    </a>
  );
}
