import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, CheckCircle, MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseError, setCourseError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true)
      .then(({ data }) => setCourses(data ?? []));
  }, []);

  function toggleCourse(id: string) {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) return;
    if (selectedCourses.length < 1) {
      setCourseError("Please select at least one course.");
      return;
    }
    setCourseError("");
    setLoading(true);
    const { data: app } = await supabase
      .from("applications")
      .insert({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone,
        course_id: selectedCourses[0],
        message: formData.message || null,
      })
      .select("id")
      .single();
    if (app?.id) {
      await supabase
        .from("application_courses")
        .insert(selectedCourses.map((cid) => ({ application_id: app.id, course_id: cid })));
    }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Apply <span className="text-primary">Now</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fill in the form below and we'll get back to you with all the course details!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="soft-card rounded-2xl p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Application Received!</h3>
                <p className="text-muted-foreground">We'll contact you soon with more details.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 ..."
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Interested Courses * (select at least one)</Label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {courses.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 rounded-lg border border-border p-2 cursor-pointer hover:bg-muted/40">
                        <Checkbox
                          checked={selectedCourses.includes(c.id)}
                          onCheckedChange={() => toggleCourse(c.id)}
                        />
                        <span className="text-sm">{c.title}</span>
                      </label>
                    ))}
                  </div>
                  {courseError && <p className="text-xs text-destructive mt-1">{courseError}</p>}
                </div>
                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" className="w-full glow-btn rounded-full" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="soft-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">Near Malapally Masjid, Nizamabad Telangana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+919963860432" className="text-sm text-muted-foreground hover:text-primary">+91 99638 60432</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:support@limra.co.in" className="text-sm text-muted-foreground hover:text-primary">support@limra.co.in</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Timings</p>
                    <p className="text-sm text-muted-foreground">Mon - Sat: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="soft-card rounded-2xl overflow-hidden h-64">
              <iframe
                title="Limra Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d891.4960121105552!2d78.08173198903627!3d18.67182026949203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcddb197dbea06d%3A0x699c3b9c7017d590!2s9-18-223%2C%20Mujahed%20Nagar%2C%20Nizamabad%2C%20Telangana%20503001!5e0!3m2!1sen!2sin!4v1780590597316!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
