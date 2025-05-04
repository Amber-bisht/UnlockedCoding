import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfileCompletion from "@/pages/profile-completion";
import ProfilePage from "@/pages/profile-page";
import CategoriesPage from "@/pages/categories-page";
import CategoryDetail from "@/pages/category-detail";
import CourseDetail from "@/pages/course-detail";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageCategories from "@/pages/admin/manage-categories";
import ManageCourses from "@/pages/admin/manage-courses";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/profile/complete" component={ProfileCompletion} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/r" component={CategoriesPage} />
      <Route path="/r/:categorySlug" component={CategoryDetail} />
      <Route path="/course/:courseId" component={CourseDetail} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/categories" component={ManageCategories} />
      <ProtectedRoute path="/admin/courses" component={ManageCourses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="unlocked-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
