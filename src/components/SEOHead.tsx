import { Helmet } from "react-helmet-async";

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
  title = "PDFStore — Premium Digital PDF Marketplace",
  description = "Discover and purchase premium educational PDFs from expert authors. Preview before you buy, download instantly.",
  image,
  url,
  type = "website",
  price,
  currency = "BDT",
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title.includes("PDFStore") ? title : `${title} | PDFStore`;
  const canonical = url || (typeof window !== "undefined" ? window.location.href : "");

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PDFStore",
    description,
    url: canonical,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === "product" ? "product" : "website"} />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

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
