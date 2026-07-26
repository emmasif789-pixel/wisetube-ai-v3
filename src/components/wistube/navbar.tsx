import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="relative flex w-full max-w-5xl items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-2.5 backdrop-blur-xl shadow-[var(--shadow-card)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-foreground/20 before:to-transparent">
        <Link to="/" aria-label="WisTube AI home">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/"
            hash="features"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
          >
            Features
          </Link>
          <Link
            to="/compare"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
          >
            Compare
          </Link>
          <div className="ml-2 h-5 w-px bg-border/80" />
          <a
            href="mailto:emmasif789@gmail.com"
            aria-label="Email WisTube AI"
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <Mail className="h-4 w-4" strokeWidth={2} />
          </a>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
