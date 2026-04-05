import Header from "./components/Header";
import TipoCambio from "./components/TipoCambio";
import Combustible from "./components/Combustible";
import Curiosity from "./components/Curiosity";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex flex-col">
        <TipoCambio />
        <div className="border-t border-gray-100" />
        <Combustible />
        <div className="border-t border-gray-100" />
        <Curiosity />
      </main>
      <Footer />
    </div>
  );
}
