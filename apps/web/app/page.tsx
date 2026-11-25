import { Demo } from "@/components/landing/demo";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InstallSnippet } from "@/components/landing/install-snippet";
import { Pricing } from "@/components/landing/pricing";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  return (
    <div data-surface="dark" className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Demo />
        <Pricing />
        <InstallSnippet />
      </main>
      <SiteFooter />
    </div>
  );
}
