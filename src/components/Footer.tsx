import { Link } from "react-router-dom";
import { BookOpen, Github, Mail, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/40 bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="gradient-text">PDFStore</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("footer.desc")}</p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
              <a href="mailto:bsrittik@gmail.com" className="text-muted-foreground hover:text-primary transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary transition-colors">{t("footer.browsePdfs")}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("footer.aboutCeo")}</Link></li>
              <li><Link to="/browse?category=Programming" className="hover:text-primary transition-colors">Programming</Link></li>
              <li><Link to="/browse?category=Design" className="hover:text-primary transition-colors">Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t("footer.helpCenter")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t("footer.contactUs")}</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary transition-colors">{t("footer.refundPolicy")}</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t("footer.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">{t("footer.cookies")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PDFStore. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
