import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, Leaf, Droplets, Sparkles, ChevronDown, Menu, X as CloseIcon, Mail, MapPin, Loader2 } from "lucide-react";
import { SiFacebook, SiInstagram, SiPinterest } from "react-icons/si";
import heroImage from "@assets/generated_images/aloe_vera_with_water_droplets.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter", { email });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to L'Bri!",
        description: data.message,
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      newsletterMutation.mutate(email);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-botanical" />
              <span className="font-serif text-xl font-semibold text-foreground" data-testid="text-brand-name">
                L'Bri Pure n' Natural
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 flex-wrap">
              <button
                onClick={() => scrollToSection("aloe-first")}
                className="text-muted-foreground hover:text-botanical transition-colors"
                data-testid="link-aloe-first"
              >
                Aloe-First
              </button>
              <button
                onClick={() => scrollToSection("comparison")}
                className="text-muted-foreground hover:text-botanical transition-colors"
                data-testid="link-comparison"
              >
                The Difference
              </button>
              <button
                onClick={() => scrollToSection("products")}
                className="text-muted-foreground hover:text-botanical transition-colors"
                data-testid="link-products"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-muted-foreground hover:text-botanical transition-colors"
                data-testid="link-faq"
              >
                FAQ
              </button>
              <Button
                className="bg-botanical hover:bg-botanical-dark text-white"
                data-testid="button-shop-nav"
                asChild
              >
                <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                  Shop Catalog
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("aloe-first")}
                className="text-left text-muted-foreground hover:text-botanical transition-colors py-2"
                data-testid="link-aloe-first-mobile"
              >
                Aloe-First
              </button>
              <button
                onClick={() => scrollToSection("comparison")}
                className="text-left text-muted-foreground hover:text-botanical transition-colors py-2"
                data-testid="link-comparison-mobile"
              >
                The Difference
              </button>
              <button
                onClick={() => scrollToSection("products")}
                className="text-left text-muted-foreground hover:text-botanical transition-colors py-2"
                data-testid="link-products-mobile"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left text-muted-foreground hover:text-botanical transition-colors py-2"
                data-testid="link-faq-mobile"
              >
                FAQ
              </button>
              <Button
                className="bg-botanical hover:bg-botanical-dark text-white w-full"
                data-testid="button-shop-mobile"
                asChild
              >
                <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                  Shop Catalog
                </a>
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Fresh aloe vera plant with water droplets"
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6" data-testid="text-hero-headline">
              Why Pay for Water?
              <span className="block text-botanical mt-2">The Power of Aloe-First Skincare.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-subheadline">
              Experience L'Bri Pure n' Natural. The only skincare where{" "}
              <strong className="text-foreground">Aloe Barbadensis Miller</strong> is the first ingredient, not Aqua.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-botanical hover:bg-botanical-dark text-white px-8 py-6 text-lg"
                data-testid="button-shop-hero"
                asChild
              >
                <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                  Shop the Catalog
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-botanical text-botanical hover:bg-botanical/10 px-8 py-6 text-lg"
                onClick={() => scrollToSection("aloe-first")}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Definition Block - What is Aloe-First Skincare? */}
      <section id="aloe-first" className="bg-botanical-light py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl text-accent-orange opacity-30 font-serif">
              "
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8" data-testid="text-definition-title">
              What is Aloe-First Skincare?
            </h2>
          </div>
          <article className="prose prose-lg max-w-none">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed" data-testid="text-definition-content">
              <strong className="text-foreground">Aloe-First skincare</strong> replaces water as the primary ingredient with{" "}
              <strong className="text-botanical">pharmaceutical-grade Aloe Vera</strong>. This allows for deeper penetration, 
              natural enzymatic exfoliation, and superior hydration without the use of pore-clogging fillers or artificial preservatives.
            </p>
            <p className="text-muted-foreground mt-4">
              When you read the label on most skincare products, the first ingredient is "Water" or "Aqua." 
              With L'Bri, you're getting the healing power of aloe in every drop.
            </p>
          </article>
        </div>
      </section>

      {/* Comparison Table - The Aloe Difference */}
      <section id="comparison" className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center text-foreground mb-4" data-testid="text-comparison-title">
            The Aloe Difference
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how L'Bri Pure n' Natural compares to typical department store brands
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" data-testid="table-comparison">
              <thead>
                <tr className="bg-botanical text-white">
                  <th className="py-4 px-6 text-left font-semibold rounded-tl-lg">Feature</th>
                  <th className="py-4 px-6 text-center font-semibold">L'Bri Pure n' Natural</th>
                  <th className="py-4 px-6 text-center font-semibold rounded-tr-lg">Department Store Brands</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-botanical-light/50" data-testid="row-first-ingredient">
                  <td className="py-5 px-6 font-medium text-foreground border-b border-border">First Ingredient</td>
                  <td className="py-5 px-6 text-center border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-botanical" />
                      <span className="font-semibold text-botanical">Fresh Aloe Vera Gel</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5 text-accent-pink-dark" />
                      <span className="text-muted-foreground">Water (Aqua)</span>
                    </div>
                  </td>
                </tr>
                <tr data-testid="row-preservatives">
                  <td className="py-5 px-6 font-medium text-foreground border-b border-border">Preservatives</td>
                  <td className="py-5 px-6 text-center border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-botanical" />
                      <span className="font-semibold text-botanical">Food Grade / Natural</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center border-b border-border">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5 text-accent-pink-dark" />
                      <span className="text-muted-foreground">Parabens & Formaldehyde Donors</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-botanical-light/50" data-testid="row-effect">
                  <td className="py-5 px-6 font-medium text-foreground rounded-bl-lg">Effect</td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-botanical" />
                      <span className="font-semibold text-botanical">Heals & Reconstructs</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center rounded-br-lg">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5 text-accent-pink-dark" />
                      <span className="text-muted-foreground">Surface Hydration Only</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section id="products" className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center text-foreground mb-4" data-testid="text-products-title">
            Featured Product Sets
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover our curated skincare collections designed for your unique skin needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Deep Pore Trio */}
            <Card className="p-6 bg-white border-l-4 border-l-botanical" data-testid="card-deep-pore">
              <article>
                <div className="w-16 h-16 rounded-full bg-botanical-light flex items-center justify-center mb-4">
                  <Droplets className="w-8 h-8 text-botanical" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Deep Pore Trio</h3>
                <p className="text-muted-foreground mb-4">
                  For oily and combination skin types seeking deep cleansing and pore refinement.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-botanical flex-shrink-0" />
                    <span>Fresh Aloe Vera Base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-botanical flex-shrink-0" />
                    <span>Vitamins A, C, E</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-botanical flex-shrink-0" />
                    <span>Cucumber Extract</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-botanical flex-shrink-0" />
                    <span>Natural Herbal Blend</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-botanical hover:bg-botanical-dark text-white" data-testid="button-shop-deep-pore" asChild>
                  <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                    Shop Deep Pore Trio
                  </a>
                </Button>
              </article>
            </Card>

            {/* Gentle Trio */}
            <Card className="p-6 bg-white border-l-4 border-l-accent-orange" data-testid="card-gentle">
              <article>
                <div className="w-16 h-16 rounded-full bg-accent-orange-light flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-accent-orange" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Gentle Trio</h3>
                <p className="text-muted-foreground mb-4">
                  Perfect for sensitive and delicate skin types needing extra care and nourishment.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-orange flex-shrink-0" />
                    <span>Cold-Stabilized Aloe Gel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-orange flex-shrink-0" />
                    <span>Chamomile & Lavender</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-orange flex-shrink-0" />
                    <span>pH Balanced Formula</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-orange flex-shrink-0" />
                    <span>No Drying Alcohols</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-accent-orange hover:bg-accent-orange/90 text-white" data-testid="button-shop-gentle" asChild>
                  <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                    Shop Gentle Trio
                  </a>
                </Button>
              </article>
            </Card>

            {/* Intense Body Care */}
            <Card className="p-6 bg-white border-l-4 border-l-accent-pink-dark" data-testid="card-body-care">
              <article>
                <div className="w-16 h-16 rounded-full bg-accent-pink flex items-center justify-center mb-4">
                  <Droplets className="w-8 h-8 text-accent-pink-dark" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Intense Body Care</h3>
                <p className="text-muted-foreground mb-4">
                  Full-body hydration and renewal with our intensive botanical treatment.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-pink-dark flex-shrink-0" />
                    <span>Maximum Aloe Concentration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-pink-dark flex-shrink-0" />
                    <span>Vitamin E & Shea Butter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-pink-dark flex-shrink-0" />
                    <span>Deep Moisture Lock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-accent-pink-dark flex-shrink-0" />
                    <span>All-Natural Ingredients</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-accent-pink-dark hover:bg-accent-pink-dark/90 text-white" data-testid="button-shop-body-care" asChild>
                  <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                    Shop Body Care
                  </a>
                </Button>
              </article>
            </Card>
          </div>
        </div>
      </section>

      {/* Read the Label Challenge */}
      <section className="bg-gradient-to-br from-accent-orange-light via-accent-pink to-accent-orange-light py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6" data-testid="text-challenge-title">
            Take the "Read the Label" Challenge
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pick up any skincare product in your bathroom right now. Check the ingredients list. 
            Is <strong className="text-foreground">"Water"</strong> or <strong className="text-foreground">"Aqua"</strong> the first ingredient?
          </p>
          
          <Card className="max-w-lg mx-auto p-8 bg-white/90 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-left p-4 bg-accent-pink rounded-lg">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <X className="w-6 h-6 text-accent-pink-dark" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Typical Product Label</p>
                  <p className="text-sm text-muted-foreground">Ingredients: <strong>Aqua</strong>, Glycerin, Alcohol...</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-left p-4 bg-botanical-light rounded-lg">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-botanical" />
                </div>
                <div>
                  <p className="font-medium text-foreground">L'Bri Product Label</p>
                  <p className="text-sm text-muted-foreground">Ingredients: <strong>Aloe Barbadensis Miller</strong>, Vitamin E...</p>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-muted-foreground">
              Don't settle for water-based products. Choose aloe-first skincare.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-botanical hover:bg-botanical-dark text-white px-8"
              data-testid="button-shop-challenge"
              asChild
            >
              <a href="https://lbri.com/pages/shop-the-catalog?als=aloepure" target="_blank" rel="noopener noreferrer">
                Make the Switch Today
              </a>
            </Button>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center text-foreground mb-4" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to know about L'Bri and aloe-first skincare
          </p>

          <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
            <AccordionItem value="sensitive-skin" className="border rounded-lg px-6 bg-card" data-testid="faq-item-sensitive">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-botanical">
                Is L'Bri suitable for sensitive skin?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                <strong className="text-foreground">Yes, absolutely!</strong> L'Bri products are specifically formulated with sensitive skin in mind. 
                Our formulas are pH balanced and completely free of drying alcohols, harsh detergents, and artificial fragrances. 
                The natural soothing properties of aloe vera make our products gentle enough for even the most delicate skin types. 
                Many customers with rosacea, eczema, and other skin sensitivities have found relief with L'Bri.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="aloe-difference" className="border rounded-lg px-6 bg-card" data-testid="faq-item-aloe-difference">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-botanical">
                What is the difference between aloe juice and aloe extract?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                This is a crucial distinction! <strong className="text-foreground">L'Bri uses cold-stabilized aloe vera gel</strong>, 
                not boiled extracts or reconstituted juices. Many companies use "aloe extract" which means they've boiled the aloe 
                (destroying many beneficial enzymes and nutrients) or used powder that's been reconstituted with water. 
                L'Bri's cold-stabilization process preserves over 200 naturally occurring vitamins, minerals, amino acids, and enzymes 
                found in fresh aloe vera.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="first-ingredient" className="border rounded-lg px-6 bg-card" data-testid="faq-item-first-ingredient">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-botanical">
                Why does the first ingredient matter so much?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                Ingredients are listed in order of concentration. The first ingredient makes up the largest percentage of the product. 
                When water is first, you're essentially paying for water with a small amount of active ingredients mixed in. 
                <strong className="text-foreground"> With L'Bri, aloe vera is the base</strong>, meaning you get the maximum therapeutic benefit 
                in every application. This "first ingredient philosophy" is what sets L'Bri apart from every other skincare brand.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="preservatives" className="border rounded-lg px-6 bg-card" data-testid="faq-item-preservatives">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-botanical">
                How does L'Bri preserve products without parabens?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                L'Bri uses only <strong className="text-foreground">food-grade, natural preservatives</strong> that are gentle on your skin 
                and safe for long-term use. Unlike parabens and formaldehyde donors (which can disrupt hormones and irritate skin), 
                our preservation system works with your skin's natural biology. The inherent antimicrobial properties of aloe vera 
                also help extend product shelf life naturally.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="results-time" className="border rounded-lg px-6 bg-card" data-testid="faq-item-results">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-botanical">
                How quickly will I see results?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                Many customers notice a difference in their skin's texture and hydration within the <strong className="text-foreground">first week</strong> of use. 
                For more significant improvements in tone, clarity, and fine lines, we recommend consistent use for 4-6 weeks. 
                Because aloe vera works at a cellular level to heal and reconstruct skin, the results are often described as 
                transformative rather than just cosmetic.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-botanical" />
                <span className="font-serif text-lg font-semibold text-foreground">L'Bri Pure n' Natural</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Since 1998, L'Bri has been committed to the "First Ingredient" philosophy, 
                bringing the healing power of pharmaceutical-grade aloe vera to skincare. 
                Experience the difference that pure, natural ingredients can make.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-botanical-light flex items-center justify-center hover:bg-botanical hover:text-white transition-colors"
                  data-testid="link-facebook"
                >
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-botanical-light flex items-center justify-center hover:bg-botanical hover:text-white transition-colors"
                  data-testid="link-instagram"
                >
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-botanical-light flex items-center justify-center hover:bg-botanical hover:text-white transition-colors"
                  data-testid="link-pinterest"
                >
                  <SiPinterest className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://lbri.com/pages/shop-the-catalog?als=aloepure"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-botanical transition-colors"
                    data-testid="link-footer-products"
                  >
                    Shop Products
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("aloe-first")}
                    className="text-muted-foreground hover:text-botanical transition-colors"
                    data-testid="link-footer-about"
                  >
                    About Aloe-First
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("faq")}
                    className="text-muted-foreground hover:text-botanical transition-colors"
                    data-testid="link-footer-faq"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <a
                    href="https://lbri.com/pages/shop-the-catalog?als=aloepure"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-botanical transition-colors"
                    data-testid="link-footer-catalog"
                  >
                    Full Catalog
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-botanical" />
                  <span>ejm444ever@gmail.com</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-botanical" />
                  <span>Mukwonago, Wisconsin</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-border pt-8 mb-8">
            <div className="max-w-xl mx-auto text-center">
              <h4 className="font-serif text-xl font-semibold text-foreground mb-2">
                Join Our Newsletter
              </h4>
              <p className="text-muted-foreground mb-4">
                Get skincare tips, exclusive offers, and be the first to know about new products.
              </p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  data-testid="input-newsletter-email"
                  disabled={newsletterMutation.isPending}
                />
                <Button
                  type="submit"
                  className="bg-botanical hover:bg-botanical-dark text-white"
                  data-testid="button-newsletter-submit"
                  disabled={newsletterMutation.isPending}
                >
                  {newsletterMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground">
            <p data-testid="text-copyright">
              © {new Date().getFullYear()} L'Bri Pure n' Natural. All rights reserved. | 
              aloeveraskinrenewal.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
