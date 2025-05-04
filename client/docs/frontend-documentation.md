# Unlocked Coding Frontend Documentation

## Overview

The Unlocked Coding platform frontend is built with React, TypeScript, and several modern libraries to create a seamless educational experience. This document outlines the architecture, key components, and main features of the frontend application.

## Technology Stack

- **React**: Core library for building the user interface
- **TypeScript**: Static typing for improved code quality and developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on Radix UI for accessible and customizable UI components
- **TanStack Query (React Query)**: Data fetching and state management for API requests
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation library
- **Vite**: Fast build tool and development server

## Project Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Layout components (header, footer, etc.)
│   │   └── ui/            # UI components (buttons, cards, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and libraries
│   ├── pages/             # Page components
│   │   └── admin/         # Admin-specific pages
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
└── public/                # Static assets
```

## Key Components

### Layout Components

- **SiteHeader**: Main navigation header with logo, navigation links, and user authentication controls
- **SiteFooter**: Footer with links to important pages and information
- **AdminLayout**: Layout for admin pages with sidebar navigation

### UI Components

The application uses Shadcn UI components extensively, including:

- **Button**: Various button styles for different actions
- **Card**: Container for displaying content
- **Form**: Form components with validation
- **Dialog**: Modal dialogs for confirmations and forms
- **Tabs**: Tabbed interfaces for organizing content
- **Toast**: Notifications for user feedback
- **Avatar**: User profile images
- **Dropdown**: Menus for actions and options

### Custom Hooks

- **useAuth**: Authentication hook for managing user state, login, logout, and registration
- **useToast**: Hook for displaying toast notifications
- **useMobile**: Hook for responsive design based on screen size

## Pages

### Public Pages

- **HomePage**: Landing page featuring categories and featured courses
- **CategoryDetail**: Displays courses within a specific category
- **CourseDetail**: Detailed view of a course with tabs for overview, syllabus, and reviews
- **AuthPage**: Combined login and registration page
- **ProfileCompletion**: Form for completing user profile after registration
- **ProfilePage**: User profile management page
- **DonatePage**: Page for cryptocurrency donations

### Admin Pages

- **Dashboard**: Overview of platform statistics and recent activity
- **AddCategory**: Form for creating and editing categories
- **AddCourse**: Form for creating and editing courses
- **SendNotification**: Form for sending notifications to users

## State Management

- **React Query**: Used for fetching and caching API data
- **React Context**: Used for global state like authentication and theme

## Routing

The application uses Wouter for routing with the following structure:

```jsx
<Switch>
  <Route path="/" component={HomePage} />
  <Route path="/auth" component={AuthPage} />
  <Route path="/complete-profile" component={ProfileCompletionPage} />
  <Route path="/profile" component={ProfilePage} />
  <Route path="/donate" component={DonatePage} />
  <Route path="/r/:categorySlug" component={CategoryDetailPage} />
  <Route path="/course/:courseId" component={CourseDetailPage} />
  <Route path="/course/:courseId/lesson/:lessonId" component={LessonPage} />
  <Route path="/admin" component={AdminDashboardPage} />
  <Route path="/admin/add-category" component={AddCategoryPage} />
  <Route path="/admin/add-course" component={AddCoursePage} />
  <Route path="/admin/send-notification" component={SendNotificationPage} />
  <Route component={NotFound} />
</Switch>
```

## Data Fetching

The application uses TanStack Query for data fetching. Example:

```tsx
const { data: courses, isLoading } = useQuery({
  queryKey: ['/api/courses'],
});

const { data: course, isLoading } = useQuery({
  queryKey: [`/api/courses/${courseId}`],
  enabled: !!courseId,
});

const { mutate, isPending } = useMutation({
  mutationFn: async (values) => {
    const response = await apiRequest('POST', '/api/courses', values);
    return await response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
  },
});
```

## Authentication

Authentication is implemented using session-based auth with cookies. The useAuth hook provides the following:

```tsx
const { user, isLoading, loginMutation, registerMutation, logoutMutation } = useAuth();
```

Protected routes are implemented with a ProtectedRoute component:

```tsx
<ProtectedRoute path="/profile" component={ProfilePage} />
```

## Form Handling

Forms are built using React Hook Form with Zod for validation:

```tsx
const formSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  // ...
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: "",
    description: "",
    // ...
  },
});

function onSubmit(values: z.infer<typeof formSchema>) {
  mutate(values);
}
```

## Styling

The application uses Tailwind CSS for styling with a custom theme defined in `tailwind.config.ts`. Global styles are in `index.css`. The design follows a clean, modern aesthetic with accessible color contrasts and responsive layouts.

## Responsive Design

The application is fully responsive, adapting to different screen sizes using Tailwind's responsive utilities:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
}
```

The `useMobile` hook is used to conditionally render components based on screen size:

```tsx
const isMobile = useMobile();

return (
  <div>
    {isMobile ? <MobileNavigation /> : <DesktopNavigation />}
  </div>
);
```

## Accessibility

The application follows accessibility best practices:

- Proper semantic HTML
- Keyboard navigation support
- ARIA attributes
- Adequate color contrast
- Focus management

## Error Handling

Error handling is implemented at multiple levels:

- Form validation with clear error messages
- API error handling with toast notifications
- Error boundaries for component-level errors
- Fallback UI for loading and error states

## Feature Flags

The application uses feature flags to control the visibility of certain features, enabling gradual rollout and A/B testing.

## Internationalization

The application is prepared for internationalization with text content organized in a structured way, making it easy to translate in the future.

## Security Measures

- Cross-Site Request Forgery (CSRF) protection
- Content Security Policy (CSP)
- Input validation on both client and server
- Secure authentication with HTTP-only cookies
- Protection against XSS attacks