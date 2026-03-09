import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: banner } = useQuery({
    queryKey: ["announcement-banner"],
    queryFn: async () => {
      const keys = ["banner_text", "banner_link", "banner_active", "banner_type"];
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);
      if (error) throw error;
      const map = Object.fromEntries((data || []).map((d) => [d.key, d.value]));
      return {
        text: map.banner_text || "",
        link: map.banner_link || "",
        active: map.banner_active === "true",
        type: (map.banner_type as "info" | "success" | "warning" | "promo") || "info",
      };
    },
    staleTime: 60_000,
  });

  if (!banner?.active || !banner.text || dismissed) return null;

  const typeStyles: Record<string, string> = {
    info: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-amber-500 text-white",
    promo: "gradient-bg text-primary-foreground",
  };

  const content = (
    <span className="flex items-center gap-2 text-sm font-medium">
      <Megaphone className="h-4 w-4 shrink-0" />
      {banner.text}
    </span>
  );

  return (
    <div className={`relative flex items-center justify-center px-4 py-2 ${typeStyles[banner.type] || typeStyles.info}`}>
      {banner.link ? (
        <Link to={banner.link} className="hover:underline">{content}</Link>
      ) : (
        content
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 h-6 w-6 hover:bg-white/20"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
