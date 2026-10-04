import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { LogoMark } from "../../components/Logo";
import { QtyStepper } from "../../components/QtyStepper";
import { StatusPill } from "../../components/StatusPill";
import { Banknote, CreditCard, ReceiptText } from "lucide-react";

interface Table {
  id: string;
  tableNumber: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
}

interface PaymentInfo {
  paymentMethod: string;
  status: string;
}

interface OrderRow {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
  table: { tableNumber: number };
  payment: PaymentInfo | null;
}

export default function CashierPage() {
  const [tab, setTab] = useState<"payments" | "new">("payments");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function loadPayments() {
  try {
    const res = await api.get<OrderRow[]>("/cashier/payments");
    setOrders(res.data);
  } catch (err) {
    console.error("Failed to load payments:", err);
  }
}

async function loadFormData() {
  try {
    const [t, m] = await Promise.all([
      api.get<Table[]>("/cashier/tables"),
      api.get<MenuItem[]>("/cashier/menu-items"),
    ]);
    setTables(t.data);
    setMenuItems(m.data);
  } catch (err) {
    console.error("Failed to load form data:", err);
  }
}

  useEffect(() => {
    loadPayments();
    loadFormData();
  }, []);

  function updateQty(itemId: string, qty: number) {
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, qty) }));
  }

  async function submitCashOrder() {
    setMessage(null);
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    if (!selectedTable || items.length === 0) {
      setMessage("Select a table and at least one item.");
      return;
    }

    try {
      await api.post("/cashier/orders", { tableId: selectedTable, items });
      setMessage("Order created and sent to kitchen ✅");
      setCart({});
      setSelectedTable("");
      loadPayments();
    } catch {
      setMessage("Could not create order.");
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="flex items-center gap-3 mb-5">
        <LogoMark size={36} />
        <h1 className="font-display text-ink text-lg tracking-wide">Cashier</h1>
      </div>

      <div className="flex gap-1 mb-5 bg-black/5 p-1 rounded-full w-fit">
        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            tab === "payments" ? "bg-ink text-cream" : "text-ink/50"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setTab("new")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            tab === "new" ? "bg-ink text-cream" : "text-ink/50"
          }`}
        >
          New cash order
        </button>
      </div>

      {tab === "payments" && (
        <div className="space-y-3">
          {orders.length === 0 && (
            <p className="text-ink/40 text-sm text-center mt-10">No payments yet.</p>
          )}
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-paper rounded-2xl border border-line p-3.5 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-ember-100 flex items-center justify-center shrink-0">
                  {o.payment?.paymentMethod?.toUpperCase().includes("CASH") ? (
                    <Banknote className="text-ember-600" size={16} />
                  ) : (
                    <CreditCard className="text-ember-600" size={16} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">
                    #{o.orderNumber} — Table {o.table.tableNumber}
                  </p>
                  <p className="text-sm text-ink/40">{o.total} ETB</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink/40 mb-1">{o.payment?.paymentMethod ?? "—"}</p>
                <StatusPill status={o.payment?.status ?? o.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "new" && (
        <div className="bg-paper rounded-2xl border border-line p-4 space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-ink/40 mb-1.5 block">Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full border border-line bg-cream/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember"
            >
              <option value="">Select table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.tableNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/40 mb-1.5 block">Items</label>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-1.5 border-b border-line last:border-0"
                >
                  <span className="text-sm text-ink/80">
                    {item.name} <span className="text-ink/40">({item.price} ETB)</span>
                  </span>
                  <QtyStepper
                    quantity={cart[item.id] ?? 0}
                    onIncrement={() => updateQty(item.id, (cart[item.id] ?? 0) + 1)}
                    onDecrement={() => updateQty(item.id, (cart[item.id] ?? 0) - 1)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={submitCashOrder}
            className="w-full bg-ember text-ink py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ReceiptText size={16} />
            Confirm cash order
          </button>

          {message && <p className="text-sm text-center text-ink/70">{message}</p>}
        </div>
      )}
    </div>
  );
}
