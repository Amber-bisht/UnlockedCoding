import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  AlertTriangle,
  Loader2,
  Check,
  Clock,
  FileText,
  DollarSign,
  Target,
  Bookmark,
  ListChecks,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Course, InsertCourse, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const courseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens and no spaces"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().optional().transform(val => val === "" ? null : parseFloat(val)),
  originalPrice: z.string().optional().transform(val => val === "" ? null : parseFloat(val)),
  duration: z.string().min(1, "Duration is required"),
  learningObjectives: z.string().optional().transform(text => text ? text.split('\n').filter(line => line.trim() !== '') : []),
  requirements: z.string().optional().transform(text => text ? text.split('\n').filter(line => line.trim() !== '') : []),
  targetAudience: z.string().optional().transform(text => text ? text.split('\n').filter(line => line.trim() !== '') : []),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const lessonFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  position: z.number().int().min(1, "Position must be at least 1"),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

export default function ManageCourses() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: lessons, isLoading: isLessonsLoading } = useQuery({
    queryKey: [`/api/courses/${selectedCourse?.id}/lessons`],
    enabled: !!selectedCourse,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CourseFormValues }) => {
      const res = await apiRequest("PUT", `/api/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditCourse(null);
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setDeleteCourse(null);
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async ({ courseId, data }: { courseId: number; data: LessonFormValues }) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/lessons`, data);
      return res.json();
    },
    onSuccess: () => {
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourse.id}/lessons`] });
        queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      }
      setIsLessonDialogOpen(false);
      lessonForm.reset({
        title: "",
        description: "",
        content: "",
        videoUrl: "",
        duration: "",
        position: (lessons?.length || 0) + 1,
      });
      toast({
        title: "Lesson created",
        description: "The lesson has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create lesson",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      longDescription: "",
      imageUrl: "",
      categoryId: "",
      price: "",
      originalPrice: "",
      duration: "",
      learningObjectives: "",
      requirements: "",
      targetAudience: "",
    },
  });

  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: editCourse?.title || "",
      slug: editCourse?.slug || "",
      description: editCourse?.description || "",
      longDescription: editCourse?.longDescription || "",
      imageUrl: editCourse?.imageUrl || "",
      categoryId: editCourse?.categoryId ? String(editCourse.categoryId) : "",
      price: editCourse?.price ? String(editCourse.price) : "",
      originalPrice: editCourse?.originalPrice ? String(editCourse.originalPrice) : "",
      duration: editCourse?.duration || "",
      learningObjectives: editCourse?.learningObjectives ? editCourse.learningObjectives.join('\n') : "",
      requirements: editCourse?.requirements ? editCourse.requirements.join('\n') : "",
      targetAudience: editCourse?.targetAudience ? editCourse.targetAudience.join('\n') : "",
    },
  });

  const lessonForm = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
      position: (lessons?.length || 0) + 1,
    },
  });

  // Reset edit form when editCourse changes
  useEffect(() => {
    if (editCourse) {
      editForm.reset({
        title: editCourse.title,
        slug: editCourse.slug,
        description: editCourse.description,
        longDescription: editCourse.longDescription || "",
        imageUrl: editCourse.imageUrl,
        categoryId: String(editCourse.categoryId),
        price: editCourse.price ? String(editCourse.price) : "",
        originalPrice: editCourse.originalPrice ? String(editCourse.originalPrice) : "",
        duration: editCourse.duration,
        learningObjectives: editCourse.learningObjectives ? editCourse.learningObjectives.join('\n') : "",
        requirements: editCourse.requirements ? editCourse.requirements.join('\n') : "",
        targetAudience: editCourse.targetAudience ? editCourse.targetAudience.join('\n') : "",
      });
    }
  }, [editCourse, editForm]);

  // Update lesson form position when lessons change
  useEffect(() => {
    if (lessons) {
      lessonForm.setValue("position", (lessons.length || 0) + 1);
    }
  }, [lessons, lessonForm]);

  const onCreateSubmit = (data: CourseFormValues) => {
    createCourseMutation.mutate(data);
  };

  const onEditSubmit = (data: CourseFormValues) => {
    if (editCourse) {
      updateCourseMutation.mutate({ id: editCourse.id, data });
    }
  };

  const onLessonSubmit = (data: LessonFormValues) => {
    if (selectedCourse) {
      createLessonMutation.mutate({ courseId: selectedCourse.id, data });
    }
  };

  const handleDelete = () => {
    if (deleteCourse) {
      deleteCourseMutation.mutate(deleteCourse.id);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, form: typeof createForm) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Only auto-generate slug if slug field is empty or matches the previous auto-generated slug
    const currentSlug = form.getValues("slug");
    const slugFromTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    if (!currentSlug || currentSlug === form.getValues("title").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
      form.setValue("slug", slugFromTitle);
    }
  };

  if (!user || !user.isAdmin) {
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
                <CardTitle className="mt-4">Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this page.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Link href="/admin">
                <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to dashboard
                </a>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
              <p className="text-muted-foreground mt-1">
                Create, edit and manage your course catalog
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course to your platform
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="requirements">Requirements</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g. Introduction to Web Development"
                                    onChange={(e) => handleTitleChange(e, createForm)} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  The name of your course
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g. introduction-to-web-development"
                                  />
                                </FormControl>
                                <FormDescription>
                                  The URL-friendly version of the title
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isCategoriesLoading ? (
                                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                                    ) : categories && categories.length > 0 ? (
                                      categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                          {category.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="none" disabled>No categories available</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The category this course belongs to
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cover Image URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="https://example.com/image.jpg"
                                  />
                                </FormControl>
                                <FormDescription>
                                  URL to an image representing this course
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={createForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="e.g. 49.99"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Course price (leave empty for free)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Original Price ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="e.g. 99.99"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Original price (for discounts)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="e.g. 10 hours"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Total course duration
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="A brief overview of the course"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A short summary that appears in course listings
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="longDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Long Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Detailed description of the course content"
                                    rows={6}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Detailed description shown on the course page
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        
                        <TabsContent value="requirements" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="learningObjectives"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Learning Objectives</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="What students will learn (one per line)
Example: Build responsive websites
Example: Master JavaScript fundamentals"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one learning objective per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="requirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requirements</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Prerequisites for taking this course (one per line)
Example: Basic computer skills
Example: Understanding of HTML basics"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one requirement per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Audience</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Who this course is for (one per line)
Example: Beginners interested in web development
Example: Students looking to enhance their coding skills"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one audience type per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createCourseMutation.isPending}
                        >
                          {createCourseMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Create Course
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage all courses in your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCoursesLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded overflow-hidden">
                              <img 
                                src={course.imageUrl} 
                                alt={course.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {course.description.length > 60 
                                  ? `${course.description.substring(0, 60)}...` 
                                  : course.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.category?.name || "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          {course.price 
                            ? `$${parseFloat(String(course.price)).toFixed(2)}` 
                            : "Free"}
                        </TableCell>
                        <TableCell>
                          {course.lessonCount || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Lessons</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditCourse(course)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the "{course.title}" course and all its lessons. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => setDeleteCourse(course)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You haven't created any courses yet. Start by adding your first course.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />

      {/* Edit Course Dialog */}
      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the details for "{editCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Introduction to Web Development"
                            onChange={(e) => handleTitleChange(e, editForm)} 
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. introduction-to-web-development"
                          />
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCategoriesLoading ? (
                              <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No categories available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category this course belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://example.com/image.jpg"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to an image representing this course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 49.99"
                            />
                          </FormControl>
                          <FormDescription>
                            Course price (leave empty for free)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 99.99"
                            />
                          </FormControl>
                          <FormDescription>
                            Original price (for discounts)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. 10 hours"
                            />
                          </FormControl>
                          <FormDescription>
                            Total course duration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="A brief overview of the course"
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          A short summary that appears in course listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Detailed description of the course content"
                            rows={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description shown on the course page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="learningObjectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objectives</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="What students will learn (one per line)
Example: Build responsive websites
Example: Master JavaScript fundamentals"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one learning objective per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Prerequisites for taking this course (one per line)
Example: Basic computer skills
Example: Understanding of HTML basics"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one requirement per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Who this course is for (one per line)
Example: Beginners interested in web development
Example: Students looking to enhance their coding skills"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one audience type per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditCourse(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Course Lessons Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Lessons</DialogTitle>
            <DialogDescription>
              Manage lessons for "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Lessons</h3>
              <Button size="sm" onClick={() => setIsLessonDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
            </div>
            
            {isLessonsLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lessons && lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id} className="overflow-hidden">
                    <div className="p-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mr-3">
                        {lesson.position}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{lesson.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <h4 className="text-lg font-medium mb-2">No lessons yet</h4>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  This course doesn't have any lessons yet. Add your first lesson to get started.
                </p>
                <Button onClick={() => setIsLessonDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lesson
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Add a lesson to "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4 py-4">
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. Introduction to HTML"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={lessonForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Brief description of this lesson"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. 45 minutes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={lessonForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Order in the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={lessonForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. https://example.com/video.mp4"
                      />
                    </FormControl>
                    <FormDescription>
                      Link to lesson video (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={lessonForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Lesson content or notes"
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Text content for this lesson (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLessonDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createLessonMutation.isPending}
                >
                  {createLessonMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add Lesson
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteCourse && (
        <AlertDialog open={!!deleteCourse} onOpenChange={(open) => !open && setDeleteCourse(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteCourse.title}"? This will also delete all lessons associated with this course. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCourseMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={deleteCourseMutation.isPending}
              >
                {deleteCourseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
