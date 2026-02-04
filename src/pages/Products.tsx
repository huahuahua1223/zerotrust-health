/**
 * Products List Page
 * 产品列表页面
 */

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Package } from "lucide-react";
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

export default function Products() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("premium-asc");
  const [showInactive, setShowInactive] = useState(false);

  const { products, isLoading, error } = useProducts(0n, 50n); // 查询前50个产品
  const [productsWithMetadata, setProductsWithMetadata] = useState<ProductWithMetadata[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // 加载产品元数据
  useEffect(() => {
    if (products.length > 0) {
      setIsLoadingMetadata(true);
      Promise.all(
        products.map(async (product) => {
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
  }, [products]);

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

      {/* Filters */}
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

      {/* Products Grid */}
      {!isLoading && !isLoadingMetadata && !error && filteredProducts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id.toString()} product={product} index={index} />
          ))}
        </div>
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
