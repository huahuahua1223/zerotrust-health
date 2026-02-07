import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Zap,
  Eye,
  ArrowRight,
  FileCheck,
  Wallet,
  Send,
  Package,
  TrendingUp,
  CheckCircle,
  BadgeCheck,
  Database,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Index() {
  const { t } = useTranslation();

  // Bento grid features (6 items, asymmetric layout)
  const bentoFeatures = [
    {
      icon: Lock,
      title: t("home.features.privacy.title"),
      description: t("home.features.privacy.description"),
      size: "large", // col-span-2 row-span-2
    },
    {
      icon: Eye,
      title: t("home.features.transparent.title"),
      description: t("home.features.transparent.description"),
      size: "small",
    },
    {
      icon: Zap,
      title: t("home.features.fast.title"),
      description: t("home.features.fast.description"),
      size: "small",
    },
    {
      icon: Shield,
      title: t("home.features.secure.title"),
      description: t("home.features.secure.description"),
      size: "small",
    },
    {
      icon: Database,
      title: t("home.features.onChain.title"),
      description: t("home.features.onChain.description"),
      size: "small",
    },
  ];

  // Trust badges
  const trustBadges = [
    { icon: ShieldCheck, title: t("home.trustBadges.zkTitle"), desc: t("home.trustBadges.zkDesc") },
    { icon: BadgeCheck, title: t("home.trustBadges.privacyTitle"), desc: t("home.trustBadges.privacyDesc") },
    { icon: Lock, title: t("home.trustBadges.auditTitle"), desc: t("home.trustBadges.auditDesc") },
  ];

  const steps = [
    {
      icon: Wallet,
      title: t("home.steps.connectWallet"),
      description: t("home.steps.connectWalletDesc"),
    },
    {
      icon: FileCheck,
      title: t("home.steps.buyPolicy"),
      description: t("home.steps.buyPolicyDesc"),
    },
    {
      icon: Lock,
      title: t("home.steps.generateProof"),
      description: t("home.steps.generateProofDesc"),
    },
    {
      icon: Send,
      title: t("home.steps.submitClaim"),
      description: t("home.steps.submitClaimDesc"),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden surface-1 py-20 lg:py-32">
        {/* Subtle vignette for depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] opacity-60" />
        
        {/* Background decorations - more restrained */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />
          <div className="absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
              >
                <Shield className="h-4 w-4" />
                {t("home.heroSubtitle")}
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {t("home.heroTitlePrefix")}
                <span className="text-primary">{t("home.heroTitleHighlight")}</span>
                {t("home.heroTitleSuffix")}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground sm:text-xl max-w-xl"
              >
                {t("home.heroDescription")}
              </motion.p>

              {/* Trust Badges */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-3"
              >
                {trustBadges.map((badge, idx) => (
                  <div key={idx} className="trust-badge">
                    <badge.icon className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{badge.title}</span>
                      <span className="text-xs text-muted-foreground">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground text-lg hover:bg-primary/90 transition-all duration-150"
                >
                  <Link to="/products">
                    {t("home.exploreProducts")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg transition-all duration-150">
                  <Link to="#how-it-works">{t("home.howItWorks")}</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: ZK Process Visual Anchor */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="space-y-4">
                  {[
                    { icon: Wallet, title: t("home.heroSteps.insure"), desc: t("home.heroSteps.insureDesc"), step: 1 },
                    { icon: Lock, title: t("home.heroSteps.zkProof"), desc: t("home.heroSteps.zkProofDesc"), step: 2 },
                    { icon: CheckCircle, title: t("home.heroSteps.settlement"), desc: t("home.heroSteps.settlementDesc"), step: 3 },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.15, duration: 0.5 }}
                      className="group"
                    >
                      <Card className="border-border bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:border-primary/30">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                                <item.icon className="h-7 w-7" />
                              </div>
                              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground shadow-sm">
                                {item.step}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {idx < 2 && (
                        <div className="ml-7 h-8 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats - horizontal scroll on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-20"
          >
            <div className="mx-auto max-w-5xl overflow-x-auto scrollbar-hide">
              <div className="grid min-w-[640px] grid-cols-4 gap-6 sm:min-w-0">
                {[
                  { icon: Package, value: "10+", label: t("home.stats.products") },
                  { icon: Shield, value: "500+", label: t("home.stats.policies") },
                  { icon: FileCheck, value: "100+", label: t("home.stats.claims") },
                  { icon: TrendingUp, value: "$1M+", label: t("home.stats.value") },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="stat-card-hover group rounded-2xl border border-border bg-card p-6 text-center backdrop-blur-sm"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-foreground">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid Layout */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl text-foreground">
              {t("home.whyChooseTitle")} <span className="text-primary">{t("common.appName")}</span>?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("home.whyChooseSubtitle")}
            </p>
          </motion.div>

          {/* Bento Grid - asymmetric layout for visual interest */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-6 lg:grid-cols-4 lg:grid-rows-2"
          >
            {bentoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={feature.size === "large" ? "bento-card-large" : "bento-card hover:border-primary/30"}
              >
                <div className={feature.size === "large" ? "flex flex-col h-full" : ""}>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-200 ${feature.size === "large" ? "mb-6" : "mb-4"}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`font-semibold text-foreground ${feature.size === "large" ? "text-2xl mb-4" : "text-lg mb-2"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-muted-foreground ${feature.size === "large" ? "text-base" : "text-sm"}`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="surface-2 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl text-foreground">
              {t("home.howItWorks")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("home.howItWorksSubtitle")}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10 lg:block" />

            <div className="grid gap-8 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg transition-transform duration-200 hover:scale-105">
                        <step.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-12 shadow-xl"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-foreground/10" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary-foreground/10" />
            </div>

            <div className="relative text-center text-primary-foreground">
              <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">
                {t("home.readyToStart")}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/90">
                {t("home.readyToStartSubtitle")}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-background text-foreground text-lg hover:bg-background/90 transition-all duration-150"
                >
                  <Link to="/products">
                    {t("home.exploreProducts")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-transparent text-lg text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-150"
                >
                  <Link to="#how-it-works">
                    {t("common.learnMore")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
