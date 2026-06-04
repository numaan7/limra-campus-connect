import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/limra/hero-section";
import { AnnouncementTicker } from "@/components/limra/announcement-ticker";
import { AyatsSection } from "@/components/limra/ayats-section";
import { CoursesSection } from "@/components/limra/courses-section";
import { TrainersSection } from "@/components/limra/trainers-section";
import { TestimonialsSection } from "@/components/limra/testimonials-section";
import { AboutSection } from "@/components/limra/about-section";
import { ContactSection } from "@/components/limra/contact-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Limra Courses - Learn Stitching, Mehndi, Makeup & Quran" },
      { name: "description", content: "Join Limra Courses for ladies-only courses in Stitching, Mehndi, Makeup, and Quran learning." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="animate-in fade-in duration-500">
      <AnnouncementTicker />
      <HeroSection />
      <AyatsSection />
      <CoursesSection />
      <TrainersSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
