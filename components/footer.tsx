export function Footer() {
  return (
    <footer className="bg-secondary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-primary mb-2">Bar Europa</h3>
            <p className="text-sm text-muted-foreground mb-4">Tradizione italiana dal 1966</p>
            <p className="text-muted-foreground leading-relaxed">
              Pasticceria, caffetteria e gelateria artigianale nel cuore di Milano. Tre generazioni di passione per
              l'autentico sapore italiano.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Link Rapidi</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#home" className="hover:text-accent transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#storia" className="hover:text-accent transition-colors">
                  La Nostra Storia
                </a>
              </li>
              <li>
                <a href="#prodotti" className="hover:text-accent transition-colors">
                  Prodotti
                </a>
              </li>
              <li>
                <a href="#contatti" className="hover:text-accent transition-colors">
                  Contatti
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Contatti</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>Via Roma 123, Milano</li>
              <li>+39 02 1234 5678</li>
              <li>info@bareuropa.it</li>
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
