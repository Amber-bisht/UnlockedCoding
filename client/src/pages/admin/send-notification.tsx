import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowLeft, Bell, Loader2 } from "lucide-react";

// Define the notification types
const notificationTypes = [
  { value: "info", label: "Information" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["info", "success", "warning", "error"]),
  recipients: z.string().min(1, "Please select recipients"),
  // For future use if specific users are selected
  specificUsers: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
});

export default function SendNotificationPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Fetch users (for future use with specific user targeting)
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: false, // Disabled for now as we're using 'all' recipients
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      recipients: "all",
      specificUsers: [],
      expiresAt: "",
    },
  });

  // Watch recipients field to conditionally show specific users selector
  const recipientsValue = form.watch("recipients");

  // Set up mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        ...values,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
      };
      
      const response = await apiRequest("POST", "/api/admin/notifications", payload);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send notification");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification sent",
        description: "Your notification has been sent successfully.",
      });
      // Redirect to admin dashboard
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 flex items-center text-muted-foreground"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Send Notification</h1>
            <p className="text-muted-foreground mt-1">Notify users about important updates</p>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="mr-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>
                  Compose a notification to send to your users
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New Feature Announcement" {...field} />
                        </FormControl>
                        <FormDescription>
                          A short, attention-grabbing title.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your notification message here..."
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The main content of your notification.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {notificationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This affects how the notification is displayed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recipients"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Recipients</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="all" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                All Users
                              </FormLabel>
                            </FormItem>
                            {/* For future implementation - sending to specific users */}
                            {/* <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="specific" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Specific Users
                              </FormLabel>
                            </FormItem> */}
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Choose who will receive this notification.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* For future use - selecting specific users */}
                  {/* recipientsValue === "specific" && (
                    <FormField
                      control={form.control}
                      name="specificUsers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Users</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={users?.map(user => ({ value: user.id, label: user.username })) || []}
                              value={field.value.map(id => ({ 
                                value: id, 
                                label: users?.find(u => u.id === id)?.username || id 
                              }))}
                              onChange={selectedOptions => field.onChange(selectedOptions.map(o => o.value))}
                              isLoading={isUsersLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Select the specific users to receive this notification.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) */}
                  
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          If left blank, the notification will expire after 30 days.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => navigate("/admin")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Notification
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}