import { motion } from "framer-motion";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

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
      <nav className="relative flex w-full max-w-5xl items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-2.5 backdrop-blur-xl shadow-[var(--shadow-card)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-foreground/20 before:to-transparent">
        <a href="#home" aria-label="WisTube AI home">
          <Logo />
        </a>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="ml-2 h-5 w-px bg-border/80" />
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </motion.header>
  );
}