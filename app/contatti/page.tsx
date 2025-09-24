"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Clock, Mail, Send, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Contact Info Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Contattaci
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Siamo sempre felici di sentirti! Contattaci per prenotazioni, domande sui nostri prodotti o semplicemente per condividere la tua esperienza con noi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Send className="h-6 w-6" />
                    Invia un Messaggio
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Compila il modulo sottostante e ti risponderemo il prima possibile.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        Messaggio Inviato!
                      </h3>
                      <p className="text-muted-foreground">
                        Grazie per averci contattato. Ti risponderemo presto!
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">
                            Nome *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="Il tuo nome"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="la.tua@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Telefono
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="+39 123 456 7890"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject" className="text-sm font-medium">
                            Oggetto *
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="Motivo del contatto"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-sm font-medium">
                          Messaggio *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          className="mt-1 min-h-[120px]"
                          placeholder="Scrivi qui il tuo messaggio..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                        size="lg"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Invia Messaggio
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Contact Details */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Informazioni di Contatto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Indirizzo</h3>
                      <p className="text-muted-foreground">
                        Via Roma 123
                        <br />
                        20100 Milano, Italia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Telefono</h3>
                      <p className="text-muted-foreground">+39 02 1234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Email</h3>
                      <p className="text-muted-foreground">info@bareuropa.it</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Orari di Apertura</h3>
                      <div className="text-muted-foreground space-y-1">
                        <p>Lunedì - Venerdì: 6:30 - 20:00</p>
                        <p>Sabato: 7:00 - 21:00</p>
                        <p>Domenica: 8:00 - 19:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Azioni Rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3">
                    Prenota un Tavolo
                  </Button>
                  <Button variant="outline" className="w-full font-semibold py-3">
                    Visualizza Menu
                  </Button>
                  <Button variant="outline" className="w-full font-semibold py-3">
                    Ordina Online
                  </Button>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Come Raggiungerci
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">Mappa Interattiva</p>
                      <p className="text-sm">Via Roma 123, Milano</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
