import { entidades } from "./lib/entidades";
import { useI18n } from "./lib/i18n";
import { useTema } from "./lib/useTema";
import Header, { EstadoVentanilla } from "./components/Header";
import MejoresPrecios from "./components/MejoresPrecios";
import Calculadora from "./components/Calculadora";
import TablaEntidades from "./components/TablaEntidades";
import Combustible, { CombustibleFranja } from "./components/Combustible";
import DolarOficial from "./components/DolarOficial";
import Footer from "./components/Footer";

export default function App() {
  const { oscuro, alternar } = useTema();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bandera" aria-hidden="true" />
      <Header oscuro={oscuro} alternarTema={alternar} />
      <CombustibleFranja />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 pt-5 sm:pt-9 pb-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="min-w-0 flex flex-col gap-6 sm:gap-7">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[30px] sm:text-[40px] leading-[1.05] font-extrabold" style={{ letterSpacing: "-0.03em" }}>{t.titulo}</h1>
            <p className="m-0 text-sm sm:text-base" style={{ color: "var(--muted)" }}>{t.subtitulo(entidades.length)}</p>
            <EstadoVentanilla className="lg:hidden mt-1" />
          </div>
          <MejoresPrecios />
          <Calculadora />
          <TablaEntidades />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Combustible />
          <DolarOficial />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
