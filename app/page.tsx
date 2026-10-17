export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="font-mono text-sm uppercase tracking-widest text-memory">Scaffold / Mock data</p>
      <h1 className="text-5xl font-semibold tracking-tight">Canon</h1>
      <p className="max-w-xl text-lg">Continuity memory and monitoring for AI-generated stories.</p>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-3 text-xl font-medium">Shared skeleton ready</h2>
        <p className="mb-4 text-muted">Mara seed data, shared contracts, design tokens, and mock API routes are ready for the UI, Engine, and Data tasks.</p>
        <a className="underline" href="/api/project/mara">Inspect the Mara mock project</a>
      </div>
      <p className="text-sm text-muted">No AI requests, persistent storage, or learning are implemented in TASK 0.</p>
    </main>
  );
}
