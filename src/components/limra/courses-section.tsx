import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Clock, IndianRupee, ArrowRight, Scissors, Paintbrush, Sparkles, BookOpen } from "lucide-react";
import mehndiImg from "@/assets/course-mehndi.jpg";
import stitchingImg from "@/assets/course-stitching.jpg";
import makeupImg from "@/assets/course-makeup.jpg";
import quranImg from "@/assets/course-quran.jpg";

const defaultCourses = [
  {
    id: "mehndi",
    title: "Mehndi Art",
    description: "Master the ancient art of henna with beautiful patterns, bridal designs, and modern styles.",
    duration: "4 Weeks",
    price: "500",
    category: "mehndi",
    image_url: mehndiImg,
  },
  {
    id: "stitching",
    title: "Stitching & Tailoring",
    description: "Learn stitching, embroidery, and tailoring techniques to create your own beautiful garments.",
    duration: "4 Weeks",
    price: "500",
    category: "stitching",
    image_url: stitchingImg,
  },
  {
    id: "makeup",
    title: "Makeup Artistry",
    description: "Professional makeup techniques including bridal, party, and everyday natural looks.",
    duration: "4 Weeks",
    price: "500",
    category: "makeup",
    image_url: makeupImg,
  },
  {
    id: "quran",
    title: "Quran Learning",
    description: "Learn Quran with proper Tajweed, memorization techniques, and Islamic values for all ages.",
    duration: "4 Weeks",
    price: "500",
    category: "quran",
    image_url: quranImg,
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  mehndi: <Paintbrush className="h-5 w-5" />,
  stitching: <Scissors className="h-5 w-5" />,
  makeup: <Sparkles className="h-5 w-5" />,
  quran: <BookOpen className="h-5 w-5" />,
};

export function CoursesSection() {
  const [courses, setCourses] = useState(defaultCourses);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("courses").select("*").eq("is_active", true);
      if (data && data.length > 0) {
        const mapped = data.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          // Force homepage display values to keep prices and durations consistent
          duration: "4 Weeks",
          price: "500",
          category: c.category ?? "",
          image_url: (c.image_url ?? defaultCourses.find((d) => d.category === c.category)?.image_url) || mehndiImg,
        }));
        setCourses(mapped);
      } else {
        // If no courses in DB, persist the homepage defaults so admin can edit them later.
        try {
          await supabase.from("courses").insert(
            defaultCourses.map((c) => ({
              title: c.title,
              description: c.description,
              duration: "4 Weeks",
              price: "500",
              category: c.category,
              is_active: true,
              image_url: null,
            }))
          );
        } catch (e) {
          // ignore insertion errors (e.g., permissions) and just show defaults
        }
        setCourses(defaultCourses);
      }
    })();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our <span className="text-primary">Courses</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover your passion and learn beautiful skills in a supportive, ladies-only environment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="soft-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={typeof course.image_url === "string" ? course.image_url : course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary">
                    {categoryIcons[course.category] || <Sparkles className="h-3 w-3" />}
                    {course.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {String(course.price ?? "").trim()}
                  </span>
                </div>

                <Link to="/contact">
                  <button className="w-full rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
