export default function Home() {
  return (
    <div className="
      min-h-[88vh]
      flex items-center justify-center
      px-6
      bg-green-20
    ">
      {/* Outer container to create separation */}
      <div className="
        w-full max-w-4xl
        p-6 sm:p-10
        rounded-[2.5rem]
        bg-green-100/40
      ">
        {/* Main card */}
        <div className="
          w-full
          text-center
          space-y-6
          p-10 sm:p-14
          bg-white
          rounded-3xl
          border border-green-200
        ">
          <h1 className="text-3xl sm:text-4xl font-semibold text-green-800">
            A calmer space for your mind 🌿
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Calmana helps you understand what you’re feeling and gently guides
            you toward calm — without pressure or judgment.
          </p>

          <p className="text-sm sm:text-base text-gray-500">
            Start with awareness. Then breathe. Then reflect.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/quiz"
              className="
                px-7 py-3
                rounded-full
                bg-green-600
                text-white
                font-medium
                hover:bg-green-700
                transition
              "
            >
              Take a self-check
            </a>

            <a
              href="/breathing"
              className="
                px-7 py-3
                rounded-full
                border border-green-600
                text-green-700
                font-medium
                hover:bg-green-50
                transition
              "
            >
              Begin a breathing exercise
            </a>
          </div>

          <p className="text-xs text-gray-400 pt-3">
            No pressure. No fixing. Just a moment to pause.
          </p>
        </div>
      </div>
    </div>
  );
}
