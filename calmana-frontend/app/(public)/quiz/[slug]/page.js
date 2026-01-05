//calmana-frontend/app/quiz/[slug]/page.js
"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const QUIZ_SETS = [
    {
        slug: "stress",
        title: "🌿 Stress Quiz",
        questions: [
            "I feel overwhelmed by my daily responsibilities.",
            "I find it hard to relax even when I try.",
            "Small tasks feel exhausting or difficult to start.",
            "I feel like I don’t have enough time to finish things.",
            "I get irritated or frustrated easily.",
            "I feel tense or on edge without a clear reason.",
            "I carry stress in my body (e.g., shoulders, neck, stomach).",
            "I feel mentally tired even after resting.",
        ],
    },

    // {
    //     slug: "combined",
    //     title: "🧠 Combined Self-Check",
    //     questions: [
    //         "I feel overwhelmed by my responsibilities.",
    //         "I find it hard to relax even when I try.",
    //         "I worry about things even when there is no clear reason.",
    //         "I feel restless or find it hard to sit still.",
    //         "I feel sad or low most days.",
    //         "I have lost interest in things I used to enjoy.",
    //         "I feel emotionally drained by my studies/work.",
    //         "I feel detached or indifferent about tasks I used to care about.",
    //         "I have trouble falling asleep at night.",
    //         "I wake up during the night and have trouble returning to sleep.",
    //         "I generally feel confident in my abilities.",
    //         "I accept myself even when I make mistakes.",
    //     ],
    // },

    {
        slug: "anxiety",
        title: "🌬️ Anxiety Quiz",
        questions: [
            "I find it difficult to control my worrying.",
            "I feel restless or unable to sit still.",
            "I overthink situations and imagine worst outcomes.",
            "My heart races or palms sweat when anxious.",
            "I avoid situations because they make me nervous.",
            "I have difficulty concentrating due to worry.",
            "I experience sudden feelings of fear or panic.",
             "I feel physical symptoms (like tight chest, nausea, or dizziness) even when there is no real danger.",
        ],
    },

    {
        slug: "depression",
        title: "☁️ Depression Quiz",
        questions: [
            "I feel sad or empty most days.",
            "I have lost interest in activities I once enjoyed.",
            "I feel tired even after sleeping enough.",
            "I find it hard to stay motivated.",
            "I feel worthless or not good enough.",
            "I struggle to concentrate on things.",
            "I withdraw from social activities or people.",
            "I feel hopeless about the future.",
        ],
    },

    {
        slug: "burnout",
        title: "🔥 Burnout Quiz",
        questions: [
            "I feel emotionally drained after daily activities.",
            "I feel detached or distant from my work/studies.",
            "I struggle to start tasks because I feel exhausted.",
            "I feel like my effort does not make a difference.",
            "I lose interest in things related to work/studies.",
            "I push myself even when I feel exhausted.",
            "I feel cynical or negative about responsibilities.",
            "I feel mentally worn out most days.",
        ],
    },

    {
        slug: "sleep-health",
        title: "😴 Sleep Health Quiz",
        questions: [
            "I have trouble falling asleep.",
            "I wake up during the night and struggle to sleep again.",
            "I don’t feel fresh after waking up.",
            "My sleep schedule changes frequently.",
            "I stay awake worrying or thinking too much.",
            "I feel sleepy during the day.",
            "I use my phone or devices late at night.",
            "I wake up earlier than intended and feel tired.",
        ],
    },

    {
        slug: "self-esteem",
        title: "💛 Self-Esteem Quiz",
        questions: [
            "I feel confident in my abilities.",
            "I appreciate my strengths and achievements.",
            "I believe I am worthy of love and respect.",
            "I accept myself even with my flaws.",
            "I avoid comparing myself negatively with others.",
            "I feel proud of who I am becoming.",
            "I trust myself to handle challenges.",
            "I feel good about my decisions and actions.",
        ],
    },
];

/* ---------------- SUGGESTION ENGINE ---------------- */

