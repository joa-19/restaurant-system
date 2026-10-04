import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { PublicMenuResponse } from "../types";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { QtyStepper } from "../components/QtyStepper";
import { AlertTriangle, ArrowRight, Flame, Pizza, ShoppingBag } from "lucide-react";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");

  const [data, setData] = useState<PublicMenuResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { lines, addItem, decreaseItem, total } = useCart();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!tableId) {
      setError("No table specified. Please scan your table's QR code.");
      setLoading(false);
      return;
    }

    api
      .get<PublicMenuResponse>("/public/menu", { params: { table: tableId } })
      .then((res) => {
        setData(res.data);
        setActiveCategory(res.data.categories[0]?.id ?? null);
      })
      .catch(() => setError("Could not load menu. Please try again."))
      .finally(() => setLoading(false));
  }, [tableId]);

  function scrollToCategory(id: string) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function quantityFor(itemId: string) {
    return lines.find((l) => l.item.id === itemId)?.quantity ?? 0;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 text-ink/50">
        <div className="relative">
          <Flame className="animate-pulse text-ember" size={32} />
          <div className="absolute inset-0 blur-xl bg-ember/30 rounded-full" />
        </div>
        <p className="text-sm font-medium">Firing up the menu…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-ember-100 flex items-center justify-center">
          <AlertTriangle className="text-ember-600" size={26} />
        </div>
        <p className="text-ink/70 max-w-xs">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <header className="bg-ink/95 backdrop-blur-xl sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <div className="px-4 pt-5 pb-3 flex items-center gap-3">
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
            <LogoMark size={44} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-cream text-xl tracking-wide">
              {data.restaurant.name}
            </h1>
            <p className="text-ember text-xs font-semibold mt-0.5 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
              Table {data.table.tableNumber}
            </p>
          </div>
        </div>

        {/* Category rail */}
        <nav className="flex gap-2 px-4 pb-3.5 overflow-x-auto scrollbar-none">
          {data.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-ember text-ink shadow-[0_2px_12px_rgba(255,255,255,0.15)] scale-100"
                  : "bg-white/[0.06] text-cream/60 hover:bg-white/10"
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 pt-6 space-y-9">
        {data.categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="scroll-mt-36"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="font-display text-lg tracking-wide text-ink">
                {category.name}
              </h2>
              <div className="flex-1 h-px bg-line" />
            </div>

            {category.menuItems.length === 0 ? (
              <p className="text-sm text-ink/40">Nothing in this category yet.</p>
            ) : (
              <div className="space-y-3">
                {category.menuItems.map((item) => {
                  const qty = quantityFor(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-paper rounded-3xl border p-3 flex gap-3.5 items-center transition-all duration-200 ${
                        qty > 0
                          ? "border-ember/40 shadow-[0_2px_16px_rgba(255,140,0,0.08)]"
                          : "border-line"
                      }`}
                    >
                      <div className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-ember-100 to-ember-100/50 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Pizza className="text-ember-600" size={28} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-ink/45 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <p className="text-sm font-bold text-ink mt-1.5">
                          {item.price} <span className="text-ink/40 font-semibold text-xs">ETB</span>
                        </p>
                      </div>

                      {qty > 0 ? (
                        <QtyStepper
                          quantity={qty}
                          onIncrement={() => addItem(item)}
                          onDecrement={() => decreaseItem(item.id)}
                        />
                      ) : (
                        <button
                          onClick={() => addItem(item)}
                          className="bg-ink text-cream text-sm font-semibold px-4 py-2.5 rounded-full shrink-0 active:scale-90 transition-transform duration-150 hover:bg-ink/90"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-3 pt-6 bg-gradient-to-t from-cream via-cream/90 to-transparent">
          <button
            onClick={() => navigate(`/cart?table=${tableId}`)}
            className="w-full bg-ink text-cream rounded-2xl px-5 py-4 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-[0.97] transition-transform duration-150"
          >
            <span className="flex items-center gap-2.5 font-semibold">
              <span className="bg-ember text-ink w-7 h-7 rounded-full flex items-center justify-center relative">
                <ShoppingBag size={15} />
                <span className="absolute -top-1.5 -right-1.5 bg-cream text-ink text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </span>
              View cart
            </span>
            <span className="flex items-center gap-1.5 font-bold text-ember">
              {total} ETB
              <ArrowRight size={18} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}