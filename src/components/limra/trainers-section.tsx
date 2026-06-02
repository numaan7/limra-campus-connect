import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Award } from "lucide-react";

const defaultTrainers = [
  {
    id: "1",
    name: "Ayesha Begum",
    bio: "Expert in bridal mehndi and traditional henna art with 10+ years of experience.",
    photo_url: "",
    specialty: "Mehndi Art",
  },
  {
    id: "2",
    name: "Fatima Khan",
    bio: "Professional tailor and embroidery specialist, teaching stitching for over 8 years.",
    photo_url: "",
    specialty: "Stitching & Tailoring",
  },
  {
    id: "3",
    name: "Zara Ali",
    bio: "Certified makeup artist specializing in bridal, editorial, and natural beauty looks.",
    photo_url: "",
    specialty: "Makeup Artistry",
  },
  {
    id: "4",
    name: "Hafiza Noor",
    bio: "Qariya and Islamic studies teacher with Ijazah in Tajweed and Quran memorization.",
    photo_url: "",
    specialty: "Quran & Tajweed",
  },
];

export function TrainersSection() {
  const [trainers, setTrainers] = useState(defaultTrainers);

  useEffect(() => {
    supabase
      .from("trainers")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTrainers(data.map((t) => ({
            id: t.id,
            name: t.name,
            bio: t.bio ?? "",
            photo_url: t.photo_url ?? "",
            specialty: t.specialty ?? "",
          })));
        }
      });
  }, []);

  return (
    <section className="py-16 md:py-24 bg-pink-soft/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Expert Instructors</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Meet Our <span className="text-primary">Trainers</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn from experienced, passionate women dedicated to sharing their skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="soft-card rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-lavender/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-primary">
                  {trainer.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-1">{trainer.name}</h3>
              <p className="text-sm text-primary font-medium mb-3">{trainer.specialty}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{trainer.bio}</p>

              <div className="flex items-center justify-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-gold fill-gold" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
