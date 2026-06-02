import { createFileRoute } from "@tanstack/react-router";
import { CoursesSection } from "@/components/limra/courses-section";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Our Courses - Limra Academy" },
      { name: "description", content: "Explore our ladies-only courses: Stitching, Mehndi, Makeup Artistry, and Quran Learning at Limra Academy." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="animate-in fade-in duration-500 pt-8">
      <CoursesSection />
    </div>
  );
}