function getSuggestions(level, quizSlug) {
    const suggestions = {
        stress: {
            Low: [
                "Keep up your self-care habits—they are working well.",
                "Continue taking short breaks to stay balanced.",
            ],
            Mild: [
                "Take short breaks during study or work.",
                "Practice a 2–3 minute breathing exercise.",
                "Try stretching to release physical tension.",
            ],
            Moderate: [
                "Start a daily relaxation routine.",
                "Break tasks into smaller steps.",
                "Reduce screen time and avoid multitasking.",
            ],
            High: [
                "Reduce your workload temporarily.",
                "Talk to someone you trust about your stress.",
                "Try grounding techniques and relaxation exercises.",
            ],
        },

        anxiety: {
            Low: [
                "Maintain healthy routines—they're helping.",
                "Practice slow breathing when needed.",
            ],
            Mild: [
                "Try grounding techniques during worry.",
                "Write down your thoughts to reduce overthinking.",
            ],
            Moderate: [
                "Create structure to reduce uncertainty.",
                "Practice 4-7-8 or box breathing.",
                "Limit caffeine and screen time.",
            ],
            High: [
                "Talk to someone you trust about your feelings.",
                "Use grounding exercises (5-4-3-2-1).",
                "If anxiety affects daily life, consider professional help.",
            ],
        },

        depression: {
            Low: [
                "Continue activities you enjoy.",
                "Keep healthy sleep and routine habits.",
            ],
            Mild: [
                "Try engaging in small enjoyable activities.",
                "Spend short time in sunlight or nature.",
            ],
            Moderate: [
                "Break tasks into very small steps.",
                "Talk to a trusted friend or family member.",
                "Try journaling your emotions.",
            ],
            High: [
                "Reach out to someone you trust.",
                "Practice grounding and gentle routines.",
                "Seek professional help if sadness persists.",
            ],
        },

        burnout: {
            Low: [
                "Maintain your healthy balance between work and rest.",
            ],
            Mild: [
                "Take micro-breaks every hour.",
                "Reduce energy-draining tasks.",
            ],
            Moderate: [
                "Set workload boundaries.",
                "Prioritize rest and reduce commitments for a bit.",
                "Focus on one task at a time.",
            ],
            High: [
                "You need rest urgently—slow down.",
                "Talk to a friend or mentor for support.",
                "Consider professional guidance if burnout feels deep.",
            ],
        },

        "sleep-health": {
            Low: [
                "Maintain your sleep routine.",
                "Avoid screens 30 minutes before bed.",
            ],
            Mild: [
                "Relax before sleep (stretching or reading).",
                "Keep consistent sleep and wake times.",
            ],
            Moderate: [
                "Limit screen exposure at night.",
                "Avoid heavy meals earlier in the evening.",
                "Create a calming bedtime routine.",
            ],
            High: [
                "Reduce device usage at night.",
                "Avoid caffeine in the evening.",
                "Consider consulting a doctor if sleep issues continue.",
            ],
        },

        "self-esteem": {
            Low: [
                "Keep appreciating your strengths.",
                "Celebrate your small wins.",
            ],
            Mild: [
                "Practice positive self-talk.",
                "Avoid negative comparisons with others.",
            ],
            Moderate: [
                "Write down things you like about yourself.",
                "Do activities you're confident in.",
                "Stay around supportive people.",
            ],
            High: [
                "Talk kindly to yourself—you are worthy.",
                "Challenge negative thoughts with facts.",
                "Seek support if self-esteem feels very low.",
            ],
        },

        combined: {
            Low: [
                "Maintain balance in your emotional habits.",
            ],
            Mild: [
                "Follow simple routines: sleep, hydration, breathing.",
            ],
            Moderate: [
                "Reassess your workload and habits.",
                "Try journaling for self-awareness.",
                "Use Calmana tools regularly.",
            ],
            High: [
                "Reduce workload and talk to someone you trust.",
                "You may need additional emotional support.",
                "Consider professional help if it feels too heavy.",
            ],
        },
    };

    return suggestions[quizSlug]?.[level] || [];
}

/* ---------------- LEVEL ENGINE ---------------- */

function getLevel(percentage) {
    // Simple thresholds: you can tweak later
    if (percentage <= 25) return "Low";
    if (percentage <= 50) return "Mild";
    if (percentage <= 75) return "Moderate";
    return "High";
}

