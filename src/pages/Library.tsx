import { useAuth } from "@/contexts/AuthContext";
import { products } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, Download, Library as LibraryIcon } from "lucide-react";

export default function Library() {
  const { isAuthenticated, purchasedIds } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  const purchasedProducts = products.filter((p) => purchasedIds.includes(p.id));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          <LibraryIcon className="mr-2 inline h-7 w-7" /> My Library
        </h1>
        <p className="mt-1 text-muted-foreground">Your purchased PDFs — download anytime</p>
      </div>

      {purchasedProducts.length > 0 ? (
        <div className="grid gap-4">
          {purchasedProducts.map((product) => (
            <Card key={product.id} className="hover-lift">
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="h-24 w-16 rounded-lg object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-display font-semibold hover:text-primary transition-colors truncate">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.author}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    <span className="text-xs text-muted-foreground">{product.pages} pages</span>
                  </div>
                </div>
                <Button className="shrink-0 gradient-bg text-primary-foreground border-0">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-xl font-semibold">Your library is empty</h2>
          <p className="mt-2 text-muted-foreground">Start building your collection today</p>
          <Link to="/browse">
            <Button className="mt-6 gradient-bg text-primary-foreground border-0">Browse PDFs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
