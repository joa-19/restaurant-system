import logoMark from "../assets/logo.jpg";

interface LogoProps {
  size?: number;
  className?: string;
}

/** Circular brand mark, cropped from the restaurant's badge logo. */
export function LogoMark({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src={logoMark}
      alt="Pizza alla Roma"
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Mark + wordmark lockup, for headers and the staff login screen. */
export function LogoLockup({
  size = 40,
  tone = "dark",
  className = "",
}: LogoProps & { tone?: "dark" | "light" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <div className="leading-none">
        <p
          className={`font-display text-[15px] tracking-wide ${
            tone === "dark" ? "text-cream" : "text-ink"
          }`}
        >
          Pizza alla Roma
        </p>
        <p
          className={`text-[10px] mt-0.5 tracking-[0.14em] ${
            tone === "dark" ? "text-ember" : "text-ember-600"
          }`}
        >
          WOOD FIRED
        </p>
      </div>
    </div>
  );
}
