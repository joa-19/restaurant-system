import { Minus, Plus } from "lucide-react";

interface QtyStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
}

export function QtyStepper({ quantity, onIncrement, onDecrement, size = "md" }: QtyStepperProps) {
  const btn =
    size === "sm"
      ? "w-7 h-7"
      : "w-9 h-9";

  return (
    <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className={`${btn} rounded-full bg-paper shadow-sm flex items-center justify-center text-ink active:scale-95 transition-transform`}
      >
        <Minus size={15} strokeWidth={2.5} />
      </button>
      <span className="w-6 text-center font-semibold text-sm tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={`${btn} rounded-full bg-ink text-cream shadow-sm flex items-center justify-center active:scale-95 transition-transform`}
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
