import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import { SkillCategory } from '@/types/schema';

const SkillsSection: React.FC = () => {
  const skillCategories: SkillCategory[] = [
    {
      title: 'Web Development',
      icon: 'code',
      skills: [
        { name: 'React / Next.js', percentage: 90 },
        { name: 'Node.js / Express', percentage: 88 },
        { name: 'Firebase', percentage: 88 },
        { name: 'MongoDB / MySQL', percentage: 85 }
      ]
    },
    {
      title: 'App Development',
      icon: 'mobile-alt',
      skills: [
        { name: 'React Native', percentage: 82 },
        { name: 'Java (Android)', percentage: 75 },
        { name: 'Kotlin', percentage: 65 },
        { name: 'Firebase Integration', percentage: 80 }
      ]
    },
    {
      title: 'Backend Engineering',
      icon: 'server',
      skills: [
        { name: 'REST APIs, Auth Systems', percentage: 90 },
        { name: 'Firebase Functions', percentage: 85 },
        { name: 'MongoDB Atlas', percentage: 85 },
        { name: 'PHP (Legacy Support)', percentage: 75 }
      ]
    },
    {
      title: 'Graphic Design',
      icon: 'palette',
      skills: [
        { name: 'Adobe Photoshop', percentage: 88 },
        { name: 'Corel Draw', percentage: 85 },
        { name: 'Adobe Illustrator', percentage: 80 },
        { name: 'Canva', percentage: 92 }
      ]
    }
  ];
  
  const iconMap: Record<string, React.ReactNode> = {
    'code': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    'mobile-alt': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    'server': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    'palette': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )
  };
  
  return (
    <section id="skills" className="py-24 relative bg-[#121242]/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-secondary/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-primary/5 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          title="My"
          highlight="Skills"
          description="Specialized in various technologies and tools to deliver high-quality digital solutions."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <div 
              key={index} 
              className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/20 transition-all"></div>
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-background rounded-2xl mb-6 border border-primary/20">
                  {iconMap[category.icon]}
                </div>
                <h3 className="text-xl font-bold font-space mb-4">{category.title}</h3>
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-primary">{skill.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" 
                          style={{ width: `${skill.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/Shivang_Kumar_Resume.pdf" 
            download
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all"
          >
            Download Resume 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
