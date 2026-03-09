import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, Download, Eye, ShoppingCart, Star, BookOpen } from "lucide-react";
import { ReviewSection } from "@/components/ReviewSection";
import { WishlistButton } from "@/components/WishlistButton";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { ReadingProgress } from "@/components/ReadingProgress";
import { PdfViewer } from "@/components/PdfViewer";
import { supabase } from "@/integrations/supabase/client";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasPurchased } = useAuth();
  const { data: product, isLoading, error } = useProduct(id || "");
  const [previewLoading, setPreviewLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Link to="/browse"><Button className="mt-4">Back to Browse</Button></Link>
      </div>
    );
  }

  const purchased = hasPurchased(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const previewPages = Math.min(product.pages || 3, 5);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <WishlistButton productId={product.id} />
      </div>

      <SEOHead
        title={product.title}
        description={product.description || `Buy "${product.title}" — premium PDF on PDFStore.`}
        image={product.coverImage !== "/placeholder.svg" ? product.coverImage : undefined}
        type="product"
        price={product.price}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.coverImage,
          offers: { "@type": "Offer", price: product.price, priceCurrency: "BDT", availability: "https://schema.org/InStock" },
          aggregateRating: product.reviews > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews } : undefined,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shadow-2xl">
            <img src={product.coverImage} alt={product.title} className="h-full w-full object-cover" />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isBestseller && <Badge className="gradient-bg text-primary-foreground border-0">Bestseller</Badge>}
            {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
          </div>
        </div>

        <div className="flex flex-col">
          <Badge variant="secondary" className="mb-3 w-fit">{product.category}</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{product.title}</h1>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">৳{product.price}</span>
            {product.originalPrice && <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice}</span>}
          </div>

          {product.description && <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{product.pages || "N/A"} Pages</div>
                  <div className="text-xs text-muted-foreground">Full content</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{previewPages} Preview Pages</div>
                  <div className="text-xs text-muted-foreground">Free preview</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {purchased ? (
              <Button size="lg" className="flex-1 bg-success hover:bg-success/90 text-success-foreground" asChild>
                <a href={product.pdfUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" /> Download PDF
                </a>
              </Button>
            ) : (
              <Button size="lg" className="flex-1 gradient-bg text-primary-foreground border-0 premium-shadow" onClick={() => navigate(isAuthenticated ? `/payment/${product.id}` : "/login")}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now - ৳{product.price}
              </Button>
            )}
          </div>

          {purchased && (
            <ReadingProgress productId={product.id} totalPages={product.pages} productTitle={product.title} />
          )}

          {purchased && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">You own this PDF</span>
            </div>
          )}

          <div className="mt-6">
            <ShareButtons title={product.title} productId={product.id} />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl font-bold mb-4"><Eye className="mr-2 inline h-5 w-5" /> Preview</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                {previewLoading && (
                  <div className="flex items-center justify-center h-[600px] bg-secondary/50">
                    <div className="text-center space-y-3">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading PDF preview...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={`${product.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1`}
                  className={`w-full border-0 ${previewLoading ? 'h-0' : 'h-[600px]'}`}
                  title={`Preview of ${product.title}`}
                  onLoad={() => setPreviewLoading(false)}
                />
              </CardContent>
            </Card>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing preview of "{product.title}" • {product.pages || "N/A"} pages total
              </p>
              <Button variant="ghost" size="sm" asChild>
                <a href={product.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" /> Open in new tab
                </a>
              </Button>
            </div>

            {!purchased && (
              <div className="relative mt-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-border p-6">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Purchase to download and access offline</p>
                  <Button size="sm" className="mt-3 gradient-bg text-primary-foreground border-0" onClick={() => navigate(isAuthenticated ? `/payment/${product.id}` : "/login")}>
                    Buy Now - ৳{product.price}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <ReviewSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}
