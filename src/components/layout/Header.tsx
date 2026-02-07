import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Shield,
  Building2,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserRoles } from "@/hooks";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/web3";

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { isAdmin, isInsurer } = useUserRoles();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll behavior for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/my-policies", label: t("nav.myPolicies") },
    { href: "/my-claims", label: t("nav.myClaims") },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-200",
        isScrolled 
          ? "h-14 border-border/80 bg-background/95 shadow-sm" 
          : "h-16 border-border/40 bg-background/80"
      )}
    >
      <div className={cn(
        "container flex items-center justify-between transition-all duration-200",
        isScrolled ? "h-14" : "h-16"
      )}>
        {/* Logo with hover microinteraction */}
        <Link to="/" className="group flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-primary transition-all duration-200 group-hover:scale-110 group-hover:rotate-6",
            isScrolled ? "h-8 w-8" : "h-9 w-9"
          )}>
            <Shield className={cn(
              "text-primary-foreground transition-all duration-200",
              isScrolled ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
          <span className="hidden font-display text-lg font-bold sm:inline-block">
            {t("common.appName")}
          </span>
        </Link>

        {/* Desktop Navigation - refined active state with subtle shadow */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Insurer Menu */}
          {isInsurer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "gap-1 transition-all duration-150",
                    location.pathname.startsWith("/insurer") && "bg-primary/10 text-primary ring-1 ring-primary/20"
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  {t("nav.insurer")}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/insurer/dashboard">{t("insurer.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/insurer/products">{t("insurer.products")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/insurer/claims">{t("insurer.claims")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Admin Menu */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "gap-1 transition-all duration-150",
                    location.pathname.startsWith("/admin") && "bg-primary/10 text-primary ring-1 ring-primary/20"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  {t("nav.admin")}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin/roles">{t("admin.roles")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/system">{t("admin.system")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right side controls - refined cluster with scroll adaptation */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1 rounded-lg border bg-card/30 p-1 backdrop-blur-sm transition-all duration-200",
            isScrolled ? "border-border/60" : "border-border/50"
          )}>
            {/* Language Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md transition-all duration-150 hover:bg-accent">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-popover">
                <DropdownMenuItem 
                  onClick={() => changeLanguage("en")}
                  className={cn(i18n.language === "en" && "bg-accent")}
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage("zh")}
                  className={cn(i18n.language === "zh" && "bg-accent")}
                >
                  🇨🇳 中文
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-5 w-px bg-border/50" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md transition-all duration-150 hover:bg-accent"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* Wallet Connection (uses AppKit) */}
          <WalletButton />

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="flex flex-col gap-2 pt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent",
                      location.pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                {isInsurer && (
                  <>
                    <div className="my-2 border-t" />
                    <p className="px-4 text-xs font-semibold uppercase text-muted-foreground">
                      {t("nav.insurer")}
                    </p>
                    <Link
                      to="/insurer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t("insurer.dashboard")}
                    </Link>
                    <Link
                      to="/insurer/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t("insurer.products")}
                    </Link>
                    <Link
                      to="/insurer/claims"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t("insurer.claims")}
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div className="my-2 border-t" />
                    <p className="px-4 text-xs font-semibold uppercase text-muted-foreground">
                      {t("nav.admin")}
                    </p>
                    <Link
                      to="/admin/roles"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t("admin.roles")}
                    </Link>
                    <Link
                      to="/admin/system"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t("admin.system")}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
