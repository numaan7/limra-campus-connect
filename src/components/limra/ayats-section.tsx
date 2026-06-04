import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { BookOpen } from "lucide-react";

const ayats = [
  {
    arabic: "\u0648\u064e\u0642\u064f\u0644\u0652 \u0631\u064e\u0628\u0651\u0650\u064a \u0632\u0650\u062f\u0652\u0646\u0650\u064a \u0639\u0650\u0644\u0652\u0645\u064b\u0627",
    text: "And say: My Lord, increase me in knowledge.",
    ref: "Quran 20:114",
  },
  {
    arabic: "\u0641\u064e\u0625\u0650\u0646\u0651\u064e \u0645\u064e\u0639\u064e \u0627\u0644\u0652\u0639\u064f\u0633\u0652\u0631\u0650 \u064a\u064f\u0633\u0652\u0631\u064b\u0627",
    text: "Indeed, with hardship [will be] ease.",
    ref: "Quran 94:5",
  },
  {
    arabic: "\u0631\u064e\u0628\u0651\u0650\u064a \u0627\u0634\u0652\u0631\u064e\u062d\u0652 \u0644\u0650\u064a \u0635\u064e\u062f\u0652\u0631\u0650\u064a",
    text: "My Lord, expand for me my chest [with assurance].",
    ref: "Quran 20:25",
  },
];

const hadiths = [
  {
    text: "Seeking knowledge is an obligation upon every Muslim.",
    ref: "Sunan Ibn Majah",
  },
  {
    text: "The best of you are those who learn the Quran and teach it.",
    ref: "Sahih al-Bukhari",
  },
];

export function AyatsSection() {
  return (
    <section className="py-16 md:py-24 bg-lavender-soft/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Daily Inspiration</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Words of <span className="text-primary">Wisdom</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ayats.map((ayat, i) => (
            <div
              key={i}
              className="soft-card rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-shadow"
            >
              <p className="text-2xl md:text-3xl leading-loose text-foreground mb-4" dir="rtl">
                {ayat.arabic}
              </p>
              <p className="text-muted-foreground italic mb-2">"{ayat.text}"</p>
              <p className="text-xs font-semibold text-primary">{ayat.ref}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hadiths.map((hadith, i) => (
            <div
              key={i}
              className="soft-card rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <AutoAwesomeRoundedIcon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-foreground italic mb-2">"{hadith.text}"</p>
                <p className="text-xs font-semibold text-primary">{hadith.ref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
