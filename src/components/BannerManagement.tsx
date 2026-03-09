import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BannerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(false);
  const [type, setType] = useState("info");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["banner_text", "banner_link", "banner_active", "banner_type"]);
      const map = Object.fromEntries((data || []).map((d) => [d.key, d.value]));
      setText(map.banner_text || "");
      setLink(map.banner_link || "");
      setActive(map.banner_active === "true");
      setType(map.banner_type || "info");
      setLoaded(true);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: "banner_text", value: text },
        { key: "banner_link", value: link },
        { key: "banner_active", value: String(active) },
        { key: "banner_type", value: type },
      ];
      for (const s of settings) {
        const { data: existing } = await supabase
          .from("site_settings")
          .select("key")
          .eq("key", s.key)
          .maybeSingle();
        if (existing) {
          await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
        } else {
          await supabase.from("site_settings").insert(s);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["announcement-banner"] });
      toast({ title: "Banner saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  const types = [
    { id: "info", label: "Info", color: "bg-primary" },
    { id: "success", label: "Success", color: "bg-success" },
    { id: "warning", label: "Warning", color: "bg-amber-500" },
    { id: "promo", label: "Promo", color: "gradient-bg" },
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5" /> Announcement Banner
        </h3>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label className="text-sm font-medium">Enable Banner</Label>
            <p className="text-xs text-muted-foreground">Show banner across the site</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
        <div className="space-y-2">
          <Label>Banner Text</Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="🎉 50% off all PDFs this week!" />
        </div>
        <div className="space-y-2">
          <Label>Link (optional)</Label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/browse" />
        </div>
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="flex gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                  type === t.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`h-3 w-3 rounded-full ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Button className="gradient-bg text-primary-foreground border-0" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Banner
        </Button>
      </CardContent>
    </Card>
  );
}
