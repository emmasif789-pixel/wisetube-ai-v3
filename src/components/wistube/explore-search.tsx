import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { searchVideos } from "@/lib/search.functions";

// Debounce a fast-changing value so we don't fire a search request on
// every keystroke.
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function ExploreSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query.trim(), 300);
  const search = useServerFn(searchVideos);

  const { data: hits, isFetching } = useQuery({
    queryKey: ["search-videos", debouncedQuery],
    queryFn: () => search({ data: { query: debouncedQuery } }),
    enabled: debouncedQuery.length > 1,
    staleTime: 30_000,
  });

  const showResults = debouncedQuery.length > 1;

  return (
    <section className="relative mx-auto max-w-2xl px-6 pb-4">
      <div className="mb-4 text-center">
        <p className="text-xs font-medium text-muted-foreground/60">
          Search Previously Analyzed Videos
        </p>
      </div>
      <div className="relative">
        <div className="group relative flex items-center gap-3 rounded-xl border border-white/[0.09] bg-card/60 px-4 py-2.5 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] focus-within:border-primary/50">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search titles, topics, or key insights…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            aria-label="Search previously analyzed videos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-xl border border-white/[0.09] bg-card/95 p-1.5 backdrop-blur-xl"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {isFetching && (
                <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>
              )}
              {!isFetching && hits?.length === 0 && (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  No matches yet — analyze this video to make it searchable.
                </p>
              )}
              {!isFetching &&
                hits?.map((hit) => (
                  <Link
                    key={hit.objectID}
                    to="/report"
                    search={{ url: hit.url }}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-secondary/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{hit.title}</p>
                      <p className="truncate text-xs text-muted-foreground/70">
                        {hit.channel} · {hit.category} · {hit.overallScore.toFixed(1)}/10
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  </Link>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
