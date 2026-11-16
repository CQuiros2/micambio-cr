import { useI18n } from "../lib/i18n";

const externo = { target: "_blank", rel: "noopener noreferrer" };

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer style={{ borderTop: "1px solid var(--line)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 pb-8 flex flex-wrap justify-between gap-4 text-[13px]" style={{ color: "var(--faint)" }}>
        <p className="m-0">
          {t.pieDatos} <a href="https://www.bccr.fi.cr" {...externo}>BCCR</a> {t.pieY} <a href="https://aresep.go.cr" {...externo}>ARESEP</a>. {t.pieUso}
        </p>
        <p className="m-0">
          {t.pieHecho} <a href="https://github.com/CQuiros2" {...externo}>Cristian Quirós</a>
        </p>
      </div>
    </footer>
  );
}
