import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { LogoLockup } from "../../components/Logo";
import { AlertTriangle, ArrowRight, Lock, Phone } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      saveAuth(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (role === "MANAGER") navigate("/staff/manager");
        else if (role === "CHEF") navigate("/staff/kitchen");
        else if (role === "WAITER") navigate("/staff/waiter");
        else if (role === "CASHIER") navigate("/staff/cashier");
      else navigate("/staff/kitchen"); // fallback for now
    } catch {
      setError("Invalid phone or password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-ink">
      {/* Smooth gradient background spanning the whole screen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1a1613 0%, #2b1f16 35%, #3d2416 60%, #1f1712 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-[-15%] left-[-10%] w-[65%] h-[65%] rounded-full bg-ember/25 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[75%] h-[75%] rounded-full bg-ember-600/20 blur-[150px]" />
        <div className="absolute top-[20%] right-[5%] w-[45%] h-[45%] rounded-full bg-white/[0.04] blur-[110px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Brand panel */}
      <div className="relative z-10 md:w-1/2 flex flex-col items-center justify-center p-10">
        <LogoLockup size={100} tone="dark" className="flex-col text-center [&>div]:text-center opacity-90" />
        <p className="text-cream/35 text-sm max-w-xs text-center mt-5 leading-relaxed">
           All in one place, staff portal.
        </p>
      </div>

      {/* Form panel — cream glass card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-cream/95 backdrop-blur-2xl border border-cream/20 rounded-[2rem] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)] space-y-6">
            <div>
              <h1 className="font-display text-2xl text-ink tracking-wide">Staff login</h1>
              <p className="text-ink/45 text-sm mt-1.5">
                Sign in with your phone and password.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="relative group">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-ember transition-colors"
                  size={16}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-line bg-paper/60 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all placeholder:text-ink/30"
                />
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-ember transition-colors"
                  size={16}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full border border-line bg-paper/60 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all placeholder:text-ink/30"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-ink text-cream py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150 disabled:opacity-60 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)] group"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Log in
                  <ArrowRight
                    size={16}
                    className="text-ember group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>

            {error && (
              <div className="flex items-center gap-2 justify-center text-red-500 text-sm bg-red-50 rounded-xl py-2.5 px-3">
                <AlertTriangle size={14} className="shrink-0" />
                {error}
              </div>
            )}
          </div>

          <p className="text-center text-cream/35 text-xs mt-5">
            Having trouble? Ask your manager for a reset.
          </p>
        </div>
      </div>
    </div>
  );
}