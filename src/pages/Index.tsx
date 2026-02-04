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

  const features = [
    {
      icon: Lock,
      title: t("home.features.privacy.title"),
      description: t("home.features.privacy.description"),
      gradient: "from-primary to-secondary",
    },
    {
      icon: Eye,
      title: t("home.features.transparent.title"),
      description: t("home.features.transparent.description"),
      gradient: "from-secondary to-accent",
    },
    {
      icon: Zap,
      title: t("home.features.fast.title"),
      description: t("home.features.fast.description"),
      gradient: "from-accent to-primary",
    },
    {
      icon: Shield,
      title: t("home.features.secure.title"),
      description: t("home.features.secure.description"),
      gradient: "from-primary to-accent",
    },
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
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
            >
              <Shield className="h-4 w-4" />
              {t("home.heroSubtitle")}
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-gradient">{t("home.heroTitle")}</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mb-8 text-lg text-muted-foreground sm:text-xl"
            >
              {t("home.heroDescription")}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-primary text-lg hover:opacity-90"
              >
                <Link to="/products">
                  {t("home.exploreProducts")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link to="#how-it-works">{t("home.howItWorks")}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { value: "10+", label: t("home.stats.products") },
              { value: "500+", label: t("home.stats.policies") },
              { value: "100+", label: t("home.stats.claims") },
              { value: "$1M+", label: t("home.stats.value") },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-gradient sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">
              {t("home.whyChooseTitle")} <span className="text-gradient">{t("common.appName")}</span>?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("home.whyChooseSubtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-hover h-full border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">
              {t("home.howItWorks")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("home.howItWorksSubtitle")}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary via-secondary to-accent lg:block" />

            <div className="grid gap-8 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 sm:p-12"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10" />
            </div>

            <div className="relative text-center text-white">
              <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">
                {t("home.readyToStart")}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-white/80">
                {t("home.readyToStartSubtitle")}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-lg"
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
                  className="gap-2 border-white/30 bg-transparent text-lg text-white hover:bg-white/10 hover:text-white"
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
