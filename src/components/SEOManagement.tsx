import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, Search, Shield, Save, Loader2, Code } from "lucide-react";

const SEO_KEYS = [
  "seo_meta_title",
  "seo_meta_description",
  "seo_keywords",
  "seo_og_image",
  "seo_google_verification",
  "seo_bing_verification",
  "seo_allow_indexing",
  "seo_robots_txt",
];

export function SEOManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [googleVerification, setGoogleVerification] = useState("");
  const [bingVerification, setBingVerification] = useState("");
  const [allowIndexing, setAllowIndexing] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", SEO_KEYS);

    if (data) {
      const map = Object.fromEntries(data.map((d) => [d.key, d.value]));
      setMetaTitle(map.seo_meta_title || "");
      setMetaDescription(map.seo_meta_description || "");
      setKeywords(map.seo_keywords || "");
      setOgImage(map.seo_og_image || "");
      setGoogleVerification(map.seo_google_verification || "");
      setBingVerification(map.seo_bing_verification || "");
      setAllowIndexing(map.seo_allow_indexing !== "false");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "seo_meta_title", value: metaTitle },
        { key: "seo_meta_description", value: metaDescription },
        { key: "seo_keywords", value: keywords },
        { key: "seo_og_image", value: ogImage },
        { key: "seo_google_verification", value: googleVerification },
        { key: "seo_bing_verification", value: bingVerification },
        { key: "seo_allow_indexing", value: String(allowIndexing) },
      ];

      for (const s of settings) {
        if (!s.value && s.key !== "seo_allow_indexing") continue;
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["site-seo"] });
      queryClient.invalidateQueries({ queryKey: ["site-branding"] });
      toast({ title: "SEO সেটিংস সেভ হয়েছে", description: "আপনার SEO সেটিংস সফলভাবে আপডেট হয়েছে।" });
    } catch {
      toast({ title: "Error", description: "সেটিংস সেভ করতে সমস্যা হয়েছে।", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" /> SEO & Search Engine Settings
        </h3>

        {/* Meta Tags */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" /> Meta Tags
          </h4>
          <div className="space-y-2">
            <Label>Site Title (Meta Title)</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="PDFStore — Premium Digital PDF Marketplace"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters — Keep under 60 for best results</p>
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Discover and purchase premium educational PDFs..."
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Keywords</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="pdf, ebooks, digital books, education"
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords for search engines</p>
          </div>
          <div className="space-y-2">
            <Label>OG Image URL</Label>
            <Input
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Image shown when shared on social media (1200x630 recommended)</p>
          </div>
        </div>

        {/* Search Console Verification */}
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" /> Search Console Verification
          </h4>
          <div className="space-y-2">
            <Label>Google Search Console Verification Code</Label>
            <Input
              value={googleVerification}
              onChange={(e) => setGoogleVerification(e.target.value)}
              placeholder="google-site-verification=XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Go to{" "}
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google Search Console
              </a>
              {" → Add Property → HTML Tag method → Copy the content value"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Bing Webmaster Verification Code</Label>
            <Input
              value={bingVerification}
              onChange={(e) => setBingVerification(e.target.value)}
              placeholder="XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              From{" "}
              <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Bing Webmaster Tools
              </a>
              {" → HTML Meta Tag method"}
            </p>
          </div>
        </div>

        {/* Indexing Controls */}
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Code className="h-4 w-4" /> Indexing Controls
          </h4>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm font-medium">Allow Search Engine Indexing</Label>
              <p className="text-xs text-muted-foreground">
                {allowIndexing
                  ? "Search engines can index your site (recommended for live sites)"
                  : "Search engines will NOT index your site (use for staging/development)"}
              </p>
            </div>
            <Switch checked={allowIndexing} onCheckedChange={setAllowIndexing} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gradient-bg text-primary-foreground border-0">
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save SEO Settings</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
