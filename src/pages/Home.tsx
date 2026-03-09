import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { products, getBestsellers, getFeaturedProducts, categories } from "@/data/products";
import { ArrowRight, BookOpen, Download, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function Home() {
  const navigate = useNavigate();
  const bestsellers = getBestsellers();
  const featured = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBg}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-background/70 dark:bg-background/80 backdrop-blur-sm" />
          {/* Gradient fade to content */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm glass-card">
              <Sparkles className="mr-1 h-3 w-3" /> Premium Digital Library
            </Badge>
            
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl md:leading-tight">
              Discover Premium{" "}
              <span className="gradient-text">Educational PDFs</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Access curated, high-quality digital books from expert authors. Preview before you buy, download instantly.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gradient-bg text-primary-foreground border-0 premium-shadow px-8"
                onClick={() => navigate("/browse")}
              >
                Browse Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-background/50 backdrop-blur-sm"
                onClick={() => navigate("/browse?category=Programming")}
              >
                Top Categories
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              {[
                { label: "PDFs Available", value: `${products.length}+`, icon: BookOpen },
                { label: "Happy Readers", value: "10K+", icon: TrendingUp },
                { label: "Expert Authors", value: "50+", icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="text-center rounded-xl bg-card/60 backdrop-blur-sm p-4 border border-border/30">
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/40 bg-secondary/30">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Instant Download", desc: "Get your PDFs immediately after purchase" },
              { icon: BookOpen, title: "Free Preview", desc: "Preview pages before buying" },
              { icon: Download, title: "Lifetime Access", desc: "Download your purchases anytime" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <feature.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              <TrendingUp className="mr-2 inline h-6 w-6 text-primary" />
              Bestsellers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Most popular picks from our readers</p>
          </div>
          <Link to="/browse">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                <Sparkles className="mr-2 inline h-6 w-6 text-primary" />
                Featured Collection
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Hand-picked by our editorial team</p>
            </div>
            <Link to="/browse">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold md:text-3xl">
          Browse by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.filter(c => c !== "All").map((cat) => (
            <Link key={cat} to={`/browse?category=${cat}`}>
              <Button variant="outline" className="hover-lift">
                {cat}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl gradient-bg p-8 md:p-16 text-center premium-shadow-lg">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground">
            Ready to Start Learning?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
            Join thousands of readers who are expanding their knowledge with our premium PDF collection.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            onClick={() => navigate("/browse")}
          >
            Explore Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
