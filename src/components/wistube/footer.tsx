import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features", external: false, anchor: true },
      { label: "About", href: "/about", external: false, anchor: false },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact", external: false, anchor: false },
      { label: "Twitter", href: "https://x.com/EmanAsifD", external: true, anchor: false },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy", external: false, anchor: false },
      { label: "Terms", href: "/terms", external: false, anchor: false },
    ],
  },
];

export function Footer() {
  return (
    <footer id="about" className="border-t border-border/60 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Watch less. Learn more.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-foreground">{g.title}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) =>
                  l.external || l.anchor ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.external ? "_blank" : undefined}
                        rel={l.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        to={l.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} WiseTube AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for people who value their time.
          </p>
        </div>
      </div>
    </footer>
  );
}
