import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-2.5 backdrop-blur-xl shadow-[var(--shadow-card)]">
        <a href="#home" aria-label="WisTube AI home">
          <Logo />
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
        <Button
          size="sm"
          className="rounded-lg font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          Get Started
        </Button>
      </nav>
    </motion.header>
  );
}