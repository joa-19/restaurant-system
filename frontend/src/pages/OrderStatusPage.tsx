import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { LogoMark } from "../components/Logo";
import { AlertTriangle, CheckCircle2, Flame, RotateCw } from "lucide-react";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [status, setStatus] = useState<string>("CHECKING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function checkPayment() {
      try {
        await api.post(`/payments/verify/${orderId}`);
      } catch {
        // ignore — might already be verified
      }

      const res = await api.get(`/orders/${orderId}`);
      setStatus(res.data.status);
    }

    checkPayment().catch(() => setError("Could not check order status."));
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertTriangle className="text-ember-600" size={28} />
        <p className="text-ink/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <LogoMark size={56} className="mb-6" />

      {status === "CHECKING" && (
        <>
          <Flame className="text-ember animate-pulse mb-3" size={30} />
          <p className="text-ink/60">Checking your payment…</p>
        </>
      )}

      {status === "CONFIRMED" && (
        <>
          <div className="w-16 h-16 rounded-full bg-basil-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="text-basil" size={32} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-1 tracking-wide">
            Payment successful
          </h1>
          <p className="text-ink/50">Order #{orderId?.slice(0, 8)}</p>
          <p className="text-sm text-ink/40 mt-2 max-w-xs">
            Your order has been sent to the kitchen. Sit tight — it's on the way.
          </p>
        </>
      )}

      {status === "PENDING_PAYMENT" && (
        <>
          <div className="w-16 h-16 rounded-full bg-ember-100 flex items-center justify-center mb-4">
            <RotateCw className="text-ember-600" size={28} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-1 tracking-wide">
            Payment not confirmed
          </h1>
          <p className="text-ink/50 text-sm max-w-xs">
            If you completed payment, this may take a moment. Try refreshing.
          </p>
        </>
      )}
    </div>
  );
}
