import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SectionHeading from '../ui/SectionHeading';
import { ProjectCategory, Project } from '@/types/schema';

const ProjectsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 60000,
  });
  
  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects?.filter((project: Project) => project.category === activeCategory);
  
  const categories: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web' },
    { id: 'app', label: 'Mobile App' },
    { id: 'graphic', label: 'Graphic Design' },
    { id: 'poster', label: 'Poster' }
  ];
  
  // Sample projects for initial render or fallback
  const sampleProjects: Project[] = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Modern e-commerce solution with integrated payment gateways and inventory management.',
      category: 'web',
      imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166',
      tags: ['React', 'Node.js', 'MongoDB'],
      liveUrl: 'https://example.com',
      codeUrl: 'https://github.com'
    },
    {
      id: 2,
      title: 'Fitness Tracker App',
      description: 'Comprehensive fitness tracking application with workout plans and progress monitoring.',
      category: 'app',
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
      tags: ['React Native', 'Firebase', 'Redux'],
      liveUrl: 'https://appstore.com',
      codeUrl: 'https://playstore.com'
    },
    {
      id: 3,
      title: 'Tech Startup Branding',
      description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines.',
      category: 'graphic',
      imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d',
      tags: ['Logo Design', 'Brand Identity', 'Style Guide'],
      liveUrl: 'https://behance.com',
      codeUrl: undefined
    },
    {
      id: 4,
      title: 'Music Festival Poster',
      description: 'Event poster design for an annual music festival featuring vibrant colors and custom typography.',
      category: 'poster',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      tags: ['Poster Design', 'Typography', 'Adobe Illustrator'],
      liveUrl: 'https://dribbble.com',
      codeUrl: undefined
    },
    {
      id: 5,
      title: 'Analytics Dashboard',
      description: 'Real-time analytics dashboard with customizable widgets and data visualization tools.',
      category: 'web',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-36c11767b26a',
      tags: ['Vue.js', 'D3.js', 'Express'],
      liveUrl: 'https://example.com/dashboard',
      codeUrl: 'https://github.com/dashboard'
    },
    {
      id: 6,
      title: 'Food Delivery App',
      description: 'On-demand food delivery application with real-time order tracking and restaurant discovery.',
      category: 'app',
      imageUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6',
      tags: ['Flutter', 'Firebase', 'Google Maps API'],
      liveUrl: 'https://appstore.com/foodapp',
      codeUrl: 'https://playstore.com/foodapp'
    }
  ];
  
  const projectsToDisplay = projects || sampleProjects;
  
  return (
    <section id="projects" className="py-24 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-secondary/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          title="My"
          highlight="Projects"
          description="Explore my diverse portfolio showcasing web development, mobile apps, graphic design, and more."
        />
        
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-background/50 backdrop-blur-sm rounded-full border border-primary/20">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-gray-300 hover:text-primary'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden border border-primary/10 animate-pulse">
                <div className="w-full h-56 bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-700 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-24 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-3 text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold mt-4">Failed to load projects</h3>
              <p className="text-gray-400 mt-2">Please try again later.</p>
            </div>
          ) : (
            // Display projects
            (filteredProjects || projectsToDisplay)
              .filter((project: Project) => activeCategory === 'all' || project.category === activeCategory)
              .map((project: Project) => (
                <div 
                  key={project.id} 
                  className="project-card bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden border border-primary/10"
                  data-category={project.category}
                >
                  <div className="relative overflow-hidden group">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground font-medium text-xs py-1 px-3 rounded-full">
                      {project.category === 'web' && 'Web Development'}
                      {project.category === 'app' && 'Mobile App'}
                      {project.category === 'graphic' && 'Graphic Design'}
                      {project.category === 'poster' && 'Poster Design'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-space mb-2">{project.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Live Demo
                        </a>
                      )}
                      {project.codeUrl && (
                        <a 
                          href={project.codeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          View Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="#" 
            className="inline-flex items-center px-6 py-3 bg-transparent border border-primary/50 text-primary font-medium rounded-full hover:bg-primary/10 transition-all"
          >
            View All Projects 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
