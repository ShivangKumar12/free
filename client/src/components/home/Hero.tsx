import React, { useEffect, useRef } from 'react';
import FloatingElement from '../ui/FloatingElement';

const Hero: React.FC = () => {
  const typingTextRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (!typingTextRef.current) return;
    
    const phrases = ['Web Developer', 'Mobile App Developer', 'UI/UX Designer', 'Graphic Designer', '3D Artist'];
    let phraseIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    const typeEffect = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (typingTextRef.current) {
        if (isDeleting) {
          typingTextRef.current.textContent = currentPhrase.substring(0, letterIndex - 1);
          letterIndex--;
          typingSpeed = 50;
        } else {
          typingTextRef.current.textContent = currentPhrase.substring(0, letterIndex + 1);
          letterIndex++;
          typingSpeed = 100;
        }
        
        if (!isDeleting && letterIndex === currentPhrase.length) {
          isDeleting = true;
          typingSpeed = 1000; // Pause at end
        } else if (isDeleting && letterIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typingSpeed = 500; // Pause before next word
        }
      }
      
      setTimeout(typeEffect, typingSpeed);
    };
    
    typeEffect();
  }, []);
  
  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/20 filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 filter blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <div className="parallax-element" data-depth="0.2">
              <p className="text-primary font-orbitron uppercase tracking-widest mb-4">Welcome to my portfolio</p>
              <h1 className="text-4xl md:text-6xl font-bold font-space mb-6">I'm <span className="text-primary">Shivang Kumar</span></h1>
              <h2 className="text-2xl md:text-3xl font-space mb-8">Freelance <span ref={typingTextRef} className="text-primary"></span></h2>
              <p className="text-gray-300 mb-8 max-w-lg">Creating modern and efficient digital solutions with a strong focus on backend logic, responsive design, and clean architecture. I specialize in web applications, Android development, and backend engineering to support smart, secure, and scalable platforms.</p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})}
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all neon-border"
                >
                  View My Work
                </button>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
                  className="px-8 py-3 bg-transparent border border-primary/50 text-primary font-medium rounded-full hover:bg-primary/10 transition-all"
                >
                  Contact Me
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <FloatingElement className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-full filter blur-xl opacity-70"></div>
              <div className="absolute w-full h-full flex items-center justify-center">
                <img 
                  src="/assets/profile.png" 
                  alt="Professional headshot of Shivang Kumar" 
                  className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-4 border-primary/30 p-1"
                />
              </div>
              <FloatingElement 
                className="absolute -top-4 -right-4 md:top-0 md:right-0 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30"
                delay={0.5}
              >
                <span className="text-primary font-orbitron">2+ Years Exp</span>
              </FloatingElement>
              <FloatingElement 
                className="absolute -bottom-4 -left-4 md:bottom-0 md:left-0 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30"
                delay={1}
              >
                <span className="text-primary font-orbitron">B.Tech (CSE)</span>
              </FloatingElement>
            </FloatingElement>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={() => document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})}
            className="text-primary"
            aria-label="Scroll to projects"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
