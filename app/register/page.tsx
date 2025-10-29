import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    
    try {
      // Create customer
      const customerRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({ 
          email, 
          password,
          first_name: firstName,
          last_name: lastName
        }),
      })
      
      if (customerRes.ok) {
        // Auto-login after registration
        const authRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/auth`, {
          method: 'POST',
          headers: { 
            'content-type': 'application/json',
            'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
          },
          body: JSON.stringify({ email, password }),
        })
        
        if (authRes.ok) {
          redirect('/')
        }
      } else {
        console.error('Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="max-w-md mx-auto px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Registrati</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Mario"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Cognome</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Rossi"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mario@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Registrati
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Hai già un account?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Accedi
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
