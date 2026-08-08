import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Mail, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { to: "/", hash: undefined as string | undefined, label: "Home" },
  { to: "/", hash: "features", label: "Features" },
  { to: "/compare", hash: undefined as string | undefined, label: "Compare" },
  { to: "/merge", hash: undefined as string | undefined, label: "Merge" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="relative w-full max-w-5xl rounded-2xl border border-border/70 bg-background/70 px-4 py-2.5 backdrop-blur-xl shadow-[var(--shadow-card)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-foreground/20 before:to-transparent">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="WiseTube AI home" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

          {/* Desktop nav — hidden below sm */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2 h-5 w-px bg-border/80" />
            <a
              href="mailto:emmasif789@gmail.com"
              aria-label="Email WiseTube AI"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
            </a>
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile controls — theme toggle always visible, links collapse into menu */}
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
            >
              {menuOpen ? (
                <X className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden sm:hidden"
            >
              <div className="mt-2 flex flex-col gap-1 border-t border-border/60 pt-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    hash={link.hash}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="mailto:emmasif789@gmail.com"
                  aria-label="Email WiseTube AI"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  Email us
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
