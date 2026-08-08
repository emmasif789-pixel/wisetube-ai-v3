import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wistube/navbar";
import { Hero } from "@/components/wistube/hero";
import { ExploreSearch } from "@/components/wistube/explore-search";
import { Features } from "@/components/wistube/features";
import { Footer } from "@/components/wistube/footer";
import { Aurora } from "@/components/wistube/aurora";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Aurora />
      <Navbar />
      <Hero />
      <ExploreSearch />
      <Features />
      <Footer />
    </main>
  );
}
