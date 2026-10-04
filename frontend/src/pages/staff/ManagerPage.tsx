import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import MenuManagementTab from "./MenuManagementTab";
import { LogoMark } from "../../components/Logo";
import {
  BadgeCheck,
  BanknoteArrowUp,
  ClipboardList,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  active: boolean;
}

interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  paidOrdersCount: number;
  byPaymentMethod: Record<string, number>;
  byDate: Record<string, number>;
}

export default function ManagerPage() {
  const [tab, setTab] = useState<"sales" | "staff" | "menu">("sales");

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("WAITER");
  const [message, setMessage] = useState<string | null>(null);
 
  
  async function loadSummary() {
    try {
      const res = await api.get<SalesSummary>("/manager/sales/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load sales summary:", err);
    }
  }

  async function loadStaff() {
    try {
      const res = await api.get<StaffMember[]>("/manager/staff");
      setStaff(res.data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  }

  useEffect(() => {
    loadSummary();
    loadStaff();
  }, []);

  async function createStaff() {
    setMessage(null);
    if (!newName.trim() || !newPhone.trim() || !newPassword.trim()) {
      setMessage("Fill in all fields.");
      return;
    }
    try {
      await api.post("/manager/staff", {
        name: newName,
        phone: newPhone,
        password: newPassword,
        role: newRole,
      });
      setMessage("Staff created ✅");
      setNewName("");
      setNewPhone("");
      setNewPassword("");
      loadStaff();
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Could not create staff.");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await api.put(`/manager/staff/${id}/active`, { active: !active });
    loadStaff();
  }

  return (
    <div className="min-h-screen bg-cream p-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-2xl overflow-hidden ring-1 ring-ink/5">
          <LogoMark size={36} />
        </div>
        <h1 className="font-display text-ink text-lg tracking-wide">Manager</h1>
      </div>

      <div className="flex gap-1 mb-6 bg-ink/5 p-1 rounded-full w-fit">
        <button
          onClick={() => setTab("sales")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            tab === "sales"
              ? "bg-ink text-cream shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              : "text-ink/50 hover:text-ink/70"
          }`}
        >
          Sales
        </button>
        <button
          onClick={() => setTab("staff")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            tab === "staff"
              ? "bg-ink text-cream shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              : "text-ink/50 hover:text-ink/70"
          }`}
        >
          Staff
        </button>
        <button
          onClick={() => setTab("menu")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            tab === "menu"
              ? "bg-ink text-cream shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              : "text-ink/50 hover:text-ink/70"
          }`}
        >
          Menu
        </button>
      </div>

      {tab === "sales" && summary && (
        <div className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-paper rounded-3xl border border-line p-4 text-center hover:border-ember/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-ember-100 flex items-center justify-center mx-auto mb-2">
                <BanknoteArrowUp className="text-ember-600" size={17} />
              </div>
              <p className="text-xs text-ink/40">Total sales</p>
              <p className="font-display text-xl text-ink mt-0.5">
                {summary.totalSales} <span className="text-xs text-ink/40 font-semibold">ETB</span>
              </p>
            </div>
            <div className="bg-paper rounded-3xl border border-line p-4 text-center hover:border-ember/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-ember-100 flex items-center justify-center mx-auto mb-2">
                <ClipboardList className="text-ember-600" size={17} />
              </div>
              <p className="text-xs text-ink/40">Total orders</p>
              <p className="font-display text-xl text-ink mt-0.5">{summary.totalOrders}</p>
            </div>
            <div className="bg-paper rounded-3xl border border-line p-4 text-center hover:border-ember/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-ember-100 flex items-center justify-center mx-auto mb-2">
                <BadgeCheck className="text-ember-600" size={17} />
              </div>
              <p className="text-xs text-ink/40">Paid orders</p>
              <p className="font-display text-xl text-ink mt-0.5">{summary.paidOrdersCount}</p>
            </div>
          </div>

          <div className="bg-paper rounded-3xl border border-line p-4">
            <p className="font-semibold mb-3 text-sm text-ink flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-ember-100 flex items-center justify-center">
                <ReceiptText size={14} className="text-ember-600" />
              </span>
              By payment method
            </p>
            {Object.entries(summary.byPaymentMethod).map(([method, amount]) => (
              <div
                key={method}
                className="flex justify-between text-sm py-2 border-b border-line last:border-0"
              >
                <span className="text-ink/60">{method}</span>
                <span className="font-semibold text-ink">{amount} ETB</span>
              </div>
            ))}
          </div>

          <div className="bg-paper rounded-3xl border border-line p-4">
            <p className="font-semibold mb-3 text-sm text-ink">By date</p>
            {Object.entries(summary.byDate).map(([date, amount]) => (
              <div
                key={date}
                className="flex justify-between text-sm py-2 border-b border-line last:border-0"
              >
                <span className="text-ink/60">{date}</span>
                <span className="font-semibold text-ink">{amount} ETB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "staff" && (
        <div className="space-y-4 max-w-lg">
          <div className="bg-paper rounded-3xl border border-line p-5 space-y-3">
            <p className="font-semibold text-sm text-ink flex items-center gap-2 mb-1.5">
              <span className="w-7 h-7 rounded-lg bg-ember-100 flex items-center justify-center">
                <UserPlus size={14} className="text-ember-600" />
              </span>
              Create staff account
            </p>
            <input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <input
              placeholder="Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <input
              placeholder="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            >
              <option value="WAITER">Waiter</option>
              <option value="CHEF">Chef</option>
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
            </select>
            <button
              onClick={createStaff}
              className="w-full bg-ink text-cream py-3 rounded-2xl font-semibold active:scale-[0.97] transition-transform duration-150 shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
            >
              Create
            </button>
            {message && (
              <p className="text-sm text-center text-ink/70 bg-cream/60 rounded-xl py-2">
                {message}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            {staff.length === 0 && (
              <p className="text-ink/40 text-sm text-center flex items-center justify-center gap-1.5 py-4">
                <Users size={14} />
                No staff yet.
              </p>
            )}
            {staff.map((s) => (
              <div
                key={s.id}
                className="bg-paper rounded-2xl border border-line p-4 flex justify-between items-center hover:border-ember/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm text-ink">
                    {s.name} <span className="text-ink/40 font-normal">— {s.role}</span>
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">{s.phone}</p>
                </div>
                <button
                  onClick={() => toggleActive(s.id, s.active)}
                  className={`text-xs px-4 py-2 rounded-full font-semibold transition-colors ${
                    s.active
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-basil-100 text-basil hover:bg-basil-100/70"
                  }`}
                >
                  {s.active ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "menu" && <MenuManagementTab />}
    </div>
  );
}