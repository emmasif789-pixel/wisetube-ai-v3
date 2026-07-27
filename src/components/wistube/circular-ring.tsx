import { motion } from "framer-motion";

export function CircularRing({
  value,
  size = 56,
  strokeWidth = 5,
  label,
  sublabel,
  centerText,
  delay = 0,
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  centerText?: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary/60"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {centerText ?? Math.round(clamped)}
        </div>
      </div>
      {label && (
        <div className="text-center leading-tight">
          <p className="text-[10px] font-medium text-foreground">{label}</p>
          {sublabel && <p className="text-[9px] text-muted-foreground">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
