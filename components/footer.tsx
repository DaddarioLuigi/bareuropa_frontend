import { EuropaLogo } from "@/components/europa-logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <EuropaLogo size="lg" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Tradizione italiana dal 1966</p>
            <p className="text-muted-foreground leading-relaxed">
              Pasticceria, caffetteria e gelateria artigianale nel cuore di Trani. Tre generazioni di passione per
              l'autentico sapore italiano.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Link Rapidi</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/la-nostra-storia" className="hover:text-accent transition-colors">
                  La Nostra Storia
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Prodotti
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="hover:text-accent transition-colors">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Legale</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-accent transition-colors">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/termini-e-condizioni" className="hover:text-accent transition-colors">Termini e Condizioni</Link>
              </li>
              <li>
                <Link href="/resi-e-rimborsi" className="hover:text-accent transition-colors">Resi e Rimborsi</Link>
              </li>
              <li>
                <Link href="/spedizioni" className="hover:text-accent transition-colors">Spedizioni</Link>
              </li>
              <li>
                <Link href="/note-legali" className="hover:text-accent transition-colors">Note Legali</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Contatti</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a 
                  href="https://maps.google.com/?q=Corso+Vittorio+Emanuele+II+161,+76125+Trani" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Corso Vittorio Emanuele II 161, 76125 Trani
                </a>
              </li>
              <li>
                <a 
                  href="tel:+390883583483" 
                  className="hover:text-accent transition-colors"
                  aria-label="Chiama Bar Europa"
                >
                  0883 583483
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@bareuropa.it" 
                  className="hover:text-accent transition-colors"
                  aria-label="Invia email a Bar Europa"
                >
                  info@bareuropa.it
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Bar Europa. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
