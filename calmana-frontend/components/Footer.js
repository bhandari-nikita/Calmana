// calmana-frontend/components/Footer.js
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#d4f0d4] border-t border-[#a8d5ba] text-[#2f5d4a] mt-1">

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 md:grid-cols-3 gap-12 md:divide-x md:divide-[#a8d5ba]">


        {/* Brand */}
        <div className="space-y-4">
          <Image
            src="/assets/Calmana_green.png"
            alt="Calmana logo"
            width={140}
            height={42}
            priority
          />

          <div className="w-10 h-1 bg-[#4e937a] rounded-full"></div>

          <p className="text-sm leading-relaxed">
            A gentle space for self-reflection, emotional wellness, and mindful living.
          </p>

          <p className="text-sm text-[#2f5d4a]/80">
            Understand your emotions. Move toward balance.
          </p>
        </div>

        {/* Explore */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold uppercase tracking-wide">
            Explore
          </h3>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">

            {[
              ["Home", "/"],
              ["Self-Check Quiz", "/quiz"],
              ["Journal", "/journal"],
              ["Mood Tracker", "/mood-tracker"],
              ['Breathing Exercises', '/breathing'],
              ["FAQs", "/about"],
              ["Affirmations", "/affirmations"],
              ["Support", "/support"],
            ].map(([label, link]) => (
              <li key={link}>
                <a
                  href={link}
                  className="inline-block transition hover:text-[#4e937a] hover:translate-x-1"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Note */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold uppercase tracking-wide">
            Important Note
          </h3>
          <p className="text-sm leading-relaxed">
            Calmana provides self-help tools and emotional wellness resources.
            It is not a replacement for professional therapy, diagnosis, or medical care.
          </p>
          <p className="text-xs text-[#2f5d4a]/70">
            If you are in distress, please consider reaching out to a qualified professional.
          </p>
        </div>
      </div>

      {/* Bottom Bar (slightly darker for separation) */}
      <div className="bg-[#cbe7cb] border-t border-[#a8d5ba] py-4 text-center text-xs sm:text-sm">
        © {new Date().getFullYear()} Calmana • All rights reserved
      </div>
    </footer>
  );
}
