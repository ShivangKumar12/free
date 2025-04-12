import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setLocation] = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      closeMenu();
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/70 backdrop-blur-lg border-b border-primary/10' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="relative w-10 h-10 mr-3">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <span className="font-orbitron text-lg font-bold text-primary">S</span>
            </div>
          </div>
          <span className="font-orbitron text-xl font-bold">DEB<span className="text-primary">IAN</span></span>
        </Link>
        
        <div className="hidden md:flex space-x-8">
          <button 
            onClick={() => scrollToSection('home')} 
            className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('projects')} 
            className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
          >
            Projects
          </button>
          <button 
            onClick={() => scrollToSection('skills')} 
            className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
          >
            Skills
          </button>
          <button 
            onClick={() => scrollToSection('reviews')} 
            className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
          >
            Reviews
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
          >
            Contact
          </button>
        </div>
        
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleMenu}
            className="text-foreground focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-primary/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => scrollToSection('home')} 
              className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('projects')} 
              className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
            >
              Projects
            </button>
            <button 
              onClick={() => scrollToSection('skills')} 
              className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
            >
              Skills
            </button>
            <button 
              onClick={() => scrollToSection('reviews')} 
              className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
            >
              Reviews
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="font-space text-sm uppercase tracking-wider hover:text-primary transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
