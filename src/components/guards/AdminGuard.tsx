/**
 * Admin Role Guard Component
 * 管理员角色守卫组件
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
      toast({
        title: t("errors.accessDenied"),
        description: t("errors.adminRoleRequired"),
        variant: "destructive",
      });
    }
  }, [isAdmin, isLoading, navigate, toast, t]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">{t("errors.accessDenied")}</h3>
          <p className="mt-2 text-muted-foreground">
            {t("errors.adminRoleRequired")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
