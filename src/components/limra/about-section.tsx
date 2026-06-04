import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Link } from "@tanstack/react-router";
import { Users, BookOpen, Award, ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
              <AutoAwesomeRoundedIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Empowering Women Through <span className="text-primary">Art & Knowledge</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Limra Academy is a local initiative founded with a vision to provide quality skill-based education 
              for women and girls in a safe, comfortable, and supportive environment. We believe every woman 
              deserves the opportunity to learn, grow, and become financially independent.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From the intricate art of Mehndi to the precision of stitching, the creativity of makeup artistry, 
              to the spiritual journey of Quran learning — we nurture talents and build confidence.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Users className="h-5 w-5" />, label: "500+", sub: "Students" },
                { icon: <BookOpen className="h-5 w-5" />, label: "4", sub: "Courses" },
                { icon: <Award className="h-5 w-5" />, label: "5+", sub: "Years" },
                { icon: <AutoAwesomeRoundedIcon className="h-5 w-5" />, label: "100%", sub: "Ladies Only" },
              ].map((stat, i) => (
                <div key={i} className="soft-card rounded-xl p-4 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                    {stat.icon}
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            <Link to="/contact">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow-btn hover:shadow-xl transition-all">
                Join Us Today
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="soft-card rounded-2xl p-4 bg-primary/5">
                  <p className="text-sm font-medium text-primary mb-1">Our Mission</p>
                  <p className="text-xs text-muted-foreground">To empower women through creative skills and Islamic knowledge.</p>
                </div>
                <div className="soft-card rounded-2xl p-4 bg-lavender-soft/50">
                  <p className="text-sm font-medium text-lavender mb-1">Our Vision</p>
                  <p className="text-xs text-muted-foreground">A community where every woman is skilled and self-reliant.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="soft-card rounded-2xl p-4 bg-pink-soft">
                  <p className="text-sm font-medium text-pink-warm mb-1">Values</p>
                  <p className="text-xs text-muted-foreground">Faith, creativity, sisterhood, and excellence.</p>
                </div>
                <div className="soft-card rounded-2xl p-4 bg-cream">
                  <p className="text-sm font-medium text-gold mb-1">Promise</p>
                  <p className="text-xs text-muted-foreground">Personal attention and quality teaching for every student.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
