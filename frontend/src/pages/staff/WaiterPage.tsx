import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { socket } from "../../lib/socket";
import { LogoMark } from "../../components/Logo";
import { BellRing, CheckCircle2 } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: { name: string };
}

interface WaiterOrder {
  id: string;
  orderNumber: number;
  table: { tableNumber: number };
  items: OrderItem[];
}

export default function WaiterPage() {
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const res = await api.get<WaiterOrder[]>("/waiter/orders");
    setOrders(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    socket.on("orders_updated", loadOrders);
    return () => {
      socket.off("orders_updated", loadOrders);
    };
  }, []);

  async function deliver(orderId: string) {
    await api.put(`/waiter/orders/${orderId}/deliver`);
    loadOrders();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-ink/40">
        Loading orders…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="flex items-center gap-3 mb-5">
        <LogoMark size={36} />
        <div>
          <h1 className="font-display text-ink text-lg tracking-wide">Ready for delivery</h1>
          <p className="text-ink/40 text-xs">{orders.length} tickets waiting</p>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 mt-20 text-ink/30">
          <BellRing size={32} />
          <p>No orders ready right now.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-paper rounded-2xl border border-line p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-display text-ink text-xl tracking-wide">
                #{order.orderNumber}
              </span>
              <span className="text-sm text-ink/50">Table {order.table.tableNumber}</span>
            </div>

            <ul className="text-sm mb-4 space-y-1.5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-1.5">
                  <span className="font-semibold text-ember-600">{item.quantity}×</span>
                  <span className="text-ink/70">{item.menuItem.name}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => deliver(order.id)}
              className="w-full bg-basil text-cream py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <CheckCircle2 size={16} />
              Mark delivered
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
