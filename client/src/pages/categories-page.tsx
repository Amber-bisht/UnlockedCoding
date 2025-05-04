import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Browse Course Categories
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-balance">
              Discover coding courses across a wide range of topics and technologies. Find the perfect course to advance your programming skills.
            </p>
            
            {/* Search */}
            <div className="mt-8 max-w-lg mx-auto flex rounded-md shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted animate-pulse w-1/2 mb-3"></div>
                      <div className="h-20 bg-muted animate-pulse"></div>
                      <div className="h-4 bg-muted animate-pulse w-1/3 mt-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCategories && filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="overflow-hidden hover-card-scale">
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground">
                        <Link href={`/r/${category.slug}`}>
                          <a className="hover:text-primary">{category.name}</a>
                        </Link>
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        {category.description}
                      </p>
                      <div className="mt-4">
                        <Link href={`/r/${category.slug}`}>
                          <a className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                            Browse courses
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardHeader>
                  <div className="mx-auto">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                  </div>
                  <CardTitle className="mt-4">No categories found</CardTitle>
                  <CardDescription>
                    {searchQuery ? (
                      <>
                        No categories match your search "<strong>{searchQuery}</strong>".
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery("")}
                          className="p-0 h-auto text-primary"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      "We couldn't find any categories. Please check back later."
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
