import { inicialesDe, logoDe } from "../lib/logos";

/**
 * Logo pequeño de una entidad, sobre un cuadro blanco (los logos están pensados
 * para fondo claro, también se ve bien en modo oscuro). Sin logo: iniciales.
 * Es decorativo: el nombre siempre va al lado como texto.
 */
export default function EntidadLogo({ nombre, size = 28 }) {
  const src = logoDe(nombre);
  const caja = { width: size, height: size, borderRadius: Math.round(size * 0.22) };

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center shrink-0 font-bold"
        style={{ ...caja, background: "var(--sunk)", color: "var(--muted)", border: "1px solid var(--line)", fontSize: Math.round(size * 0.36) }}
      >
        {inicialesDe(nombre)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 object-contain"
      style={{ ...caja, background: "#fff", border: "1px solid var(--line)", padding: Math.max(1, Math.round(size * 0.07)) }}
    />
  );
}
