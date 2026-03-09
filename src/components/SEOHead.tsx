import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  price?: number;
  currency?: string;
  jsonLd?: Record<string, any>;
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  price,
  currency = "BDT",
  jsonLd,
}: SEOHeadProps) {
  const settings = useSiteSettings();

  const siteName = settings.siteName || "PDFStore";
  const defaultTitle = settings.seoTitle || `${siteName} — ${settings.tagline || "Premium Digital PDF Marketplace"}`;
  const defaultDesc = settings.seoDescription || "Discover and purchase premium educational PDFs from expert authors.";

  const pageTitle = title || defaultTitle;
  const fullTitle = pageTitle.includes(siteName) ? pageTitle : `${pageTitle} | ${siteName}`;
  const metaDesc = description || defaultDesc;
  const canonical = url || (typeof window !== "undefined" ? window.location.href : "");
  const ogImage = image || settings.seoOgImage || undefined;

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    description: metaDesc,
    url: canonical,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />

      {settings.seoKeywords && <meta name="keywords" content={settings.seoKeywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content={type === "product" ? "product" : "website"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Product pricing */}
      {price !== undefined && (
        <>
          <meta property="product:price:amount" content={String(price)} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
}
