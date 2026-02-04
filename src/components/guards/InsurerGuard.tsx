/**
 * Insurer Role Guard Component
 * 保险公司角色守卫组件
 * 
 * 限制只有保险公司角色可以访问的页面
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsInsurer } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InsurerGuardProps {
  children: React.ReactNode;
}

export function InsurerGuard({ children }: InsurerGuardProps) {
  const { isInsurer, isLoading } = useIsInsurer();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isInsurer) {
      navigate("/");
      toast({
        title: t("errors.accessDenied"),
        description: t("errors.insurerRoleRequired"),
        variant: "destructive",
      });
    }
  }, [isInsurer, isLoading, navigate, toast, t]);

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

  if (!isInsurer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">{t("errors.accessDenied")}</h3>
          <p className="mt-2 text-muted-foreground">
            {t("errors.insurerRoleRequired")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
