import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Shield,
  Wallet,
  LogOut,
  User,
  Building2,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/locales";
import { useUserRoles } from "@/hooks";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";
import { supportedChains } from "@/config/wagmi";

export function Header() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { isAdmin, isInsurer } = useUserRoles();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const currentChain = supportedChains.find((c) => c.id === chainId);

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/my-policies", label: t.nav.myPolicies },
    { href: "/my-claims", label: t.nav.myClaims },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="hidden font-display text-lg font-bold sm:inline-block">
            {t.common.appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Insurer Menu */}
          {isInsurer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Building2 className="h-4 w-4" />
                  {t.nav.insurer}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/insurer/dashboard">{t.insurer.dashboard}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/insurer/products">{t.insurer.products}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/insurer/claims">{t.insurer.claims}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Admin Menu */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Settings className="h-4 w-4" />
                  {t.nav.admin}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin/roles">{t.admin.roles}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/system">{t.admin.system}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Chain Switcher */}
          {isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden gap-1 sm:flex">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  {currentChain?.name || "Unknown"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {supportedChains.map((chain) => (
                  <DropdownMenuItem
                    key={chain.id}
                    onClick={() => switchChain({ chainId: chain.id })}
                    className={cn(chainId === chain.id && "bg-accent")}
                  >
                    {chain.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Wallet Connection */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{formatAddress(address!)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-policies" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t.nav.myPolicies}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-claims" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t.nav.myClaims}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.common.disconnect}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.common.connectWallet}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                      {t.nav.insurer}
                    </p>
                    <Link
                      to="/insurer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t.insurer.dashboard}
                    </Link>
                    <Link
                      to="/insurer/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t.insurer.products}
                    </Link>
                    <Link
                      to="/insurer/claims"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t.insurer.claims}
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div className="my-2 border-t" />
                    <p className="px-4 text-xs font-semibold uppercase text-muted-foreground">
                      {t.nav.admin}
                    </p>
                    <Link
                      to="/admin/roles"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t.admin.roles}
                    </Link>
                    <Link
                      to="/admin/system"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {t.admin.system}
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
