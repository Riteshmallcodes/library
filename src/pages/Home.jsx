import Hero from "../components/Hero";
import About from "../components/About";
import Facilities from "../components/Facilities";
import Services from "../components/Services";
import Gallery from "../components/Gallery";
import Founder from "../components/Founder";
import Rules from "../components/Rules";
import LocationMap from "../components/LocationMap";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <main className="home-page">
      <Hero />
      <About />
      <Facilities />
      <Services />
      <Gallery />
      <Founder />
      <Rules />
      <LocationMap />
      <Contact />
    </main>
  );
}
