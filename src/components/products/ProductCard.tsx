import { formatUnits } from "viem";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Shield, Coins, TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/locales";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useI18n();

  const formatUSDT = (value: bigint) => {
    return parseFloat(formatUnits(value, 6)).toLocaleString();
  };

  const formatDays = (seconds: bigint) => {
    return Math.floor(Number(seconds) / 86400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="card-hover h-full overflow-hidden border-border/50 bg-card/50">
        {/* Gradient header */}
        <div className="relative h-2 bg-gradient-primary" />

        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
            {product.isActive ? (
              <Badge className="bg-success/10 text-success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Coins className="h-3 w-3" />
                {t.products.premium}
              </div>
              <div className="font-semibold text-primary">
                ${formatUSDT(product.premium)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                {t.products.coverage}
              </div>
              <div className="font-semibold">${formatUSDT(product.coverageAmount)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t.products.duration}
              </div>
              <div className="font-semibold">
                {formatDays(product.duration)} {t.products.days}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {t.products.poolBalance}
              </div>
              <div className="font-semibold text-accent">
                ${formatUSDT(product.poolBalance)}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2 border-t bg-muted/20 p-4">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/products/${product.id.toString()}`}>
              {t.products.viewDetails}
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-gradient-primary hover:opacity-90">
            <Link to={`/products/${product.id.toString()}?buy=true`}>
              {t.products.buyNow}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
