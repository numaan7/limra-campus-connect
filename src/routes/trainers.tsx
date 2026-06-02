import { createFileRoute } from "@tanstack/react-router";
import { TrainersSection } from "@/components/limra/trainers-section";

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "Our Trainers - Limra Academy" },
      { name: "description", content: "Meet our experienced female trainers at Limra Academy. Expert instructors in Mehndi, Stitching, Makeup, and Quran." },
    ],
  }),
  component: TrainersPage,
});

function TrainersPage() {
  return (
    <div className="animate-in fade-in duration-500 pt-8">
      <TrainersSection />
    </div>
  );
}
