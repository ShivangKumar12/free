import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Project, Review } from '@/types/schema';

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const ProjectSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
  tags: z.union([
    z.string().transform(val => val.split(',').map(tag => tag.trim())),
    z.array(z.string())
  ]),
  liveUrl: z.union([
    z.string().url({ message: "Please enter a valid URL" }),
    z.string().length(0),
    z.undefined()
  ]),
  codeUrl: z.union([
    z.string().url({ message: "Please enter a valid URL" }),
    z.string().length(0), 
    z.undefined()
  ]),
});

const ContactInfoSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  location: z.string().min(3, { message: "Please enter a valid location" }),
});

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { toast } = useToast();
  const auth = getAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, [auth]);
  
  // Login Form
  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const handleLogin = async (values: z.infer<typeof LoginSchema>) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "You are now logged in to the admin panel.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };
  
  // Project Form
  const projectForm = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      tags: [],
      liveUrl: "",
      codeUrl: "",
    },
  });
  
  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 10000,
    enabled: isAuthenticated,
  });
  
  // Fetch reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    staleTime: 10000,
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/reviews?admin=true');
      return response.json();
    },
  });
  
  // Create/Update project mutation
  const projectMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = selectedProjectId ? `/api/projects/${selectedProjectId}` : '/api/projects';
      const method = selectedProjectId ? 'PATCH' : 'POST';
      
      const formattedData = {
        ...data,
        liveUrl: data.liveUrl && data.liveUrl.length > 0 ? data.liveUrl : '',
        codeUrl: data.codeUrl && data.codeUrl.length > 0 ? data.codeUrl : '',
      };
      
      const response = await apiRequest(method, endpoint, formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      projectForm.reset();
      setSelectedProjectId(null);
      toast({
        title: selectedProjectId ? "Project Updated" : "Project Created",
        description: `Project has been ${selectedProjectId ? "updated" : "created"} successfully.`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${selectedProjectId ? "update" : "create"} project.`,
        variant: "destructive",
      });
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      });
    },
  });
  
  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/reviews/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review Approved",
        description: "Review has been approved successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve review.",
        variant: "destructive",
      });
    },
  });
  
  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/reviews/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review Deleted",
        description: "Review has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
    },
  });
  
  const handleProjectSubmit = (data: z.infer<typeof ProjectSchema>) => {
    projectMutation.mutate(data);
  };
  
  const handleEditProject = (project: Project) => {
    setSelectedProjectId(project.id);
    projectForm.reset({
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.imageUrl,
      tags: project.tags,
      liveUrl: project.liveUrl || '',
      codeUrl: project.codeUrl || '',
    });
  };
  
  const handleCancelEdit = () => {
    setSelectedProjectId(null);
    projectForm.reset();
  };
  
  const handleDeleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id);
    }
  };
  
  const handleApproveReview = (id: number) => {
    approveReviewMutation.mutate(id);
  };
  
  const handleDeleteReview = (id: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(id);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-white">Admin Panel</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Please sign in to access the admin panel.
            </p>
          </div>
          
          <Card className="bg-background/50 backdrop-blur-sm border border-primary/10">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            {...field} 
                            className="bg-background/70 border border-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="******" 
                            {...field} 
                            className="bg-background/70 border border-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Welcome, Admin</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Form */}
              <Card className="bg-background/50 backdrop-blur-sm border border-primary/10">
                <CardHeader>
                  <CardTitle>{selectedProjectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
                  <CardDescription>
                    {selectedProjectId 
                      ? 'Update the details of an existing project.' 
                      : 'Fill in the details to add a new project to your portfolio.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...projectForm}>
                    <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-4">
                      <FormField
                        control={projectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Project Title" 
                                {...field} 
                                className="bg-background/70 border border-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Project Description" 
                                {...field} 
                                className="bg-background/70 border border-primary/20"
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background/70 border border-primary/20">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="min-w-[200px]" sideOffset={5}>
                                <SelectItem value="web">Web Development</SelectItem>
                                <SelectItem value="app">Mobile App</SelectItem>
                                <SelectItem value="graphic">Graphic Design</SelectItem>
                                <SelectItem value="poster">Poster Design</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
                                {...field} 
                                className="bg-background/70 border border-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma separated)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="React, TypeScript, Firebase" 
                                {...field} 
                                className="bg-background/70 border border-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={projectForm.control}
                          name="liveUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com" 
                                  {...field} 
                                  className="bg-background/70 border border-primary/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={projectForm.control}
                          name="codeUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://github.com/username/repo" 
                                  {...field} 
                                  className="bg-background/70 border border-primary/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        {selectedProjectId && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          type="submit" 
                          disabled={projectMutation.isPending}
                        >
                          {projectMutation.isPending 
                            ? (selectedProjectId ? "Updating..." : "Creating...") 
                            : (selectedProjectId ? "Update Project" : "Add Project")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Projects List */}
              <Card className="bg-background/50 backdrop-blur-sm border border-primary/10">
                <CardHeader>
                  <CardTitle>Projects List</CardTitle>
                  <CardDescription>Manage your existing projects.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <div className="py-8 text-center text-gray-400">Loading projects...</div>
                  ) : !projects || projects.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">No projects found.</div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project: Project) => (
                        <div 
                          key={project.id} 
                          className="bg-background/70 border border-primary/20 rounded-md p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-white">{project.title}</h3>
                              <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full mt-1">
                                {project.category === 'web' ? 'Web Development' :
                                 project.category === 'app' ? 'Mobile App' :
                                 project.category === 'graphic' ? 'Graphic Design' : 'Poster Design'}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditProject(project)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="bg-background/50 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>Reviews Management</CardTitle>
                <CardDescription>Approve or delete submitted reviews.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="py-8 text-center text-gray-400">Loading reviews...</div>
                ) : !reviews || reviews.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">No reviews found.</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review: Review) => (
                      <div 
                        key={review.id} 
                        className={`bg-background/70 border ${review.approved ? 'border-green-500/30' : 'border-primary/20'} rounded-md p-4`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-white">{review.name}</h3>
                            <p className="text-sm text-gray-400">{review.email}</p>
                            {review.company && (
                              <p className="text-sm text-gray-400">
                                Company: {review.company}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!review.approved && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-green-500 text-green-500"
                                onClick={() => handleApproveReview(review.id)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {Array(5).fill(0).map((_, index) => (
                            <svg 
                              key={index} 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${index < review.rating ? 'text-primary' : 'text-gray-500'}`} 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-300">{review.comment}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Project Type: {review.projectType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.approved && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full">
                              Approved
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-background/50 backdrop-blur-sm border border-primary/10">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your contact information displayed on the website.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              defaultValue="shivangkumarcgc@gmail.com"
                              className="bg-background/70 border border-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (234) 567-890" 
                          defaultValue="+91 – 9852001237"
                          className="bg-background/70 border border-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City, Country" 
                          defaultValue="Landran, Mohali, Punjab – 140307"
                          className="bg-background/70 border border-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    
                    <div className="flex justify-end">
                      <Button disabled>
                        Update Contact Info
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 backdrop-blur-sm border border-primary/10 mt-8">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your admin panel login password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        className="bg-background/70 border border-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        className="bg-background/70 border border-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        className="bg-background/70 border border-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                  <div className="flex justify-end">
                    <Button disabled>
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;