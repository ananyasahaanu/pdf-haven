import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ArrowRight, BookOpen, Download, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";
import { AnimatedGrid, AnimatedItem } from "@/components/AnimatedSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";

export default function Home() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { t } = useLanguage();

  const bestsellers = products.filter((p) => p.isBestseller);
  const featured = products.filter((p) => p.isFeatured);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="PDFStore — Premium Digital PDF Marketplace"
        description="Discover and purchase premium educational PDFs from expert authors. Preview before you buy, download instantly."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PDFStore",
          description: "Premium Digital PDF Marketplace",
          potentialAction: { "@type": "SearchAction", target: "{search_term_string}", "query-input": "required name=search_term_string" },
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 to-premium-glow/20 blur-3xl" />
          <div className="absolute top-1/3 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-primary/15 to-transparent blur-2xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-20 right-1/4 h-20 w-20 rounded-2xl bg-primary/10 rotate-12 animate-float" />
          <div className="absolute bottom-32 left-1/4 h-16 w-16 rounded-full bg-premium-glow/10 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-20 h-12 w-12 rounded-lg bg-accent/30 -rotate-12 animate-float" style={{ animationDelay: "2s" }} />
          <svg className="absolute bottom-0 left-0 h-64 w-64 opacity-[0.05]" viewBox="0 0 200 200">
            <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="150" x2="150" y2="0" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
          </svg>
          <svg className="absolute top-40 left-20 h-32 w-32 opacity-[0.08] dark:opacity-[0.12]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm glass-card">
              <Sparkles className="mr-1 h-3 w-3" /> {t("home.badge")}
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl md:leading-tight">
              {t("home.title1")}{" "}
              <span className="gradient-text">{t("home.title2")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gradient-bg text-primary-foreground border-0 premium-shadow px-8" onClick={() => navigate("/browse")}>
                {t("home.browseCta")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm" onClick={() => navigate("/browse?category=Programming")}>
                {t("home.topCategories")}
              </Button>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8">
              {[
                { label: t("home.pdfsAvailable"), value: `${products.length}+`, icon: BookOpen },
                { label: t("home.happyReaders"), value: "10K+", icon: TrendingUp },
                { label: t("home.expertAuthors"), value: "50+", icon: Shield },
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
              { icon: Zap, title: t("home.instantDownload"), desc: t("home.instantDownloadDesc") },
              { icon: BookOpen, title: t("home.freePreview"), desc: t("home.freePreviewDesc") },
              { icon: Download, title: t("home.lifetimeAccess"), desc: t("home.lifetimeAccessDesc") },
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
      {(isLoading || bestsellers.length > 0) && (
        <section className="container py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                <TrendingUp className="mr-2 inline h-6 w-6 text-primary" /> {t("home.bestsellers")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.bestsellersSub")}</p>
            </div>
            <Link to="/browse"><Button variant="ghost" size="sm">{t("home.viewAll")} <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.slice(0, 4).map((product) => (
                <AnimatedItem key={product.id}><ProductCard product={product} /></AnimatedItem>
              ))}
            </AnimatedGrid>
          )}
        </section>
      )}

      {/* Featured */}
      {(isLoading || featured.length > 0) && (
        <section className="bg-secondary/30 py-16">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  <Sparkles className="mr-2 inline h-6 w-6 text-primary" /> {t("home.featured")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("home.featuredSub")}</p>
              </div>
              <Link to="/browse"><Button variant="ghost" size="sm">{t("home.viewAll")} <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            </div>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : (
              <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.slice(0, 4).map((product) => (
                  <AnimatedItem key={product.id}><ProductCard product={product} /></AnimatedItem>
                ))}
              </AnimatedGrid>
            )}
          </div>
        </section>
      )}

      {/* Latest PDFs */}
      {(isLoading || products.length > 0) && (
        <section className="container py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                <BookOpen className="mr-2 inline h-6 w-6 text-primary" /> {t("home.browseByCategory") || "Latest PDFs"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Our newest additions</p>
            </div>
            <Link to="/browse"><Button variant="ghost" size="sm">{t("home.viewAll")} <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <AnimatedItem key={product.id}><ProductCard product={product} /></AnimatedItem>
              ))}
            </AnimatedGrid>
          )}
        </section>
      )}

      {/* Categories */}
      <section className="container py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold md:text-3xl">{t("home.browseByCategory")}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.filter(c => c !== "All").map((cat) => (
            <Link key={cat} to={`/browse?category=${cat}`}>
              <Button variant="outline" className="hover-lift">{cat}</Button>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl gradient-bg p-8 md:p-16 text-center premium-shadow-lg">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground">{t("home.readyCta")}</h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
            {t("home.readyCtaSub")}
          </p>
          <Button size="lg" variant="secondary" className="mt-8" onClick={() => navigate("/browse")}>
            {t("home.exploreNow")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
