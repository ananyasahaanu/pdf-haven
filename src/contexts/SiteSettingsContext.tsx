import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

const defaults: SiteSettings = {
  siteName: "PDFStore",
  tagline: "Premium Digital PDF Marketplace",
  logoUrl: null,
  faviconUrl: null,
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings = defaults } = useQuery({
    queryKey: ["site-branding"],
    queryFn: async () => {
      const keys = ["site_name", "site_tagline", "site_logo_url", "site_favicon_url"];
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);
      if (error) throw error;
      const map = Object.fromEntries((data || []).map((d) => [d.key, d.value]));
      return {
        siteName: map.site_name || defaults.siteName,
        tagline: map.site_tagline || defaults.tagline,
        logoUrl: map.site_logo_url || null,
        faviconUrl: map.site_favicon_url || null,
      };
    },
    staleTime: 60_000,
  });

  // Dynamically update favicon
  if (settings.faviconUrl) {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
