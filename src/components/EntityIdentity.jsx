import { useMemo, useState } from "react";
import { getEntityMetadata, getEntityInitials } from "../lib/entityMetadata";

function EntityLink({ website, className = "", style, title, children }) {
  if (!website) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}

export function EntityIdentity({ name, size = 28, showName = true, compact = false, textClassName = "", showDomain = true }) {
  const [logoSourceIndex, setLogoSourceIndex] = useState(0);
  const metadata = useMemo(() => getEntityMetadata(name), [name]);
  const initials = useMemo(() => getEntityInitials(name), [name]);

  const localLogos = Array.isArray(metadata.localLogo) ? metadata.localLogo : [];
  const remoteIcons = Array.isArray(metadata.iconCandidates) ? metadata.iconCandidates : [];
  const logoSources = [...localLogos, ...remoteIcons].filter(Boolean);
  const currentLogo = logoSources[logoSourceIndex] ?? null;
  const borderRadius = size <= 24 ? 7 : 8;
  const imageSize = Math.max(12, size - (size <= 24 ? 7 : 8));

  const logo = currentLogo ? (
    <div
      className="flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius,
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <img
        src={currentLogo}
        alt={name}
        style={{ width: imageSize, height: imageSize, objectFit: "contain", display: "block" }}
        onError={() => setLogoSourceIndex((prev) => prev + 1)}
      />
    </div>
  ) : (
    <div
      className="flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius,
        background: "var(--surface-2)",
        color: "var(--text-1)",
        border: "1px solid var(--border)",
        fontSize: size <= 24 ? 9 : 11,
        fontWeight: 700,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );

  if (!showName) {
    return (
      <EntityLink website={metadata.website} title={metadata.website ? `${name} · sitio oficial` : name}>
        {logo}
      </EntityLink>
    );
  }

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <EntityLink website={metadata.website} title={metadata.website ? `${name} · sitio oficial` : name}>
        {logo}
      </EntityLink>

      <div className="min-w-0">
        <EntityLink
          website={metadata.website}
          title={metadata.website ? `${name} · sitio oficial` : name}
          className={compact ? "block truncate" : "block"}
          style={{
            color: "var(--text-1)",
            textDecoration: "none",
          }}
        >
          <span className={textClassName} style={{ borderBottom: metadata.website ? "1px solid transparent" : "none" }}>
            {name}
          </span>
        </EntityLink>
        {showDomain && metadata.website && (
          <a
            href={metadata.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xs"
            style={{ color: "var(--text-3)", textDecoration: "none" }}
            title={metadata.website}
          >
            {metadata.domain}
          </a>
        )}
      </div>
    </div>
  );
}
