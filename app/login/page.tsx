"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const C = { bg: "#EFEBE3", card: "#FFFFFF", ink: "#23231F", muted: "#8C887E", line: "#E4DFD5", pine: "#1F4E3D", out: "#C0503A" };
const DISPLAY = "'Fraunces', Georgia, serif";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError("Email or password not recognized."); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#DCD6CB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: SANS }}>
      <form onSubmit={signIn} style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 22, padding: "34px 26px", border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Magic Touch</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 26 }}>Sign in to see your finances.</div>

        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: "block", marginBottom: 6 }}>Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", fontSize: 15, marginBottom: 16, outline: "none" }}
        />
        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: "block", marginBottom: 6 }}>Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", fontSize: 15, marginBottom: 8, outline: "none" }}
        />
        {error && <div style={{ color: C.out, fontSize: 13, marginBottom: 8 }}>{error}</div>}
        <button
          type="submit" disabled={loading}
          style={{ width: "100%", marginTop: 12, border: "none", cursor: "pointer", borderRadius: 14, padding: "15px", fontSize: 15.5, fontWeight: 700, background: C.pine, color: "#fff", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
