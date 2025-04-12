import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const resumeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  projectBrief: z.string().min(10, { message: "Project brief must be at least 10 characters" }),
  projectCategory: z.string().min(1, { message: "Please select a project category" }),
  budgetRange: z.string().min(1, { message: "Please select a budget range" }),
});

type ResumeFormValues = z.infer<typeof resumeFormSchema>;

const ResumeUploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState({ name: '', size: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      projectBrief: "",
      projectCategory: "",
      budgetRange: "",
    },
  });
  
  const submitResume = useMutation({
    mutationFn: async (data: ResumeFormValues & { resumeUrl: string }) => {
      const response = await apiRequest('POST', '/api/resumes', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Thank you for your submission! We'll get back to you soon.",
        variant: "default",
      });
      form.reset();
      setFile(null);
      setFileDetails({ name: '', size: '' });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // Check file type
      const fileType = selectedFile.type;
      if (fileType !== 'application/pdf' && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file only.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setFileDetails({
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(0) + ' KB',
      });
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-primary');
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary');
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary');
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file type
      const fileType = droppedFile.type;
      if (fileType !== 'application/pdf' && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file only.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      setFileDetails({
        name: droppedFile.name,
        size: (droppedFile.size / 1024).toFixed(0) + ' KB',
      });
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFileDetails({ name: '', size: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const uploadFileToFirebase = async (file: File) => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `resumes/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (data: ResumeFormValues) => {
    if (!file) {
      toast({
        title: "Missing Resume",
        description: "Please upload your resume to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const resumeUrl = await uploadFileToFirebase(file);
      if (!resumeUrl) {
        throw new Error('Failed to upload resume');
      }
      
      submitResume.mutate({
        ...data,
        resumeUrl,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload your resume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <section id="resume-upload" className="py-24 relative bg-[#121242]/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-secondary/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Submit"
            highlight="Resume"
            description="Looking to collaborate? Share your resume and project details to get started."
          />
          
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your full name" 
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
                            placeholder="Your email address" 
                            type="email"
                            className="bg-background/70 border border-primary/20 focus:border-primary/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="projectBrief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Brief</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your project, requirements, timeline, and budget..." 
                          className="bg-background/70 border border-primary/20 focus:border-primary/50"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Category</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-background/70 border border-primary/20 focus:border-primary/50">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent 
                              position="popper" 
                              className="min-w-[200px] max-h-[300px] overflow-y-auto z-50" 
                              sideOffset={5}
                              align="start"
                              avoidCollisions={true}
                            >
                              <SelectGroup>
                                <SelectItem value="web">Web Development</SelectItem>
                                <SelectItem value="app">Mobile App</SelectItem>
                                <SelectItem value="design">UI/UX Design</SelectItem>
                                <SelectItem value="branding">Branding & Identity</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-background/70 border border-primary/20 focus:border-primary/50">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                            <SelectContent 
                              position="popper" 
                              className="min-w-[200px] max-h-[300px] overflow-y-auto z-50" 
                              sideOffset={5}
                              align="start"
                              avoidCollisions={true}
                            >
                              <SelectGroup>
                                <SelectItem value="small">$1,000 - $5,000</SelectItem>
                                <SelectItem value="medium">$5,000 - $10,000</SelectItem>
                                <SelectItem value="large">$10,000 - $25,000</SelectItem>
                                <SelectItem value="enterprise">$25,000+</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormLabel>Upload Resume (PDF or DOCX)</FormLabel>
                  {!file ? (
                    <div 
                      ref={dropAreaRef}
                      className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mt-2" 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-300 mb-2">Drag & drop your resume here or click to browse</p>
                        <p className="text-gray-500 text-sm">Supports: PDF, DOCX (Max 5MB)</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.docx"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 bg-background/70 p-3 rounded-lg border border-primary/20">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{fileDetails.name}</p>
                          <p className="text-xs text-gray-500">{fileDetails.size}</p>
                        </div>
                        <button 
                          type="button" 
                          className="text-gray-400 hover:text-destructive transition-colors"
                          onClick={removeFile}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isUploading || submitResume.isPending}
                  >
                    {(isUploading || submitResume.isPending) ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isUploading ? "Uploading Resume..." : "Submitting Application..."}
                      </div>
                    ) : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeUploadSection;
