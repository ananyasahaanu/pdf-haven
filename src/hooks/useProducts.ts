import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  coverImage: string;
  category: string;
  pages: number | null;
  isBestseller: boolean;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  createdAt: string;
  pdfUrl: string;
}

function mapRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    coverImage: row.cover_url || "/placeholder.svg",
    category: row.category,
    pages: row.pages,
    isBestseller: row.is_bestseller,
    isFeatured: row.is_featured,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    createdAt: row.created_at,
    pdfUrl: row.pdf_url,
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return mapRow(data);
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("category")
        .eq("is_published", true);
      if (error) throw error;
      const cats = [...new Set((data || []).map((d) => d.category))].sort();
      return ["All", ...cats];
    },
  });
}
