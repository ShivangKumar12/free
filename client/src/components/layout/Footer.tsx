import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-background/70 backdrop-blur-lg border-t border-primary/10 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="relative w-10 h-10 mr-3">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow"></div>
                <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                  <span className="font-orbitron text-lg font-bold text-primary">S</span>
                </div>
              </div>
              <span className="font-orbitron text-xl font-bold">DEB<span className="text-primary">IAN</span></span>
            </Link>
            <p className="text-gray-400 mb-6">Creating immersive digital experiences with cutting-edge technologies for clients worldwide.</p>
            <div className="flex space-x-4">
  {/* GitHub */}
  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.034-1.416-4.034-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.204.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.666-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.009-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.431.372.824 1.102.824 2.222v3.293c0 .319.192.694.801.576C20.565 21.799 24 17.301 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  </a>

  {/* LinkedIn */}
  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S0 4.881 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM5 8H0v16h5V8zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0V24h4.988V13.869c0-7.88-8.922-7.593-11.018-3.714V8z"/>
    </svg>
  </a>

  {/* Instagram */}
  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.976.976 1.246 2.243 1.308 3.608.058 1.267.069 1.647.069 4.851s-.011 3.584-.069 4.85c-.062 1.366-.332 2.633-1.308 3.608-.976.976-2.243 1.246-3.608 1.308-1.267.058-1.647.069-4.851.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.332-3.608-1.308-.976-.976-1.246-2.243-1.308-3.608C2.174 15.647 2.163 15.267 2.163 12s.011-3.584.069-4.85c.062-1.366.332-2.633 1.308-3.608.976-.976 2.243-1.246 3.608-1.308C8.416 2.174 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.13 4.598.443 3.635 1.406c-.963.963-1.276 2.135-1.334 3.417C2.013 6.332 2 6.741 2 12c0 5.259.013 5.668.072 6.948.058 1.282.371 2.454 1.334 3.417.963.963 2.135 1.276 3.417 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.058 2.454-.371 3.417-1.334.963-.963 1.276-2.135 1.334-3.417.059-1.28.072-1.689.072-6.948 0-5.259-.013-5.668-.072-6.948-.058-1.282-.371-2.454-1.334-3.417-.963-.963-2.135-1.276-3.417-1.334C15.668.013 15.259 0 12 0z"/>
      <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998z"/>
      <circle cx="18.406" cy="5.594" r="1.44"/>
    </svg>
  </a>

  {/* Facebook */}
  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.483v-9.294H9.691v-3.622h3.118V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.316h3.587l-.467 3.622h-3.12V24h6.116c.728 0 1.324-.6 1.324-1.326V1.326C24 .6 23.4 0 22.675 0z" />
    </svg>
  </a>
</div>

          </div>
          
          <div>
            <h3 className="font-space font-bold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('home')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Projects
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('skills')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Skills
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Reviews
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('resume-upload')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Submit Resume
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-space font-bold text-xl mb-6">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Web Development</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Mobile App Development</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">UI/UX Design</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Graphic Design</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">3D Animations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Branding</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-space font-bold text-xl mb-6">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to receive updates on new projects and tech insights.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-background/70 border border-primary/20 rounded-l-lg px-4 py-2 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 rounded-r-lg hover:bg-primary/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-primary/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 DEBIAN. All rights reserved. Shivang Kumar</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Cookies Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
