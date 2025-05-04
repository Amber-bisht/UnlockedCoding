import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LayoutDashboard,
  FolderOpen,
  Bookmark,
  Users,
  BarChart,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Temporarily disabled admin check during development
  /*useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);*/

  const { data: stats, isLoading: isLoadingStats } = useQuery<{
    users: number;
    courses: number;
    categories: number;
    enrollments: number;
  }>({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  // Extract stats or default to 0
  const categories = stats?.categories || 0;
  const courses = stats?.courses || 0;
  const users = stats?.users || 0;
  const enrollments = stats?.enrollments || 0;
  
  // Combined loading state
  const isLoadingCategories = isLoadingStats;
  const isLoadingCourses = isLoadingStats;
  const isLoadingUsers = isLoadingStats;
  const isLoadingEnrollments = isLoadingStats;

  // Temporarily disabled admin check for development
  /*if (!user || !user.isAdmin) {
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
  }*/

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your platform's content and users
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Admin Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {isLoadingCategories ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      categories || 0
                    )}
                  </div>
                  <FolderOpen className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {isLoadingCourses ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      courses || 0
                    )}
                  </div>
                  <Bookmark className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {isLoadingUsers ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      users || 0
                    )}
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {isLoadingEnrollments ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      enrollments || 0
                    )}
                  </div>
                  <BarChart className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="categories">
                <FolderOpen className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="courses">
                <Bookmark className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your platform content from here
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4 justify-start">
                    <Link href="/admin/categories">
                      <FolderOpen className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Manage Categories</p>
                        <p className="text-muted-foreground text-xs">Add, edit or delete categories</p>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 justify-start">
                    <Link href="/admin/courses">
                      <Bookmark className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">Manage Courses</p>
                        <p className="text-muted-foreground text-xs">Create and edit course content</p>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 justify-start">
                    <Link href="/r">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">View Site</p>
                        <p className="text-muted-foreground text-xs">See your platform as users see it</p>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Admin Overview</CardTitle>
                  <CardDescription>
                    Platform statistics and recent activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Welcome to the admin dashboard! From here, you can manage all aspects of your Unlocked Coding platform.</p>
                  <p className="mt-4">Use the tabs above to navigate to different sections of the admin panel.</p>
                  <ul className="mt-6 space-y-2">
                    <li className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2 text-primary" />
                      <span>Categories - Create and manage course categories</span>
                    </li>
                    <li className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-2 text-primary" />
                      <span>Courses - Add new courses, lessons, and manage content</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage your course categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Manage Categories</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Create, edit, and organize your course categories to help students find the right content.
                  </p>
                  <Button asChild>
                    <Link href="/admin/categories">
                      Go to Category Management
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>
                    Create and manage your courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Manage Courses</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Add new courses, create lessons, and maintain your educational content all in one place.
                  </p>
                  <Button asChild>
                    <Link href="/admin/courses">
                      Go to Course Management
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
