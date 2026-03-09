import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Upload, Type, Image, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BrandingManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [siteName, setSiteName] = useState("PDFStore");
  const [tagline, setTagline] = useState("Premium Digital PDF Marketplace");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const keys = ["site_name", "site_tagline", "site_logo_url", "site_favicon_url"];
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);
      const map = Object.fromEntries((data || []).map((d) => [d.key, d.value]));
      if (map.site_name) setSiteName(map.site_name);
      if (map.site_tagline) setTagline(map.site_tagline);
      if (map.site_logo_url) setLogoUrl(map.site_logo_url);
      if (map.site_favicon_url) setFaviconUrl(map.site_favicon_url);
      setLoaded(true);
    };
    load();
  }, []);

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("key")
      .eq("key", key)
      .maybeSingle();
    if (existing) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("site_settings").insert({ key, value });
    }
  };

  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    if (!user) return;
    const setter = type === "logo" ? setUploadingLogo : setUploadingFavicon;
    setter(true);
    try {
      const path = `branding/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("covers").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
      const key = type === "logo" ? "site_logo_url" : "site_favicon_url";
      await upsertSetting(key, urlData.publicUrl);
      if (type === "logo") setLogoUrl(urlData.publicUrl);
      else setFaviconUrl(urlData.publicUrl);
      queryClient.invalidateQueries({ queryKey: ["site-branding"] });
      toast({ title: `${type === "logo" ? "Logo" : "Favicon"} uploaded!` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleSaveText = async () => {
    setSaving(true);
    try {
      await upsertSetting("site_name", siteName);
      await upsertSetting("site_tagline", tagline);
      queryClient.invalidateQueries({ queryKey: ["site-branding"] });
      toast({ title: "Branding saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    await upsertSetting("site_logo_url", "");
    setLogoUrl(null);
    queryClient.invalidateQueries({ queryKey: ["site-branding"] });
    toast({ title: "Logo removed" });
  };

  const handleRemoveFavicon = async () => {
    await upsertSetting("site_favicon_url", "");
    setFaviconUrl(null);
    queryClient.invalidateQueries({ queryKey: ["site-branding"] });
    toast({ title: "Favicon removed" });
  };

  if (!loaded) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" /> Site Branding
        </h3>

        {/* Site Name & Tagline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Type className="h-3.5 w-3.5" /> Site Name</Label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="PDFStore" />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Premium Digital PDF Marketplace" />
          </div>
        </div>
        <Button onClick={handleSaveText} disabled={saving} size="sm">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Name & Tagline
        </Button>

        {/* Logo Upload */}
        <div className="border-t border-border pt-4">
          <Label className="flex items-center gap-1 mb-3"><Image className="h-3.5 w-3.5" /> Site Logo</Label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 max-w-[160px] object-contain rounded border border-border p-1" />
            ) : (
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                {siteName.substring(0, 2)}
              </div>
            )}
            <div className="flex gap-2">
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "logo"); }} />
              <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {logoUrl ? "Change" : "Upload"}
              </Button>
              {logoUrl && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRemoveLogo}>Remove</Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Recommended: PNG or SVG, max height 40px. Leave empty to show text logo.</p>
        </div>

        {/* Favicon Upload */}
        <div className="border-t border-border pt-4">
          <Label className="flex items-center gap-1 mb-3"><Image className="h-3.5 w-3.5" /> Favicon</Label>
          <div className="flex items-center gap-4">
            {faviconUrl ? (
              <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain rounded border border-border p-0.5" />
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">ICO</div>
            )}
            <div className="flex gap-2">
              <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "favicon"); }} />
              <Button variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}>
                {uploadingFavicon ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {faviconUrl ? "Change" : "Upload"}
              </Button>
              {faviconUrl && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRemoveFavicon}>Remove</Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Recommended: 32x32 or 64x64 PNG/ICO.</p>
        </div>
      </CardContent>
    </Card>
  );
}
