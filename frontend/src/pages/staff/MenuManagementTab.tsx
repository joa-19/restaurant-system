import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export default function MenuManagementTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // per-category "add item" form state, keyed by categoryId
  const [newItem, setNewItem] = useState<Record<string, { name: string; description: string; price: string }>>({});

  // editing state — only one item edited at a time
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; price: string }>({
    name: "",
    description: "",
    price: "",
  });

  async function loadCategories() {
    try {
      const res = await api.get<Category[]>("/menu/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function createCategory() {
    if (!newCategoryName.trim()) return;
    try {
      await api.post("/menu/categories", { name: newCategoryName.trim() });
      setNewCategoryName("");
      loadCategories();
    } catch {
      setMessage("Could not create category.");
    }
  }

  function updateNewItemField(categoryId: string, field: string, value: string) {
    setNewItem((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value } as any,
    }));
  }

  async function createItem(categoryId: string) {
    const draft = newItem[categoryId];
    if (!draft?.name || !draft?.price) {
      setMessage("Item name and price are required.");
      return;
    }

    try {
      await api.post("/menu/items", {
        categoryId,
        name: draft.name,
        description: draft.description || undefined,
        price: Number(draft.price),
      });
      setNewItem((prev) => ({ ...prev, [categoryId]: { name: "", description: "", price: "" } }));
      loadCategories();
    } catch {
      setMessage("Could not create item.");
    }
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
    });
  }

  async function saveEdit(itemId: string) {
    try {
      await api.put(`/menu/items/${itemId}`, {
        name: editForm.name,
        description: editForm.description || undefined,
        price: Number(editForm.price),
      });
      setEditingId(null);
      loadCategories();
    } catch {
      setMessage("Could not update item.");
    }
  }

  async function toggleAvailable(item: MenuItem) {
    try {
      await api.put(`/menu/items/${item.id}`, { available: !item.available });
      loadCategories();
    } catch {
      setMessage("Could not update availability.");
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Delete this item permanently?")) return;
    try {
      await api.delete(`/menu/items/${itemId}`);
      loadCategories();
    } catch {
      setMessage("Could not delete item.");
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {message && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 flex items-center gap-1.5">
          {message}
        </p>
      )}

      {/* Create category */}
      <div className="bg-paper rounded-3xl border border-line p-4 flex gap-2">
        <input
          placeholder="New category name (e.g. Desserts)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createCategory()}
          className="flex-1 border border-line bg-cream/60 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
        />
        <button
          onClick={createCategory}
          className="bg-ink text-cream px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition-transform shrink-0"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* Categories + items */}
      {categories.map((category) => (
        <div key={category.id} className="bg-paper rounded-3xl border border-line p-4">
          <div className="flex items-center gap-2.5 mb-3.5">
            <h3 className="font-display text-ink tracking-wide">{category.name}</h3>
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-ink/35 font-medium">
              {category.menuItems.length} {category.menuItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="space-y-2.5 mb-4">
            {category.menuItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-3.5 border transition-colors ${
                  editingId === item.id
                    ? "border-ember/40 bg-ember-100/20"
                    : "border-line bg-cream/40"
                }`}
              >
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-line bg-cream rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember"
                      placeholder="Name"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border border-line bg-cream rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full border border-line bg-cream rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember"
                      placeholder="Price"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="bg-ink text-cream px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <Check size={13} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-ink/5 text-ink/60 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-ink/10 transition-colors"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-ink truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-ink/45 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-sm font-semibold text-ink mt-1.5">
                        {item.price} <span className="text-xs text-ink/40 font-semibold">ETB</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                          item.available
                            ? "bg-basil-100 text-basil hover:bg-basil-100/70"
                            : "bg-ink/10 text-ink/45 hover:bg-ink/15"
                        }`}
                      >
                        {item.available ? "Available" : "Hidden"}
                      </button>
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-xs text-ink/50 font-semibold flex items-center gap-1 hover:text-ember-600 transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-xs text-ink/50 font-semibold flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {category.menuItems.length === 0 && (
              <p className="text-xs text-ink/35 py-2">No items yet.</p>
            )}
          </div>

          {/* Add item to this category */}
          <div className="border-t border-line pt-3.5 space-y-2">
            <input
              placeholder="Item name"
              value={newItem[category.id]?.name || ""}
              onChange={(e) => updateNewItemField(category.id, "name", e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <input
              placeholder="Description (optional)"
              value={newItem[category.id]?.description || ""}
              onChange={(e) => updateNewItemField(category.id, "description", e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem[category.id]?.price || ""}
              onChange={(e) => updateNewItemField(category.id, "price", e.target.value)}
              className="w-full border border-line bg-cream/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent transition-all"
            />
            <button
              onClick={() => createItem(category.id)}
              className="w-full bg-ink/5 hover:bg-ink/10 text-ink py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={15} />
              Add Item to {category.name}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}