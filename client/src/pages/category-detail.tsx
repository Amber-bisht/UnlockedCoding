import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Category, Course } from "@shared/schema";
import { Search, ArrowLeft, BookOpen, Clock, Star } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function CategoryDetail() {
  const { categorySlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  
  const { data: category, isLoading: isCategoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug,
  });
  
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/categories/${categorySlug}/courses`],
    enabled: !!categorySlug,
  });
  
  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedCourses = filteredCourses ? [...filteredCourses].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  }) : [];
  
  const isLoading = isCategoryLoading || isCoursesLoading;
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <Link href="/r">
                  <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to categories
                  </a>
                </Link>
                
                {isLoading ? (
                  <>
                    <div className="h-8 bg-muted animate-pulse w-64 rounded mb-3"></div>
                    <div className="h-5 bg-muted animate-pulse w-96 rounded"></div>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                      {category?.name}
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
                      {category?.description}
                    </p>
                  </>
                )}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-4">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Courses Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted animate-pulse w-3/4 mb-3"></div>
                      <div className="h-20 bg-muted animate-pulse"></div>
                      <div className="h-6 bg-muted animate-pulse w-1/4 mt-4"></div>
                      <div className="flex justify-between mt-4">
                        <div className="h-8 bg-muted animate-pulse w-1/3"></div>
                        <div className="h-8 bg-muted animate-pulse w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedCourses && sortedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover-card-scale">
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <Link href={`/course/${course.id}`}>
                        <a className="text-xl font-bold text-foreground hover:text-primary">
                          {course.title}
                        </a>
                      </Link>
                      
                      <p className="mt-2 text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.lessonCount} lessons
                        </div>
                        {course.rating && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">
                          {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                        </div>
                        <Button asChild>
                          <Link href={`/course/${course.id}`}>
                            Enroll Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardHeader>
                  <div className="mx-auto">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  </div>
                  <CardTitle className="mt-4">No courses found</CardTitle>
                  <CardDescription>
                    {searchQuery ? (
                      <>
                        No courses match your search "<strong>{searchQuery}</strong>".
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery("")}
                          className="p-0 h-auto text-primary"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      "We couldn't find any courses in this category. Please check back later."
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