export default function QuizRunner({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { slug } = resolvedParams;

    const set = useMemo(() => QUIZ_SETS.find((s) => s.slug === slug), [slug]);

    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // MODAL state
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        if (set) {
            setAnswers(new Array(set.questions.length).fill(null));
        }
    }, [set]);

    const getToken = () =>
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!set) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Quiz not found.</p>
            </div>
        );
    }

    const totalAnswered = answers.filter((a) => a !== null).length;
    const progress = Math.round((totalAnswered / set.questions.length) * 100);

    function handleAnswer(i, value) {
        const next = [...answers];
        next[i] = value;
        setAnswers(next);
    }

    function computeScore() {
        const values = answers.map((v) => (typeof v === "number" ? v : 0));
        const score = values.reduce((a, b) => a + b, 0);
        const maxScore = set.questions.length * 3;
        const percentage = Math.round((score / maxScore) * 100);
        const level = getLevel(percentage);

        const answersFull = values.map((v, i) => ({
            question: set.questions[i],
            value: v,
            index: i,
        }));

        return { score, maxScore, percentage, level, answersFull };
    }

    const { score, maxScore, percentage, level, answersFull } = computeScore();
    const suggestions = getSuggestions(level, set.slug);

    function getISTDateKey() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}


    async function handleSubmit(e) {
        e.preventDefault();

        if (answers.some((a) => a === null)) {
            alert("Please answer all questions before submitting.");
            return;
        }

        const token = getToken();

        // ❤️ Not logged-in user → show result but DO NOT save
        if (!token) {
            setModalData({
                type: "success",
                title: "Your Result",
                score,
                maxScore,
                level,
                percentage,
                suggestions,
            });
            setShowModal(true);
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quizSlug: set.slug,
                    quizTitle: set.title,
                    answers: answersFull,
                    score,
                    maxScore,
                    percentage,
                    level,
                    dateKey: getISTDateKey(), // ⭐ ADD THIS LINE
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setModalData({
                    type: "error",
                    title: "Can't Save Result",
                    message:
                        data.error === "COOLDOWN"
                            ? "You have already taken this quiz in the last 24 hours. Please try again tomorrow."
                            : data.error || "Something went wrong.",
                    suggestions: [],
                });
                setShowModal(true);
                return;
            }
            else {
                setModalData({
                    type: "success",
                    title: "Your Result",
                    score,
                    maxScore,
                    level,
                    percentage,
                    suggestions,
                });
                setShowModal(true);
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }

        setSubmitting(false);
    }

    /* ---------------- UI ---------------- */
    return (
        <div className="min-h-screen bg-[#f5fff5] text-[#2f5d4a] py-8 px-4 sm:px-10">
            <div className="max-w-3xl mx-auto bg-white border border-[#a8d5ba] shadow-md rounded-2xl p-6">

                {/* Title & Progress */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <h2 className="text-2xl font-semibold">{set.title}</h2>
                    <div className="text-sm text-[#4e937a]">{progress}%</div>
                </div>

                <div className="mb-5 sm:mb-4">
                    <div className="w-full bg-[#eaf7ea] rounded-full h-2">
                        <div
                            style={{ width: `${progress}%` }}
                            className="h-2 bg-[#4e937a] rounded-full transition-all"
                        ></div>
                    </div>
                </div>

                {/* Quiz Questions */}
                <form onSubmit={handleSubmit}>
                    <ol className="space-y-6">
                        {set.questions.map((q, i) => (
                            <li
                                key={i}
                                className="bg-[#f8fff8] p-5 sm:p-4 border border-[#e3f0e3] rounded-lg"
                            >
                                <div className="mb-2 font-medium">
                                    {i + 1}. {q}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-3">

                                    {[
                                        { label: "Never", value: 0 },
                                        { label: "Sometimes", value: 1 },
                                        { label: "Often", value: 2 },
                                        { label: "Always", value: 3 },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex w-full md:w-auto items-center gap-3 px-4 py-3 sm:py-2 select-none rounded-lg border cursor-pointer ${answers[i] === opt.value
                                                ? "border-[#4e937a] bg-[#e8f8ea]"
                                                : "border-transparent"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q_${i}`}
                                                checked={answers[i] === opt.value}
                                                onChange={() => handleAnswer(i, opt.value)}
                                                className="accent-[#4e937a]"
                                            />
                                            <span className="text-sm">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Score Preview */}
                    <div className="mt-6 text-sm">
                        <strong>Score: </strong> {score} / {maxScore}
                        <br />
                        <strong>Level: </strong> {level} ({percentage}%)
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#4e937a] text-white px-6 py-2 rounded-lg shadow hover:bg-[#3d7b64] transition disabled:opacity-60"
                        >
                            {submitting ? "Saving..." : "Submit & Save"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/quiz")}
                            className="bg-white border border-[#a8d5ba] px-6 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* ---------------- MODAL POPUP ---------------- */}
            {showModal && modalData && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md border border-[#a8d5ba] animate-fadeIn">

                        <h2 className="text-xl font-semibold text-[#2f5d4a] mb-2">
                            {modalData.title}
                        </h2>

                        {modalData.type === "success" && (
                            <>
                                <p className="mb-3 text-sm">
                                    <strong>Score: </strong> {modalData.score} /{" "}
                                    {modalData.maxScore}
                                </p>
                                <p className="mb-3 text-sm">
                                    <strong>Level: </strong> {modalData.level} (
                                    {modalData.percentage}%)
                                </p>

                                <h3 className="font-medium text-[#2f5d4a] mb-1">
                                    Suggestions:
                                </h3>
                                <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
                                    {modalData.suggestions.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {modalData.type === "error" && (
                            <p className="text-red-700">{modalData.message}</p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mt-4">

                            <button
                                onClick={() => (modalData.type === "success" ? router.push("/dashboard") : setShowModal(false))}
                                className="bg-[#4e937a] text-white px-4 py-2 rounded-lg w-full"
                            >
                                {modalData.type === "success"
                                    ? "Go to Dashboard"
                                    : "Close"}
                            </button>

                            {modalData.type === "success" && (
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-white border border-[#a8d5ba] px-4 py-2 w-full rounded-lg"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


