import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import RiverMap from "./components/RiverMap";
import AIPredictor from "./components/AIPredictor";
import CitizenReport from "./components/CitizenReport";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <RiverMap />
      <AIPredictor />
      <CitizenReport />
    </>
  );
}

export default App;