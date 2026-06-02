import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

const defaultTestimonials = [
  {
    id: "1",
    name: "Rabia S.",
    text: "I learned so much about mehndi art at Limra! The trainers are patient and the environment is so welcoming. Highly recommended!",
    rating: 5,
  },
  {
    id: "2",
    name: "Amina K.",
    text: "The stitching course helped me start my own tailoring business from home. Best decision I ever made!",
    rating: 5,
  },
  {
    id: "3",
    name: "Sana M.",
    text: "My daughter loves the Quran classes here. The teacher is kind and makes learning so enjoyable for kids.",
    rating: 5,
  },
  {
    id: "4",
    name: "Nida R.",
    text: "The makeup course was amazing! I can now do professional bridal makeup for my friends and family. Thank you Limra!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTestimonials(data.map((t) => ({
            id: t.id,
            name: t.name,
            text: t.text,
            rating: t.rating ?? 5,
          })));
        }
      });
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <Quote className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Student Stories</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What Our <span className="text-primary">Students</span> Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="soft-card rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "text-gold fill-gold" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-foreground italic leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-sm font-semibold text-primary">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
