import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Download, Eye, Lock, ShoppingCart, Star, BookOpen } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasPurchased } = useAuth();

  const product = getProductById(id || "");
  if (!product) {
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

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cover Image */}
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shadow-2xl">
            <img
              src={product.coverImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isBestseller && (
              <Badge className="gradient-bg text-primary-foreground border-0">Bestseller</Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="mb-3 w-fit">{product.category}</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{product.title}</h1>
          <p className="mt-2 text-muted-foreground">by {product.author}</p>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{product.pages} Pages</div>
                  <div className="text-xs text-muted-foreground">Full content</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{product.previewPages} Preview Pages</div>
                  <div className="text-xs text-muted-foreground">Free preview</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {purchased ? (
              <Button size="lg" className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                <Download className="mr-2 h-5 w-5" /> Download PDF
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 gradient-bg text-primary-foreground border-0 premium-shadow"
                onClick={() => navigate(isAuthenticated ? `/payment/${product.id}` : "/login")}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now - ${product.price}
              </Button>
            )}
          </div>

          {purchased && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">You own this PDF</span>
            </div>
          )}

          {/* Preview Section */}
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold mb-4">
              <Eye className="mr-2 inline h-5 w-5" /> Preview
            </h2>
            <div className="space-y-3">
              {Array.from({ length: product.previewPages }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">Page {i + 1}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-secondary" style={{ width: `${90 - i * 5}%` }} />
                      <div className="h-4 rounded bg-secondary" style={{ width: `${80 - i * 3}%` }} />
                      <div className="h-4 rounded bg-secondary" style={{ width: `${95 - i * 7}%` }} />
                      <div className="h-4 rounded bg-secondary" style={{ width: `${70 - i * 4}%` }} />
                      <div className="h-4 rounded bg-secondary" style={{ width: `${85 - i * 6}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic">
                      Preview content for page {i + 1} of "{product.title}"
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Locked indicator */}
              <div className="relative">
                <Card className="opacity-50">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-secondary w-[70%]" />
                      <div className="h-4 rounded bg-secondary w-[60%]" />
                      <div className="h-4 rounded bg-secondary w-[80%]" />
                    </div>
                  </CardContent>
                </Card>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Purchase to unlock all {product.pages} pages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
