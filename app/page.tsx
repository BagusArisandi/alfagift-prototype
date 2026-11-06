import Link from "next/link";

const menus: Array<{ id: string; name: string; url: string }> = [
  {
    id: "INIT-696",
    name: "[INIT-696] - Revamp PDP: App + Web",
    url: "/revamp-pdp-app-web",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Projects Prototype
        </h1>

        <nav aria-label="Prototype pages">
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link
                  href={menu.url}
                  className="group flex min-h-16 items-center justify-between gap-4 py-4 transition-colors hover:bg-slate-50"
                >
                  <span>{menu.name}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            Alfagift Designer
          </p>
        </nav>
      </div>
    </main>
  );
}
