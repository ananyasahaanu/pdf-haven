import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Globe, BookOpen, Heart, Lightbulb, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AboutCEO() {
  const { t } = useLanguage();

  const { data: ceoPhotoUrl } = useQuery({
    queryKey: ["ceo-photo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ceo_photo_url")
        .single();
      return data?.value || null;
    },
  });

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><User className="mr-1 h-3 w-3" /> {t("ceo.badge")}</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{t("ceo.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("ceo.subtitle")}</p>
        </div>

        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8 text-center">
            {ceoPhotoUrl ? (
              <img
                src={ceoPhotoUrl}
                alt="Brazil Singh"
                className="mx-auto mb-6 h-28 w-28 rounded-full object-cover shadow-lg border-4 border-primary/20"
              />
            ) : (
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full gradient-bg text-primary-foreground">
                <span className="font-display text-4xl font-bold">BS</span>
              </div>
            )}
            <h2 className="font-display text-2xl font-bold">{t("ceo.name")}</h2>
            <p className="text-primary font-medium mt-1">{t("ceo.role")}</p>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">{t("ceo.bio")}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" /> {t("ceo.storyTitle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("ceo.storyP1")}</p>
              <p className="text-muted-foreground leading-relaxed mt-3">{t("ceo.storyP2")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" /> {t("ceo.visionTitle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("ceo.visionQuote")}</p>
              <p className="text-muted-foreground mt-3 italic">— Brazil Singh</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary" /> {t("ceo.philosophyTitle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("ceo.philosophy")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" /> {t("ceo.beyondTitle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("ceo.beyond")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-primary" /> {t("ceo.globalTitle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("ceo.global")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
