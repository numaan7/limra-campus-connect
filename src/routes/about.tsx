import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/limra/about-section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us - Limra Academy" },
      { name: "description", content: "Learn about Limra Academy's mission to empower women through creative arts and Quran education." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <AboutSection />
    </div>
  );
}
