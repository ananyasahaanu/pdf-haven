import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, LayoutDashboard, Languages, Library, LogIn, LogOut, Menu, Moon, Search, Shield, Sun, User, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="gradient-text">PDFStore</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm">{t("nav.home")}</Button>
          </Link>
          <Link to="/browse">
            <Button variant="ghost" size="sm">{t("nav.browse")}</Button>
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/library">
                <Button variant="ghost" size="sm">
                  <Library className="mr-1 h-4 w-4" />
                  {t("nav.library")}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Shield className="mr-1 h-4 w-4" />
                {t("nav.admin")}
              </Button>
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PDFs..."
                className="h-8 w-40 md:w-60"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Admin Notifications */}
          <NotificationBell />

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            title={language === "en" ? "বাংলায় পড়ুন" : "Read in English"}
          >
            <Languages className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">{user?.name}</div>
                <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user?.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/library")}>
                  <Library className="mr-2 h-4 w-4" /> {t("nav.library")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" /> {t("nav.adminPanel")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gradient-bg text-primary-foreground border-0">
                <LogIn className="mr-1 h-4 w-4" />
                {t("nav.login")}
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container flex flex-col gap-1 py-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">{t("nav.home")}</Button>
            </Link>
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">{t("nav.browse")}</Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/library" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Library className="mr-2 h-4 w-4" /> {t("nav.library")}
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" /> {t("nav.admin")}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
