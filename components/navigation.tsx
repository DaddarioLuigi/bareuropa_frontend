"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { EuropaLogo } from "@/components/europa-logo"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state } = useCart()

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/">
              <EuropaLogo size="md" className="md:hidden" />
              <EuropaLogo size="lg" className="hidden md:block" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {[
                { href: "/", label: "Home" },
                { href: "/la-nostra-storia", label: "La Nostra Storia" },
                { href: "/prodotti", label: "Prodotti" },
                { href: "/shop", label: "Shop" },
                { href: "/contatti", label: "Contatti" },
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-accent transition-colors font-medium relative group"
                  >
                    {item.label}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"
                      whileHover={{ width: "100%" }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/carrello">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {state.itemCount > 0 && (
                      <motion.span
                        className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {state.itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Prenota un Tavolo</Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
                {[
                  { href: "/", label: "Home" },
                  { href: "/la-nostra-storia", label: "La Nostra Storia" },
                  { href: "/prodotti", label: "Prodotti" },
                  { href: "/shop", label: "Shop" },
                  { href: "/contatti", label: "Contatti" },
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-muted-foreground hover:text-accent transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  className="px-3 py-2 space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Link href="/carrello" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Carrello ({state.itemCount})
                    </Button>
                  </Link>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Prenota un Tavolo
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
