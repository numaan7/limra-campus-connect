import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";

export function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<{ title: string; content: string }[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("title, content")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements([
            { title: "New Batch Starting", content: "New Mehndi & Stitching batches starting this Monday! Enroll now!" },
            { title: "Quran Classes", content: "Special Quran Tajweed classes available for beginners." },
            { title: "Makeup Workshop", content: "Bridal makeup workshop this weekend - Limited seats!" },
          ]);
        }
      });
  }, []);

  const text = announcements.map((a) => `${a.title}: ${a.content}`).join("  \u2726  ");

  return (
    <div className="bg-primary/10 border-b border-primary/20 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4 py-2 bg-primary/20 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
            News
          </span>
        </div>
        <div className="overflow-hidden flex-1 py-2">
          <div className="marquee-track whitespace-nowrap text-sm text-primary/80">
            {text} &nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp; {text}
          </div>
        </div>
      </div>
    </div>
  );
}
