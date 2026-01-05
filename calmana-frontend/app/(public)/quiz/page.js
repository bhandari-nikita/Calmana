// calmana-frontend/app/quiz/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizList() {
  const [openIndex, setOpenIndex] = useState(null);
  const router = useRouter();

  const quizSets = [
    // {
    //   slug: "combined",
    //   title: "Combined Self-Check",
    //   emoji: "🧠",
    //   time: "4 min",
    //   questionsCount: 24,
    //   description:
    //     "A gentle overview covering stress, anxiety, depression, burnout, sleep health, and self-esteem.",
    //   questions: [
    //     "I feel overwhelmed by my responsibilities.",
    //     "I find it hard to relax even when I try.",
    //     "I feel sad or low most days.",
    //     "I feel emotionally drained by work or studies.",
    //   ],
    // },
    {
      slug: "stress",
      title: "Stress Check",
      emoji: "🌿",
      time: "2 min",
      questionsCount: 8,
      description:
        "Understand how much daily pressure or tension you may be experiencing.",
      questions: [
        "I feel overwhelmed by daily responsibilities.",
        "Small tasks feel exhausting.",
        "I feel tense or on edge.",
      ],
    },
    {
      slug: "anxiety",
      title: "Anxiety Check",
      emoji: "😟",
      time: "2 min",
      questionsCount: 8,
      description:
        "Explore worrying patterns or restlessness that may suggest anxiety.",
      questions: [
        "I worry more than I should.",
        "I find it difficult to control my worrying.",
        "I feel restless or uneasy.",
      ],
    },
    {
      slug: "depression",
      title: "Depression Quiz",
      emoji: "💔",
      time: "2 min",
      questionsCount: 8,
      description:
        "A gentle self-check for low mood, fatigue, and loss of interest.",
      questions: [
        "I feel sad or empty most days.",
        "I have lost interest in activities I once enjoyed.",
        "I feel tired even after sleeping enough.",
      ],
    },
    {
      slug: "burnout",
      title: "Burnout Quiz",
      emoji: "🔥",
      time: "2 min",
      questionsCount: 8,
      description:
        "Assess whether long-term stress from work or studies may be leading to burnout.",
      questions: [
        "I feel emotionally drained after daily activities.",
        "I struggle to start tasks due to exhaustion.",
        "I feel mentally worn out most days.",
      ],
    },

    {
      slug: "sleep-health",
      title: "Sleep Health Quiz",
      emoji: "😴",
      time: "2 min",
      questionsCount: 8,
      description: "Explore your sleep quality, consistency, and how well you rest at night.",
      questions: [
        "I have trouble falling asleep.",
        "I wake up during the night and struggle to sleep again.",
        "I don’t feel fresh after waking up.",
      ],
    },

    {
      slug: "self-esteem",
      title: "Self-Esteem Quiz",
      emoji: "💛",
      time: "2 min",
      questionsCount: 8,
      description: "Understand your current self-worth and confidence levels through this brief reflection quiz.",
      questions: [
        "I feel confident in my abilities.",
        "I appreciate my strengths and achievements.",
        "I believe I am worthy of love and respect.",
      ],
    },
  ];

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-[#f5fff5] pt-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-[#2f5d4a] mb-3">
          Mental Health Self-Checks
        </h1>
        <p className="text-center text-sm text-[#4e937a] mb-8">
          Short, reflective quizzes to help you understand how you’re feeling.
        </p>

        {/* Quiz Cards */}
        <div className="space-y-5 pb-6">
          {quizSets.map((set, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={set.slug}
                className={`bg-white rounded-2xl border transition-all duration-200
                  ${
                    isOpen
                      ? "border-[#4e937a] shadow-md"
                      : "border-[#e2f0e2] hover:shadow-md hover:-translate-y-0.5"
                  }`}
              >
                {/* Card Header */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{set.emoji}</div>
                    <div>
                      <h2 className="font-medium text-[#2f5d4a]">
                        {set.title}
                      </h2>
                      <p className="text-xs text-[#4e937a]">
                        {set.time} • {set.questionsCount} questions
                      </p>
                    </div>
                  </div>

                  {/* Plus / Minus */}
                  <span className="w-8 h-8 flex items-center justify-center rounded-full border border-[#a8d5ba] text-[#4e937a] text-lg">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* Card Body */}
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#2f5d4a]">
                    <p className="mb-4">{set.description}</p>

                    <ul className="space-y-2 list-disc pl-5">
                      {set.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>

                    <button
                      onClick={() => router.push(`/quiz/${set.slug}`)}
                      className="mt-6 w-full sm:w-auto bg-[#4e937a] text-white px-6 py-2 rounded-xl hover:bg-[#3d7b64] transition"
                    >
                      Start Quiz
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
