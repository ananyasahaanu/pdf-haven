import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
  googleVerification: string;
  bingVerification: string;
  allowIndexing: boolean;
}

const defaults: SiteSettings = {
  siteName: "PDFStore",
  tagline: "Premium Digital PDF Marketplace",
  logoUrl: null,
  faviconUrl: null,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  seoOgImage: "",
  googleVerification: "",
  bingVerification: "",
  allowIndexing: true,
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

const ALL_KEYS = [
  "site_name", "site_tagline", "site_logo_url", "site_favicon_url",
  "seo_meta_title", "seo_meta_description", "seo_keywords", "seo_og_image",
  "seo_google_verification", "seo_bing_verification", "seo_allow_indexing",
];

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings = defaults } = useQuery({
    queryKey: ["site-branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ALL_KEYS);
      if (error) throw error;
      const map = Object.fromEntries((data || []).map((d) => [d.key, d.value]));
      return {
        siteName: map.site_name || defaults.siteName,
        tagline: map.site_tagline || defaults.tagline,
        logoUrl: map.site_logo_url || null,
        faviconUrl: map.site_favicon_url || null,
        seoTitle: map.seo_meta_title || "",
        seoDescription: map.seo_meta_description || "",
        seoKeywords: map.seo_keywords || "",
        seoOgImage: map.seo_og_image || "",
        googleVerification: map.seo_google_verification || "",
        bingVerification: map.seo_bing_verification || "",
        allowIndexing: map.seo_allow_indexing !== "false",
      };
    },
    staleTime: 60_000,
  });

  // Dynamically update favicon
  useEffect(() => {
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  // Dynamically inject verification meta tags
  useEffect(() => {
    const setMeta = (name: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta("google-site-verification", settings.googleVerification);
    setMeta("msvalidate.01", settings.bingVerification);
  }, [settings.googleVerification, settings.bingVerification]);

  // Dynamically set robots meta
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "robots";
      document.head.appendChild(tag);
    }
    tag.content = settings.allowIndexing ? "index, follow" : "noindex, nofollow";
  }, [settings.allowIndexing]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
