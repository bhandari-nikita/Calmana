import Image from "next/image";
import FAQ from "@/components/FAQ";

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-4xl font-semibold text-[#2f5d4a] text-center mt-10 flex justify-center items-center gap-2">
        About{" "}
        <Image
          src="/assets/Calmana_green.png" // 👈 use your logo file name here
          alt="Calmana logo"
          width={160} // adjust size as per your logo design
          height={50}
          className="inline-block"
        />
      </h1>

      <p className="text-center text-[#4e937a] mt-4 max-w-2xl mx-auto leading-relaxed px-4">
        Calmana is your digital wellness companion, created to help users nurture
        emotional balance and mental clarity. It offers interactive tools like mood
        tracking, self-reflection journals, daily affirmations, and mental health
        quizzes — all designed with a calming green interface to promote peace of
        mind and positivity.
      </p>

      {/* FAQ section appears here */}
      <FAQ />
    </div>
  );
}
