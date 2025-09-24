"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Coffee, Cake, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src="/elegant-italian-caf--interior-with-warm-lighting--.jpg"
          alt="Bar Europa Interior"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-primary/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 pb-20 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary-foreground mb-4 sm:mb-6 text-balance leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Tradizione italiana
            <motion.span
              className="block text-accent mt-1 sm:mt-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              dal 1966
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-xl md:text-2xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto text-pretty leading-relaxed px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Scopri l'autentica esperienza italiana con le nostre specialità artigianali: pasticceria, caffè pregiato e
            gelato cremoso.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Link href="/shop">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
                >
                  Scopri i Nostri Prodotti
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-transparent w-full sm:w-auto"
              >
                Prenota un Tavolo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {[
              {
                icon: Cake,
                title: "Pasticceria",
                description: "Dolci artigianali preparati con ricette tradizionali",
                delay: 0,
              },
              {
                icon: Coffee,
                title: "Caffè",
                description: "Miscele pregiate per un espresso perfetto",
                delay: 0.2,
              },
              {
                icon: ShoppingBag,
                title: "Shop Online",
                description: "Acquista i nostri prodotti artigianali online",
                delay: 0.4,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-primary-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + item.delay }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="bg-accent/20 p-3 sm:p-4 rounded-full mb-3 sm:mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </motion.div>
                <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/80 text-center text-sm sm:text-base">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.0 }}
      >
        <motion.div
          className="animate-bounce"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-primary-foreground rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-primary-foreground rounded-full mt-1 sm:mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
