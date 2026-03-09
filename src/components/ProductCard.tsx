import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, ShoppingCart, Star, Download, CheckCircle } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { hasPurchased, isAuthenticated } = useAuth();
  const purchased = hasPurchased(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover-lift border-border/50 bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img src={product.coverImage} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isBestseller && <Badge className="gradient-bg text-primary-foreground border-0 text-xs">Bestseller</Badge>}
          {discount > 0 && <Badge variant="destructive" className="text-xs">-{discount}%</Badge>}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Link to={`/product/${product.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full backdrop-blur-sm"><Eye className="mr-1 h-3 w-3" /> Preview</Button>
          </Link>
          {purchased ? (
            <Link to="/library" className="flex-1">
              <Button size="sm" className="w-full bg-success hover:bg-success/90 text-success-foreground"><Download className="mr-1 h-3 w-3" /> Download</Button>
            </Link>
          ) : (
            <Link to={isAuthenticated ? `/payment/${product.id}` : "/login"} className="flex-1">
              <Button size="sm" className="w-full gradient-bg text-primary-foreground border-0"><ShoppingCart className="mr-1 h-3 w-3" /> Buy</Button>
            </Link>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {purchased && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground"><CheckCircle className="h-4 w-4" /></div>
          )}
          <WishlistButton productId={product.id} className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full" />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold leading-tight hover:text-primary transition-colors line-clamp-2">{product.title}</h3>
        </Link>
        {product.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-primary">৳{product.price}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">৳{product.originalPrice}</span>}
          </div>
          {product.pages && <span className="text-xs text-muted-foreground">{product.pages} pages</span>}
        </div>
      </CardContent>
    </Card>
  );
}
