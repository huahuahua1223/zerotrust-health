/**
 * Products List Page
 * 产品列表页面 - 支持表格/卡片视图切换
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Package, Grid3x3, TableProperties } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks";
import { fetchProductMetadata } from "@/lib/ipfs";
import type { ProductWithMetadata } from "@/types";

type ViewMode = "card" | "table";

export default function Products() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("premium-asc");
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const { products, isLoading, error } = useProducts(0n, 50n);
  const [productsWithMetadata, setProductsWithMetadata] = useState<ProductWithMetadata[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const stableProducts = useMemo(() => products, [JSON.stringify(products.map(p => p.id.toString()))]);

  useEffect(() => {
    if (stableProducts.length > 0) {
      setIsLoadingMetadata(true);
      
      Promise.all(
        stableProducts.map(async (product) => {
          const metadata = await fetchProductMetadata(product.uri).catch(() => ({
            name: `${t("common.productPrefix")}${product.id}`,
            description: t("common.fallbackDesc"),
            diseases: [],
          }));
          
          return {
            ...product,
            metadata,
          };
        })
      ).then((productsWithMeta) => {
        setProductsWithMetadata(productsWithMeta);
        setIsLoadingMetadata(false);
      });
    }
  }, [stableProducts, t]);

  const filteredProducts = useMemo(() => {
    let filtered = productsWithMetadata || [];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.metadata?.name.toLowerCase().includes(query) ||
          p.metadata?.description.toLowerCase().includes(query) ||
          p.id.toString().includes(query)
      );
    }

    // Filter inactive
    if (!showInactive) {
      filtered = filtered.filter((p) => p.active);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "premium-asc":
          return Number(a.premiumAmount - b.premiumAmount);
        case "premium-desc":
          return Number(b.premiumAmount - a.premiumAmount);
        case "coverage-asc":
          return Number(a.maxCoverage - b.maxCoverage);
        case "coverage-desc":
          return Number(b.maxCoverage - a.maxCoverage);
        default:
          return 0;
      }
    });

    return filtered;
  }, [productsWithMetadata, searchQuery, sortBy, showInactive]);

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="mb-2 font-display text-3xl font-bold">{t("products.title")}</h1>
        <p className="text-muted-foreground">{t("products.subtitle")}</p>
      </motion.div>

      {/* Filters with View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card/30 p-1">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-8"
              onClick={() => setViewMode("card")}
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">卡片</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1 h-8"
              onClick={() => setViewMode("table")}
            >
              <TableProperties className="h-4 w-4" />
              <span className="hidden sm:inline">表格</span>
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("products.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium-asc">{t("products.premiumLowHigh")}</SelectItem>
              <SelectItem value="premium-desc">{t("products.premiumHighLow")}</SelectItem>
              <SelectItem value="coverage-asc">{t("products.coverageLowHigh")}</SelectItem>
              <SelectItem value="coverage-desc">{t("products.coverageHighLow")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showInactive ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? t("common.hideInactive") : t("products.showInactive")}
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {(isLoading || isLoadingMetadata) && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4 rounded-xl border p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Package className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("common.error")}</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || t("products.loadError")}
          </p>
        </motion.div>
      )}

      {/* Products Grid/Table View */}
      {!isLoading && !isLoadingMetadata && !error && filteredProducts.length > 0 && (
        <AnimatePresence mode="wait">
          {viewMode === "card" ? (
            <motion.div
              key="card-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">{t("products.title")}</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold">{t("products.premium")}</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold">{t("products.coverage")}</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">{t("products.duration")}</th>
                      <th className="px-4 py-4 text-right text-sm font-semibold">{t("products.poolBalance")}</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">{t("common.active")}</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">{t("common.manage")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id.toString()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b last:border-0 transition-colors hover:bg-accent/30"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">
                              {product.metadata?.name || `${t("common.productPrefix")}${product.id}`}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.metadata?.description || t("common.fallbackDesc")}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          <span className="font-medium text-primary">
                            ${(Number(product.premiumAmount) / 1_000_000).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums font-medium">
                          ${(Number(product.maxCoverage) / 1_000_000).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center tabular-nums">
                          {product.coveragePeriodDays} 天
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          <span className="font-medium text-primary">
                            ${product.poolBalance ? (Number(product.poolBalance) / 1_000_000).toLocaleString() : "0"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex h-2 w-2 rounded-full" 
                            style={{ backgroundColor: product.active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <a href={`/products/${product.id.toString()}`}>
                                {t('products.viewDetails')}
                              </a>
                            </Button>
                            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                              <a href={`/products/${product.id.toString()}?buy=true`}>
                                {t('products.buyNow')}
                              </a>
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!isLoading && !isLoadingMetadata && !error && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {productsWithMetadata.length > 0 ? t("products.noMatch") : t("products.noProducts")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {productsWithMetadata.length > 0
              ? t("products.noMatchDesc")
              : t("products.noProductsDesc")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
