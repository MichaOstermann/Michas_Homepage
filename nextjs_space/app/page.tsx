
import { HeroSection } from '@/components/sections/hero-section';
import { MusicSection } from '@/components/sections/music-section';
import { PowerShellSection } from '@/components/sections/powershell-section';
import { GamingSection } from '@/components/sections/gaming-section';
import { BlogSection } from '@/components/sections/blog-section';
import { AboutSection } from '@/components/sections/about-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BackToTop } from '@/components/ui/back-to-top';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="overflow-x-hidden">
        <HeroSection />
        <MusicSection />
        <PowerShellSection />
        <GamingSection />
        <BlogSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
