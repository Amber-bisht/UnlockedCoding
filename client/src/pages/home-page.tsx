import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Code, 
  CheckCircle,
  BookOpen,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function HomePage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-background transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>

              <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 px-4 sm:px-6 lg:px-8">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                    <span className="block">Unlock your coding</span>
                    <span className="block text-primary">potential today</span>
                  </h1>
                  <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 text-balance">
                    Learn programming skills, build projects, and advance your career with our expert-led courses. From web development to data science, we've got you covered.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <Button asChild size="lg" className="rounded-md px-8 py-3">
                      <Link href="/r">
                        Explore courses
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="mt-3 sm:mt-0 sm:ml-3 rounded-md px-8 py-3">
                      <a href="#featured-courses">
                        View featured
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" alt="Person coding on a laptop" />
          </div>
        </section>

        {/* Featured Categories Section */}
        <section id="featured-courses" className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Categories</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                Featured Categories
              </p>
              <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto text-balance">
                Explore our top course categories
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
                      <div className="h-48 w-full bg-muted animate-pulse"></div>
                      <div className="p-6">
                        <div className="h-6 w-3/4 bg-muted animate-pulse"></div>
                        <div className="mt-2 h-16 bg-muted animate-pulse"></div>
                        <div className="mt-4 h-4 w-1/3 bg-muted animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : categories && categories.length > 0 ? (
                  categories.slice(0, 3).map((category) => (
                    <div key={category.id} className="group relative bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
                      <div className="h-48 w-full overflow-hidden">
                        <img 
                          src={category.imageUrl} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground">
                          <Link href={`/r/${category.slug}`}>
                            <a className="hover:text-primary">{category.name}</a>
                          </Link>
                        </h3>
                        <p className="mt-2 text-base text-muted-foreground">
                          {category.description}
                        </p>
                        <div className="mt-4">
                          <Link href={`/r/${category.slug}`}>
                            <a className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                              Explore now
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">No categories found</p>
                  </div>
                )}
              </div>
              
              <div className="mt-10 text-center">
                <Button asChild className="rounded-md">
                  <Link href="/r">
                    View all categories
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Learning Journey</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                How it works
              </p>
              <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto text-balance">
                Follow these simple steps to start your learning journey with Unlocked Coding.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-foreground">Step 1: Explore categories</p>
                  <p className="mt-2 ml-16 text-base text-muted-foreground">
                    Browse through our diverse range of programming categories to find the perfect fit for your interests and career goals.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-foreground">Step 2: Enroll in courses</p>
                  <p className="mt-2 ml-16 text-base text-muted-foreground">
                    Choose from our expert-led courses and enroll to gain access to comprehensive learning materials, projects, and assessments.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-foreground">Step 3: Learn and achieve</p>
                  <p className="mt-2 ml-16 text-base text-muted-foreground">
                    Follow the structured curriculum, complete projects, and track your progress as you master new skills and advance your coding abilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Testimonials</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                What our students say
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-card rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80" alt="Sarah Johnson" className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-foreground">Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">Web Development Graduate</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "Unlocked Coding transformed my career. I went from knowing nothing about web development to landing a full-stack developer job in just 6 months. The curriculum is comprehensive and the instructors are incredibly supportive."
                  </p>
                  <div className="mt-4 flex">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80" alt="David Chen" className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-foreground">David Chen</h4>
                      <p className="text-sm text-muted-foreground">Data Science Student</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "The data science track is excellent. The course material is up-to-date with industry standards, and the hands-on projects helped me build a solid portfolio. I've already started getting interview calls from top companies."
                  </p>
                  <div className="mt-4 flex">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80" alt="Emily Rodriguez" className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-foreground">Emily Rodriguez</h4>
                      <p className="text-sm text-muted-foreground">Mobile Dev Graduate</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "I was a complete beginner when I started the mobile development course. The step-by-step approach and project-based learning made it easy to understand complex concepts. Now I'm developing my own apps!"
                  </p>
                  <div className="mt-4 flex">
                    {Array(4).fill(0).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <Star className="h-5 w-5 text-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              <span className="block">Ready to start your coding journey?</span>
              <span className="block text-blue-100">Join Unlocked Coding today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <Button asChild variant="secondary" size="lg" className="rounded-md">
                <Link href="/auth?tab=register">
                  Get started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="ml-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white border-transparent hover:border-transparent">
                <Link href="/r">
                  Browse courses
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
