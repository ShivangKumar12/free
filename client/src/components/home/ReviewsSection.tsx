import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import SectionHeading from '../ui/SectionHeading';
import { Review } from '@/types/schema';

const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().optional(),
  rating: z.string().min(1, { message: "Please select a rating" }),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters" }),
  projectType: z.string().min(1, { message: "Please select a project type" }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const ReviewsSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      rating: "",
      comment: "",
      projectType: "",
    },
  });
  
  // Get reviews query
  const { data: reviews = [], isLoading, error } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    staleTime: 60000,
  });
  
  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await apiRequest('POST', '/api/reviews', {
        name: data.name,
        email: data.email,
        company: data.company || undefined,
        rating: parseInt(data.rating, 10),
        comment: data.comment,
        projectType: data.projectType,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review will be visible after approval.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ReviewFormValues) => {
    submitReview.mutate(data);
  };
  
  // Sample reviews for initial render or fallback
  const sampleReviews: Review[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      company: "TechStart",
      rating: 5,
      comment: "Alex delivered an exceptional e-commerce platform that exceeded our expectations. The attention to detail and innovative features have significantly improved our online sales. Highly recommended!",
      projectType: "web",
      createdAt: new Date(),
      approved: true,
    },
    {
      id: 2,
      name: "Michael Thompson",
      email: "michael@example.com",
      company: "FitLife",
      rating: 5,
      comment: "The fitness tracking app Alex developed for us has received amazing feedback from our users. The intuitive UI and robust backend have made it our most successful digital product to date.",
      projectType: "app",
      createdAt: new Date(),
      approved: true,
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma@example.com",
      company: "Creative Minds",
      rating: 4,
      comment: "Alex's branding work completely transformed our company's image. The logo design and brand guidelines have given us a cohesive identity that resonates with our target audience.",
      projectType: "graphic",
      createdAt: new Date(),
      approved: true,
    }
  ];
  
  const reviewsToDisplay: Review[] = reviews.length > 0 ? reviews : sampleReviews;
  
  const getDefaultSlidesToShow = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };
  
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getDefaultSlidesToShow());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const updateSlider = () => {
    if (!sliderRef.current) return;
    
    const slideWidth = 100 / slidesToShow;
    const offset = -(currentSlide * slideWidth);
    sliderRef.current.style.transform = `translateX(${offset}%)`;
  };
  
  useEffect(() => {
    updateSlider();
  }, [currentSlide, slidesToShow]);
  
  const prevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };
  
  const nextSlide = () => {
    const maxSlide = Math.max(0, reviewsToDisplay.length - slidesToShow);
    setCurrentSlide(Math.min(maxSlide, currentSlide + 1));
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <svg 
        key={index} 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ${index < rating ? 'text-primary' : 'text-gray-500'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };
  
  return (
    <section id="reviews" className="py-24 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/5 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          title="Client"
          highlight="Reviews"
          description="See what clients have to say about my work and collaboration experience."
        />
        
        <div className="relative">
          <div className="overflow-hidden py-8">
            <div 
              ref={sliderRef}
              className="review-slider flex transition-transform duration-300"
              style={{ transform: `translateX(0%)` }}
            >
              {isLoading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-4">
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/10 h-full">
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-gray-700 mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="flex mb-4 space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-gray-700 rounded-full"></div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-full bg-gray-700 rounded"></div>
                        <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="min-w-full px-4 text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-xl font-bold mt-4">Failed to load reviews</h3>
                  <p className="text-gray-400 mt-2">Please try again later.</p>
                </div>
              ) : (
                reviewsToDisplay.map((review: Review) => (
                  <div key={review.id} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-4">
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/10 h-full">
                      <div className="flex items-center mb-6">
                        <div className="mr-4">
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                            <span className="text-xl font-bold text-primary">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold font-space">{review.name}</h4>
                          <p className="text-sm text-gray-400">{review.company || 'Client'}</p>
                        </div>
                        <div className="ml-auto text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-background/80 text-primary h-10 w-10 rounded-full flex items-center justify-center focus:outline-none hover:bg-background transition-colors z-10"
            aria-label="Previous slide"
            disabled={currentSlide <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-background/80 text-primary h-10 w-10 rounded-full flex items-center justify-center focus:outline-none hover:bg-background transition-colors z-10"
            aria-label="Next slide"
            disabled={currentSlide >= reviewsToDisplay.length - slidesToShow}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mt-16">
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/10">
            <h3 className="text-2xl font-bold font-space mb-6 text-center">Leave Your Review</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            className="bg-background/70 border border-primary/20 focus:border-primary/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your email" 
                            type="email"
                            className="bg-background/70 border border-primary/20 focus:border-primary/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your company" 
                            className="bg-background/70 border border-primary/20 focus:border-primary/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-background/70 border border-primary/20 focus:border-primary/50 w-full">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="w-full min-w-[200px]">
                              <SelectGroup>
                                <SelectItem value="5" className="cursor-pointer">5 Stars - Excellent</SelectItem>
                                <SelectItem value="4" className="cursor-pointer">4 Stars - Very Good</SelectItem>
                                <SelectItem value="3" className="cursor-pointer">3 Stars - Good</SelectItem>
                                <SelectItem value="2" className="cursor-pointer">2 Stars - Fair</SelectItem>
                                <SelectItem value="1" className="cursor-pointer">1 Star - Poor</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your experience working with me..." 
                            className="bg-background/70 border border-primary/20 focus:border-primary/50 h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-background/70 border border-primary/20 focus:border-primary/50 w-full">
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="w-full min-w-[200px]">
                              <SelectGroup>
                                <SelectItem value="web" className="cursor-pointer">Web Development</SelectItem>
                                <SelectItem value="app" className="cursor-pointer">Mobile App</SelectItem>
                                <SelectItem value="graphic" className="cursor-pointer">Graphic Design</SelectItem>
                                <SelectItem value="poster" className="cursor-pointer">Poster Design</SelectItem>
                                <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-5">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={submitReview.isPending}
                    >
                      {submitReview.isPending ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
