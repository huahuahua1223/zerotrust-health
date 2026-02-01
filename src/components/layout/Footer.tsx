import { Link } from "react-router-dom";
import { Shield, Github, FileText, MessageCircle } from "lucide-react";
import { useI18n } from "@/locales";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">{t.common.appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t.footer.description}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t.footer.links}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/products"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.nav.products}
                </Link>
              </li>
              <li>
                <Link
                  to="/my-policies"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.nav.myPolicies}
                </Link>
              </li>
              <li>
                <Link
                  to="/my-claims"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.nav.myClaims}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t.footer.resources}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  {t.footer.docs}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  {t.footer.github}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.footer.support}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.footer.privacy}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
