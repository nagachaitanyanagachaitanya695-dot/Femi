import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { IntroVideo } from "@/components/intro/IntroVideo";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { site } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700"],
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["sanitary pads", "menstrual care", "period care", "sanitary napkins", "Femi"],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fffaf7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <head>
        {/*
          Decides before first paint whether the intro is going to play, so a
          returning visitor never sees it flash. The timeout is the safety
          net: if the app fails to boot, the cover clears itself and the shop
          is still usable.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var seen=sessionStorage.getItem('femi.intro.seen')==='1';
              var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
              if(!seen&&!still){
                document.documentElement.setAttribute('data-intro','1');
                setTimeout(function(){document.documentElement.removeAttribute('data-intro')},4000);
              }
            }catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <IntroVideo />
        <SiteProviders>
          <a
            href="#main"
            className="focus-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-femi-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <StoreChrome header={<Navbar />} footer={<Footer />}>
            {children}
          </StoreChrome>
        </SiteProviders>
      </body>
    </html>
  );
}
