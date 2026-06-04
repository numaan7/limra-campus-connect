import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-pink-soft/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} className=" text-primary fill-primary" />
              <span className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Limra Academy
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering women and girls through creative arts and spiritual learning. 
              Stitching, Mehndi, Makeup, and Quran courses designed for ladies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: "Home", to: "/" },
                { label: "Our Courses", to: "/courses" },
                { label: "Trainers", to: "/trainers" },
                { label: "About Us", to: "/about" },
                { label: "Contact / Apply", to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Contact</h4>
            <div className="space-y-3">
              <a href="tel:+919014759463" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +91 90147 59463
              </a>
              <a href="mailto:limraacademy@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                limraacademy@gmail.com
              </a>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Local Area, Your City
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Made with <AutoAwesomeRoundedIcon sx={{ fontSize: 12 }} className="inline  text-primary fill-primary" /> for Limra Academy
          </p>
        </div>
      </div>
    </footer>
  );
}
