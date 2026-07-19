import { motion } from "framer-motion";
import { Logo } from "./logo";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="relative flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/[0.08] bg-background/60 px-4 py-2.5 backdrop-blur-xl shadow-[var(--shadow-card)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent">
        <a href="#home" aria-label="WisTube AI home">
          <Logo />
        </a>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/[0.04] hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}