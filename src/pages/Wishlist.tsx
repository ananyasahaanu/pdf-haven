import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/hooks/useProducts";

function mapRow(row: any): Product {
  return {
    id: row.id, title: row.title, description: row.description,
    price: Number(row.price), originalPrice: row.original_price ? Number(row.original_price) : null,
    coverImage: row.cover_url || "/placeholder.svg", category: row.category,
    pages: row.pages, isBestseller: row.is_bestseller, isFeatured: row.is_featured,
    rating: Number(row.rating), reviews: row.reviews_count, createdAt: row.created_at, pdfUrl: row.pdf_url,
  };
}

export default function Wishlist() {
  const { user, isAuthenticated, loading } = useAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      if (!user) return [];
      const { data: wishlistItems, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      if (!wishlistItems.length) return [];
      const ids = wishlistItems.map((w) => w.product_id);
      const { data: pdfs, error: pdfError } = await supabase
        .from("uploaded_pdfs")
        .select("*")
        .in("id", ids)
        .eq("is_published", true);
      if (pdfError) throw pdfError;
      return (pdfs || []).map(mapRow);
    },
    enabled: !!user,
  });

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Heart className="h-7 w-7 text-destructive" /> Wishlist
        </h1>
        <p className="text-muted-foreground mt-1">Your saved PDFs</p>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <Link to="/browse"><Button className="mt-4 gradient-bg text-primary-foreground border-0">Browse PDFs</Button></Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
