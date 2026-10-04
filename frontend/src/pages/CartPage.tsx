import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { QtyStepper } from "../components/QtyStepper";
import {
  AlertTriangle,
  ChevronLeft,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";

export default function CartPage() {
  const { lines, addItem, decreaseItem, removeItem, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  async function handlePayNow() {
    if (!tableId) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setOrderError("Please enter your name and phone number to continue.");
      return;
    }

    setSubmitting(true);
    setOrderError(null);

    try {
      const orderRes = await api.post("/orders", {
        tableId,
        items: lines.map((l) => ({
          menuItemId: l.item.id,
          quantity: l.quantity,
        })),
      });

      const order = orderRes.data;

      const [firstName, ...rest] = customerName.trim().split(" ");
      const lastName = rest.join(" ") || firstName;

      const paymentRes = await api.post("/payments/initiate", {
        orderId: order.id,
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        firstName,
        lastName,
      });

      clearCart();
      window.location.href = paymentRes.data.checkoutUrl;
    } catch (err) {
      setOrderError("Could not start payment. Please try again.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ember-100 to-ember-100/50 flex items-center justify-center">
          <ShoppingBag className="text-ember-600" size={26} />
        </div>
        <p className="text-ink/60">Your cart is empty.</p>
        <button
          onClick={() => navigate(`/menu?table=${tableId}`)}
          className="bg-ink text-cream px-5 py-2.5 rounded-full font-semibold active:scale-95 transition-transform"
        >
          Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-80">
      <header className="bg-ink/95 backdrop-blur-xl sticky top-0 z-10 px-4 py-4 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <button
          onClick={() => navigate(`/menu?table=${tableId}`)}
          aria-label="Back to menu"
          className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-cream hover:bg-white/15 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-cream text-lg tracking-wide">Your order</h1>
      </header>

      <main className="p-4 space-y-3">
        {lines.map((line) => (
          <div
            key={line.item.id}
            className="bg-paper rounded-3xl border border-line p-3.5 flex justify-between items-center gap-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{line.item.name}</p>
              <p className="text-sm text-ink/45 mt-0.5">{line.item.price} ETB each</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <QtyStepper
                quantity={line.quantity}
                onIncrement={() => addItem(line.item)}
                onDecrement={() => decreaseItem(line.item.id)}
                size="sm"
              />
              <button
                onClick={() => removeItem(line.item.id)}
                aria-label={`Remove ${line.item.name}`}
                className="text-ink/25 hover:text-red-500 transition-colors"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-paper rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-5 space-y-3.5">
        <div>
          <p className="text-xs font-semibold text-ink/40 mb-2.5 tracking-wide uppercase">
            Your details
          </p>
          <div className="space-y-2.5">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
              <input
                type="text"
                placeholder="Your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-line bg-cream/60 rounded-2xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
              <input
                type="tel"
                placeholder="Phone number (09xxxxxxxx)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-line bg-cream/60 rounded-2xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-line bg-cream/60 rounded-2xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-line">
          <span className="text-sm text-ink/50 pt-2">Total</span>
          <span className="font-display text-2xl text-ink pt-2">
            {total} <span className="text-base text-ink/40 font-semibold">ETB</span>
          </span>
        </div>

        <button
          onClick={handlePayNow}
          disabled={submitting}
          className="w-full bg-ink text-cream py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97] transition-transform duration-150 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        >
          <ShieldCheck size={18} className="text-ember" />
          {submitting ? "Processing…" : "Pay now"}
        </button>

        {orderError && (
          <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} />
            {orderError}
          </p>
        )}
      </div>
    </div>
  );
}