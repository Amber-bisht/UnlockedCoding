import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Course, Lesson, Review } from "@shared/schema";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle, 
  ChevronDown, 
  Play, 
  UserCircle,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  const { data: lessons, isLoading: isLessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });
  
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/courses/${courseId}/reviews`],
    enabled: !!courseId,
  });
  
  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery<{ enrolled: boolean }>({
    queryKey: [`/api/courses/${courseId}/enrollment`],
    enabled: !!courseId && !!user,
  });
  
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="ml-3 text-lg">Loading course...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                </div>
                <CardTitle className="mt-4">Course Not Found</CardTitle>
                <CardDescription>
                  The course you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild>
                  <Link href="/r">Browse Courses</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  const formattedDate = course.createdAt 
    ? new Date(course.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : "N/A";
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Course Hero */}
        <section className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 md:pr-8">
                <Link href={`/r/${course.category?.slug}`}>
                  <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to {course.category?.name || "courses"}
                  </a>
                </Link>
                
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {course.title}
                </h1>
                
                <p className="mt-4 text-lg text-muted-foreground">
                  {course.description}
                </p>
                
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.lessonCount} lessons
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Updated {formattedDate}
                  </div>
                  {course.rating && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {course.rating} ({course.reviewCount} reviews)
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={course.instructor?.profileImageUrl || ""} />
                    <AvatarFallback>{course.instructor?.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{course.instructor?.fullName || course.instructor?.username}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/3 mt-8 md:mt-0">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                        </span>
                        {course.originalPrice && course.originalPrice > course.price ? (
                          <span className="text-muted-foreground line-through">
                            ${course.originalPrice.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                      
                      {course.enrollmentLink ? (
                        <Button className="w-full mt-4" asChild>
                          <a href={course.enrollmentLink} target="_blank" rel="noopener noreferrer">
                            Enroll on External Site
                          </a>
                        </Button>
                      ) : user ? (
                        enrollment?.enrolled ? (
                          <Button className="w-full mt-4" asChild>
                            <Link href={`/course/${courseId}/learn`}>
                              Continue Learning
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => enrollMutation.mutate()}
                            disabled={enrollMutation.isPending || isEnrollmentLoading}
                          >
                            {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                          </Button>
                        )
                      ) : (
                        <Button className="w-full mt-4" asChild>
                          <Link href="/auth">
                            Log in to Enroll
                          </Link>
                        </Button>
                      )}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-medium mb-4">This course includes:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>{course.duration} of video content</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>{course.lessonCount} lessons</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>Hands-on exercises</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>Lifetime access</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full max-w-lg">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="syllabus" className="flex-1">Syllabus</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>
                      What you'll learn in this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Description</h3>
                      <p>{course.longDescription || course.description}</p>
                      
                      <h3 className="mt-8">What you'll learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.learningObjectives?.map((objective, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h3 className="mt-8">Requirements</h3>
                      <ul>
                        {course.requirements?.map((requirement, i) => (
                          <li key={i}>{requirement}</li>
                        ))}
                      </ul>
                      
                      <h3 className="mt-8">Who this course is for</h3>
                      <ul>
                        {course.targetAudience?.map((audience, i) => (
                          <li key={i}>{audience}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="syllabus" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Syllabus</CardTitle>
                    <CardDescription>
                      A detailed breakdown of the course content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLessonsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading course content...</p>
                      </div>
                    ) : lessons && lessons.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {lessons.map((lesson, index) => (
                          <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mr-3">
                                  {index + 1}
                                </span>
                                <div>
                                  <h4 className="text-base font-medium">{lesson.title}</h4>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Play className="h-3 w-3 mr-1" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-[3.25rem]">
                                <p className="text-muted-foreground mb-4">{lesson.description}</p>
                                
                                {enrollment?.enrolled ? (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/course/${courseId}/lesson/${lesson.id}`}>
                                      Start Lesson
                                    </Link>
                                  </Button>
                                ) : index === 0 ? (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/course/${courseId}/lesson/${lesson.id}`}>
                                      Preview Lesson
                                    </Link>
                                  </Button>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={user ? "" : "/auth"}>
                                        {user ? "Enroll to unlock" : "Log in to unlock"}
                                      </Link>
                                    </Button>
                                  </p>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No lessons available yet</h3>
                        <p className="mt-2 text-muted-foreground">
                          The course content is being prepared. Check back soon.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      Feedback from students who have taken this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isReviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading reviews...</p>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-8">
                        {reviews.map((review) => (
                          <div key={review.id} className="pb-8 border-b last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.user?.profileImageUrl || ""} />
                                  <AvatarFallback>
                                    {review.user?.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  <h5 className="text-sm font-medium">{review.user?.fullName || review.user?.username}</h5>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h6 className="text-base font-medium mb-2">{review.title}</h6>
                              <p className="text-muted-foreground">{review.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <UserCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                        <p className="mt-2 text-muted-foreground">
                          Be the first to leave a review for this course.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
