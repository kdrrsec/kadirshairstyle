import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { StructuredData } from '@/components/StructuredData';
import { About } from '@/components/sections/About';
import { BookingCta } from '@/components/sections/BookingCta';
import { Contact } from '@/components/sections/Contact';
import { Experience } from '@/components/sections/Experience';
import { Gallery } from '@/components/sections/Gallery';
import { Hero } from '@/components/sections/Hero';
import { Reviews } from '@/components/sections/Reviews';
import { Treatments } from '@/components/sections/Treatments';

export default function Home() {
  return (
    <>
      <StructuredData />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Treatments />
        <Gallery />
        <Experience />
        <Reviews />
        <BookingCta />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
