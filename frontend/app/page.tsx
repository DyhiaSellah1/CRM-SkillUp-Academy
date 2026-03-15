export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* Partie gauche */}
        <div className="relative overflow-hidden bg-[#0f172a] text-white">
          {/* Effets de fond */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_65%_75%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.12),transparent_20%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1324] via-[#13203a] to-[#09111f]" />

          <div className="relative z-10 flex h-full flex-col justify-between px-8 py-10 sm:px-12 lg:px-16 lg:py-14">
            <div>
              <div className="mb-16 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                  <span className="text-lg font-bold">✦</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">CRM Pro</h1>
                  <p className="text-sm text-slate-300">SkillUp Academy</p>
                </div>
              </div>

              <div className="max-w-xl">
                <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-emerald-300 backdrop-blur">
                  Solution CRM moderne pour vos équipes
                </p>

                <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                  Gérez vos relations clients
                  <br />
                  <span className="text-emerald-400">comme un pro</span>
                </h2>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                  Centralisez vos contacts, suivez vos opportunités, pilotez votre
                  pipeline commercial et automatisez vos campagnes marketing dans
                  une seule plateforme élégante et performante.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="/register"
                    className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                  >
                    Commencer gratuitement
                  </a>
                  <a
                    href="/login"
                    className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Se connecter
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-emerald-400">10K+</p>
                <p className="mt-1 text-sm text-slate-300">Utilisateurs actifs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">98%</p>
                <p className="mt-1 text-sm text-slate-300">Satisfaction client</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-sky-400">24/7</p>
                <p className="mt-1 text-sm text-slate-300">Support technique</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partie droite */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Plateforme CRM
              </p>
              <h3 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                La page d’accueil de votre solution
              </h3>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                Une interface claire, professionnelle et moderne pour présenter
                votre produit avant l’authentification de l’utilisateur.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  📇
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Gestion des contacts
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Centralisez les informations clients, organisez vos fiches et
                  accédez rapidement aux données essentielles.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  📈
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Suivi du pipeline
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Visualisez chaque étape de vos opportunités commerciales et
                  améliorez votre taux de conversion.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  🏢
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Entreprises & comptes
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Associez vos contacts à leurs entreprises et gardez une vue
                  d’ensemble sur votre portefeuille client.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  ✉️
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Automatisation marketing
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Déclenchez des actions, campagnes et communications pour gagner
                  du temps au quotidien.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h5 className="text-xl font-bold">
                    Prêt à transformer votre gestion client ?
                  </h5>
                  <p className="mt-1 text-sm text-slate-300">
                    Accédez à une expérience fluide, rapide et pensée pour les équipes commerciales.
                  </p>
                </div>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Créer un compte
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}