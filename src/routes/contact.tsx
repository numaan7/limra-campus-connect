import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "@/components/limra/contact-section";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Apply - Limra Academy" },
      { name: "description", content: "Apply for courses at Limra Academy. Contact us for Stitching, Mehndi, Makeup, and Quran learning enrollment." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="animate-in fade-in duration-500 pt-8">
      <ContactSection />
    </div>
  );
}
