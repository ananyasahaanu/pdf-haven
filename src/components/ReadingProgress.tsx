import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReadingProgressProps {
  productId: string;
  totalPages: number | null;
  productTitle: string;
}

export function ReadingProgress({ productId, totalPages, productTitle }: ReadingProgressProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pages = totalPages || 1;
  const progress = Math.round((currentPage / pages) * 100);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("reading_progress")
        .select("current_page")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (data) setCurrentPage(data.current_page);
      setLoading(false);
    };
    load();
  }, [user, productId]);

  const saveProgress = useCallback(
    async (page: number) => {
      if (!user) return;
      setCurrentPage(page);
      const { data: existing } = await supabase
        .from("reading_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("reading_progress")
          .update({ current_page: page, last_read_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("reading_progress").insert({
          user_id: user.id,
          product_id: productId,
          current_page: page,
          total_pages: pages,
        });
      }
    },
    [user, productId, pages]
  );

  const handlePrev = () => {
    if (currentPage > 1) saveProgress(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < pages) saveProgress(currentPage + 1);
  };

  const handleBookmark = () => {
    saveProgress(currentPage);
    toast({ title: "Bookmark saved!", description: `Page ${currentPage} of "${productTitle}"` });
  };

  if (loading) return null;

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Reading Progress</span>
          </div>
          <span className="text-xs text-muted-foreground">{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} / {pages}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNext} disabled={currentPage >= pages}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleBookmark}>
          <Bookmark className="h-4 w-4 mr-2" /> Save Bookmark
        </Button>
      </CardContent>
    </Card>
  );
}
