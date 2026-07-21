import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}