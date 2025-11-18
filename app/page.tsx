import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { StorySection } from "@/components/story-section"
import { ProductsSection } from "@/components/products-section"
import { GoogleReviewsSection } from "@/components/google-reviews-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StorySection />
      <ProductsSection />
      <GoogleReviewsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
