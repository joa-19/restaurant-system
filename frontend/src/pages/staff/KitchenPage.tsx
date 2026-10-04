import { socket } from "../../lib/socket";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { LogoMark } from "../../components/Logo";
import { StatusPill } from "../../components/StatusPill";
import { ChefHat, Flame } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string };
  notes: string | null;
}

interface KitchenOrder {
  id: string;
  orderNumber: number;
  status: string;
  table: { tableNumber: number };
  items: OrderItem[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const res = await api.get<KitchenOrder[]>("/kitchen/orders");
    setOrders(res.data);
    setLoading(false);
  }

  useEffect(() => {
  loadOrders(); // initial load

  socket.on("orders_updated", loadOrders);

  return () => {
    socket.off("orders_updated", loadOrders);
  };
}, []);

  async function advanceStatus(orderId: string, nextStatus: string) {
    await api.put(`/kitchen/orders/${orderId}/status`, { status: nextStatus });
    loadOrders();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center gap-2 text-cream/50">
        <Flame className="animate-pulse text-ember" size={20} />
        Loading orders…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink p-4">
      <div className="flex items-center gap-3 mb-5">
        <LogoMark size={36} />
        <div>
          <h1 className="font-display text-cream text-lg tracking-wide">Kitchen</h1>
          <p className="text-cream/40 text-xs">{orders.length} active orders</p>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 mt-20 text-cream/30">
          <ChefHat size={32} />
          <p>No active orders right now.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-ink-soft border border-ink-line rounded-2xl p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-display text-cream text-xl tracking-wide">
                #{order.orderNumber}
              </span>
              <span className="text-sm text-cream/50">Table {order.table.tableNumber}</span>
            </div>

            <ul className="text-sm mb-4 space-y-1.5 flex-1">
              {order.items.map((item) => (
                <li key={item.id} className="text-cream/80 flex gap-1.5">
                  <span className="font-semibold text-ember">{item.quantity}×</span>
                  {item.menuItem.name}
                  {item.notes && <span className="text-cream/40"> — {item.notes}</span>}
                </li>
              ))}
            </ul>

            <div className="mb-3">
              <StatusPill status={order.status} />
            </div>

            {order.status === "CONFIRMED" && (
              <button
                onClick={() => advanceStatus(order.id, "PREPARING")}
                className="w-full bg-ember text-ink py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
              >
                Start preparing
              </button>
            )}

            {order.status === "PREPARING" && (
              <button
                onClick={() => advanceStatus(order.id, "READY")}
                className="w-full bg-basil text-cream py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
              >
                Mark ready
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
