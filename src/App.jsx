import { useState, useEffect } from "react";
import Header from "./components/Header";
import Calculadora from "./components/Calculadora";
import TipoCambio from "./components/TipoCambio";
import Combustible from "./components/Combustible";
import Curiosity from "./components/Curiosity";
import Footer from "./components/Footer";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const html = document.documentElement;
    isDark ? html.classList.add("dark") : html.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <div className="app-shell min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <main className="flex-1 flex flex-col">
        <Calculadora />
        <div className="section-divider" />
        <TipoCambio />
        <div className="section-divider" />
        <Combustible />
        <div className="section-divider" />
        <Curiosity />
      </main>
      <Footer />
    </div>
  );
}
