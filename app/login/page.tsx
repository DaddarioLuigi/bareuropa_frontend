import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/auth`, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // In a real app, you'd set the auth token in a cookie
        redirect('/')
      } else {
        // Handle error - in a real app you'd show this to the user
        console.error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="max-w-md mx-auto px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleLogin} className="space-y-4">
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
                  Accedi
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Non hai un account?{' '}
                  <Link href="/register" className="text-primary hover:underline">
                    Registrati
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
