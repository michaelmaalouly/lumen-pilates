"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr("Invalid credentials");
    else router.push("/");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-serif text-2xl block text-center mb-2">
          Lumen<span className="text-[var(--accent)]">.</span>
        </Link>
        <h1 className="font-serif text-3xl text-center mb-8">Welcome back</h1>
        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-[var(--foreground)]/60">Email</label>
              <input className="w-full mt-1 border border-[var(--border)] bg-transparent p-3 rounded-lg focus:outline-none focus:border-[var(--accent)]"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[var(--foreground)]/60">Password</label>
              <input className="w-full mt-1 border border-[var(--border)] bg-transparent p-3 rounded-lg focus:outline-none focus:border-[var(--accent)]"
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-sm mt-6 text-center text-[var(--foreground)]/70">
          New here? <Link href="/signup" className="text-[var(--accent)] underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
