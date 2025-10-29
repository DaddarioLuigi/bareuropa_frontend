"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Coffee, Heart, Award, Clock } from "lucide-react"
import { motion } from "framer-motion"

export default function StoryPage() {
  const timeline = [
    {
      year: "1966",
      title: "La Fondazione",
      description: "Francesco e Cataldo Farucci aprono Bar Europa nel cuore di Trani, lungo Corso Vittorio Emanuele, con la passione per il caffè italiano e la pasticceria tradizionale.",
      icon: Coffee,
      image: "/storia_1.jpeg"
    },
    {
      year: "1975",
      title: "L'Espansione",
      description: "Il bar diventa un punto di riferimento per i tranesi. Si amplia l'offerta di pasticceria fresca e si consolida la reputazione per cornetti e caffè di qualità.",
      icon: Users,
      image: "/storia_2.jpeg"
    },
    {
      year: "1985",
      title: "La Seconda Generazione",
      description: "La famiglia Farucci porta innovazioni nella pasticceria introducendo nuove ricette mantenendo la tradizione familiare e l'attenzione alla qualità.",
      icon: Heart,
      image: "/storia_3.jpeg"
    },
    {
      year: "2000",
      title: "Il Rinnovamento",
      description: "Bar Europa rinnova i suoi interni con uno stile luminoso e archi in pietra, mantenendo l'atmosfera accogliente che contraddistingue il locale.",
      icon: Award,
      image: "/storia_4.jpeg"
    },
    {
      year: "2015",
      title: "La Tradizione Continua",
      description: "Oggi Bar Europa continua la sua tradizione con Francesco e Cataldo Farucci & C. S.n.c., mantenendo l'autenticità e la qualità che ci contraddistingue da oltre cinquant'anni.",
      icon: Clock,
      image: "/italian-caf--storefront-with-outdoor-seating-and-w.jpg"
    }
  ]

  const values = [
    {
      title: "Tradizione",
      description: "Ricette tramandate di generazione in generazione",
      icon: Heart
    },
    {
      title: "Qualità",
      description: "Solo ingredienti freschi e di prima qualità",
      icon: Award
    },
    {
      title: "Passione",
      description: "Amore per l'arte dolciaria italiana",
      icon: Coffee
    },
    {
      title: "Famiglia",
      description: "Un ambiente accogliente per tutti",
      icon: Users
    }
  ]

  return (
    <main className="min-h-screen bg-background pt-16">
      <Navigation />

       {/* Hero Section */}
       <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              className="font-display text-4xl md:text-5xl font-bold text-primary mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Una Tradizione di Famiglia
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tre generazioni di maestri pasticceri che hanno portato avanti l'arte dolciaria italiana con passione e dedizione
            </motion.p>
          </div>
        </section>
      

      {/* Main Story Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
                La nostra storia
                <span className="block text-accent text-3xl md:text-4xl mt-2">inizia nel 1966</span>
              </h2>

              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Nel cuore di Trani, lungo Corso Vittorio Emanuele, Bar Europa nasce nel 1966 dalla passione della famiglia Farucci per l'arte dolciaria e la tradizione del caffè. Da oltre cinquant'anni, portiamo avanti l'eredità dei nostri fondatori Francesco e Cataldo con la stessa dedizione e amore.
                </p>

                <p>
                  Ogni mattina, i nostri maestri pasticceri preparano a mano cornetti fragranti, mignon delicati e torte artigianali, seguendo ricette tramandate di generazione in generazione. Il nostro caffè, selezionato con cura, offre l'autentico sapore dell'espresso italiano nel nostro locale rinnovato con interni luminosi e archi in pietra.
                </p>

                <p>
                  Il nostro ricco banco di dolci e il dehors su Corso Vittorio Emanuele sono il cuore pulsante della nostra attività, dove i clienti possono gustare le nostre specialità in un ambiente accogliente e familiare.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="font-display text-3xl font-bold text-accent mb-2">58</div>
                    <div className="text-sm text-muted-foreground">Anni di Tradizione</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="font-display text-3xl font-bold text-accent mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Specialità Artigianali</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="font-display text-3xl font-bold text-accent mb-2">3</div>
                    <div className="text-sm text-muted-foreground">Generazioni</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img src="/home_hero.jpeg" alt="Storia di Bar Europa" className="w-full h-full object-cover" />
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              La Nostra Timeline
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un viaggio attraverso i momenti più importanti della nostra storia familiare
            </p>
          </motion.div>

          <div className="space-y-12">
            {timeline.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.year}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <Card className="shadow-lg">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="text-lg font-semibold px-4 py-2">
                              {item.year}
                            </Badge>
                            <h3 className="text-2xl font-bold text-primary mt-2">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Image */}
                  <div className="flex-1">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={item.image} 
                        alt={`${item.year} - ${item.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              I Nostri Valori
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              I principi che guidano ogni giorno il nostro lavoro e la nostra passione
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-4">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Vieni a Scoprire la Nostra Tradizione
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Ti aspettiamo per farti assaporare l'autentica tradizione italiana in un ambiente accogliente e familiare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg"
              >
                <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer">Contattaci</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-4 text-lg"
              >
                Scopri i Nostri Prodotti
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
