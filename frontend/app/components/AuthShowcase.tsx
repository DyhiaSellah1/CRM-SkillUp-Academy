export default function AuthShowcase() {
  return (
    <section className="relative hidden overflow-hidden bg-[#0d1b3a] px-8 py-12 text-white lg:flex lg:items-center lg:px-12 xl:px-16">
      <div className="absolute inset-0">
        <div className="absolute left-[-80px] top-[60px] h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[140px] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-[-60px] top-[120px] h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.12),transparent_25%)]" />
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0d1b3a] shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 7.5A2.5 2.5 0 1 1 8 12.5A2.5 2.5 0 0 1 8 7.5Z"
                fill="currentColor"
                opacity="0.95"
              />
              <path
                d="M16 11.5A2.5 2.5 0 1 1 16 16.5A2.5 2.5 0 0 1 16 11.5Z"
                fill="currentColor"
                opacity="0.75"
              />
              <path
                d="M14.5 5A2.5 2.5 0 1 1 14.5 10A2.5 2.5 0 0 1 14.5 5Z"
                fill="currentColor"
                opacity="0.55"
              />
              <path
                d="M10.2 9.1L12.4 7.9M10.3 10.9L13.7 13.2M14.9 10L15.4 11.6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="text-2xl font-bold tracking-tight">CRM Pro</span>
        </div>

        <h1 className="max-w-md text-4xl font-bold leading-tight xl:text-5xl">
          Gérez vos relations clients comme un pro
        </h1>

        <p className="mt-6 max-w-lg text-base leading-8 text-slate-200 xl:text-lg">
          Une solution complète pour suivre vos contacts, gérer votre pipeline
          commercial et automatiser vos campagnes marketing.
        </p>

        <div className="mt-14 grid max-w-md grid-cols-3 gap-6">
          <div>
            <p className="text-4xl font-extrabold text-emerald-400">10K+</p>
            <p className="mt-1 text-sm text-slate-300">Utilisateurs actifs</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-cyan-400">98%</p>
            <p className="mt-1 text-sm text-slate-300">Satisfaction client</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-sky-400">24/7</p>
            <p className="mt-1 text-sm text-slate-300">Support technique</p>
          </div>
        </div>
      </div>
    </section>
  );
}