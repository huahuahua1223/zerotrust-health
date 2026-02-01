import { useState, useMemo } from "react";
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
import { ProductCard } from "@/components/products";
import { useTranslation } from "react-i18next";
import type { Product } from "@/types";

// Mock products for demo (will be replaced with contract data)
const mockProducts: Product[] = [
  {
    id: 1n,
    name: "Basic Health Plan",
    description: "Essential coverage for common illnesses and treatments. Perfect for individuals seeking basic protection.",
    premium: 100_000000n, // 100 USDT
    coverageAmount: 10000_000000n, // 10,000 USDT
    duration: 365n * 24n * 60n * 60n, // 365 days
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 50000_000000n,
  },
  {
    id: 2n,
    name: "Premium Health Plan",
    description: "Comprehensive coverage including major surgeries, cancer treatment, and chronic disease management.",
    premium: 500_000000n,
    coverageAmount: 100000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 250000_000000n,
  },
  {
    id: 3n,
    name: "Family Protection",
    description: "Cover your entire family with one plan. Includes preventive care and emergency services.",
    premium: 800_000000n,
    coverageAmount: 150000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 180000_000000n,
  },
  {
    id: 4n,
    name: "Cancer Shield",
    description: "Specialized coverage for cancer diagnosis and treatment, including immunotherapy and targeted therapy.",
    premium: 300_000000n,
    coverageAmount: 80000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 120000_000000n,
  },
  {
    id: 5n,
    name: "Heart Care Plus",
    description: "Comprehensive cardiac coverage including surgeries, stents, and rehabilitation programs.",
    premium: 400_000000n,
    coverageAmount: 120000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: true,
    poolBalance: 200000_000000n,
  },
  {
    id: 6n,
    name: "Senior Care",
    description: "Tailored for seniors with coverage for age-related conditions and long-term care needs.",
    premium: 600_000000n,
    coverageAmount: 80000_000000n,
    duration: 365n * 24n * 60n * 60n,
    insurer: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isActive: false,
    poolBalance: 0n,
  },
];

export default function Products() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("premium-asc");
  const [showInactive, setShowInactive] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = mockProducts;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter inactive
    if (!showInactive) {
      products = products.filter((p) => p.isActive);
    }

    // Sort
    products = [...products].sort((a, b) => {
      switch (sortBy) {
        case "premium-asc":
          return Number(a.premium - b.premium);
        case "premium-desc":
          return Number(b.premium - a.premium);
        case "coverage-asc":
          return Number(a.coverageAmount - b.coverageAmount);
        case "coverage-desc":
          return Number(b.coverageAmount - a.coverageAmount);
        default:
          return 0;
      }
    });

    return products;
  }, [searchQuery, sortBy, showInactive]);

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
            {t("products.showInactive")}
          </Button>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id.toString()} product={product} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t("products.noProducts")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("products.noMatch")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
