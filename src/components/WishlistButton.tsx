import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  size?: "sm" | "icon";
  className?: string;
}

export function WishlistButton({ productId, size = "icon", className }: WishlistButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isWishlisted = false } = useQuery({
    queryKey: ["wishlist", productId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: productId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", productId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    toggleMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn("h-8 w-8", className)}
      onClick={handleClick}
      disabled={toggleMutation.isPending}
    >
      <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground")} />
    </Button>
  );
}
