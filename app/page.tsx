import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const features = [
    {
      title: "Track Progress",
      description: "Monitor your weight, sleep, and activity levels over time.",
      icon: "📊",
    },
    {
      title: "Set Goals",
      description: "Define health targets and track your progress towards them.",
      icon: "🎯",
    },
    {
      title: "Stay Motivated",
      description: "Visualize your journey and celebrate your achievements.",
      icon: "🏆",
    },
    {
      title: "Nutrition Tracking",
      description: "Log your meals and track your nutritional intake.",
      icon: "🥗",
    },
    {
      title: "Workout Plans",
      description: "Access personalized workout routines and track your exercises.",
      icon: "💪",
    },
    {
      title: "Health Insights",
      description: "Get personalized insights based on your health data.",
      icon: "🧠",
    },
  ];

  const testimonials = [
    {
      quote: "Health Tracker has completely transformed my life. Not a fat fuck anymore.",
      author: "Sarah J.",
      role: "Fitness Enthusiast",
    },
    {
      quote: "Lowkey becoming the greatest of all time.",
      author: "Gurjaan D.",
      role: "Football Player",
    },
    {
      quote: "Its alright, I guess.",
      author: "Amrit",
      role: "Unemployed",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,var(--background),transparent)]"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 py-1.5" variant="outline">Your Health Journey Starts Here</Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            Health Tracker
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Monitor your health journey with our comprehensive tracking tools and get personalized insights to improve your wellbeing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <Button asChild size="lg" className="px-8 text-base">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 text-base">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Comprehensive Health Tracking</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor and improve your health in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{feature.icon}</span>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how Health Tracker has helped people achieve their health goals
            </p>
          </div>
          
          <Carousel className="max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="mx-4">
                    <CardContent className="pt-6">
                      <p className="text-xl italic mb-6 text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                      <Separator className="my-4" />
                      <div className="flex flex-col">
                        <p className="font-semibold text-foreground">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="mr-2 static translate-y-0" />
              <CarouselNext className="ml-2 static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-foreground">Ready to Transform Your Health?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of users who have improved their health with our tracking tools
          </p>
          <Button asChild size="lg" variant="secondary" className="px-8 text-base">
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
