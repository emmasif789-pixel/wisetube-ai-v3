import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wistube/navbar";
import { Hero } from "@/components/wistube/hero";
import { Features } from "@/components/wistube/features";
import { Footer } from "@/components/wistube/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
