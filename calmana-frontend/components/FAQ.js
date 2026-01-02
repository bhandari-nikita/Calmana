"use client";
import { useState } from "react";

const faqs = [
  {
    question: "What is Calmana?",
    answer:
      "Calmana is your personal mental wellness companion designed to help you track moods, practice gratitude, take self-check quizzes, and maintain emotional balance.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes. Your journal entries, moods, and other personal data are stored securely and visible only to you. We value your privacy and never share data without consent.",
  },
  {
    question: "Do I need to create an account to use Calmana?",
    answer:
      "Creating an account allows you to save your progress, journal entries, and quiz results. You can explore some features without logging in as well.",
  },
  {
    question: "Can I access Calmana on my phone?",
    answer:
      "Absolutely! Calmana is fully responsive, so you can use it on any mobile, tablet, or desktop device.",
  },
  {
    question: "Is Calmana free to use?",
    answer:
      "Yes, Calmana is completely free. Our mission is to make mental health support accessible to everyone.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="max-w-4xl mx-auto my-16 px-6">
      <h2 className="text-3xl font-semibold text-[#2f5d4a] text-center mb-10">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-[#a8d5ba] rounded-2xl bg-[#d4f0d4] shadow-sm transition hover:shadow-md"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full flex justify-between items-center p-5 text-left text-[#2f5d4a] font-medium focus:outline-none"
            >
              <span>{faq.question}</span>
              <span className="text-[#4e937a] text-xl">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="p-5 pt-0 text-[#4e937a]">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
