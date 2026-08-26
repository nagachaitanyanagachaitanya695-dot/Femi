import type { Metadata } from "next";

import { Faq } from "@/components/home/Faq";
import { WhatsAppSteps } from "@/components/home/WhatsAppSteps";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Help & ordering",
  description: "How to order on WhatsApp, delivery times, and answers to common questions.",
};

/**
 * Where the ordering steps and the FAQ live now that the landing page is only
 * the film. The navigation's "Help" points here; it used to point at an anchor
 * on the home page that no longer exists.
 */
export default function HelpPage() {
  return (
    <>
      <Section>
        <WhatsAppSteps />
      </Section>
      <Section id="faq" className="pt-0">
        <Faq />
      </Section>
    </>
  );
}
