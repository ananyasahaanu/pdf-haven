import { Link } from "react-router-dom";
import { BookOpen, Github, Mail, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="gradient-text">PDFStore</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium digital marketplace for educational PDFs. Learn from the best authors worldwide.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
              <a href="mailto:bsrittik@gmail.com" className="text-muted-foreground hover:text-primary transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary transition-colors">Browse PDFs</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About CEO</Link></li>
              <li><Link to="/browse?category=Programming" className="hover:text-primary transition-colors">Programming</Link></li>
              <li><Link to="/browse?category=Design" className="hover:text-primary transition-colors">Design</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PDFStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
