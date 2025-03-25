
import React, { useEffect, useRef } from 'react';
import Button from './Button';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollPosition = window.scrollY;
      const opacity = Math.max(0, Math.min(1, 1 - scrollPosition / 500));
      heroRef.current.style.opacity = opacity.toString();
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-0"></div>
      
      {/* Animated circles in the background */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="container relative z-10 px-4 py-16 mx-auto text-center">
        <span className="inline-block px-3 py-1.5 mb-6 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full">
          Transform Your Career with Expert Guidance
        </span>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 mx-auto max-w-4xl">
          Connect with Industry Experts for <span className="text-primary">Personalized Mentorship</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl">
          Book one-on-one mentorship sessions or join group upskilling programs led by top professionals in your field.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/mentors" variant="primary" size="lg" className="w-full sm:w-auto">
            Explore Mentors
          </Button>
          <Button to="/group-sessions" variant="outline" size="lg" className="w-full sm:w-auto">
            Browse Group Sessions
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "500+", label: "Expert Mentors" },
            { number: "25,000+", label: "Mentorship Sessions" },
            { number: "98%", label: "Satisfaction Rate" },
            { number: "40+", label: "Industries Covered" }
          ].map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">{stat.number}</span>
              <span className="text-sm text-muted-foreground mt-2">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2">Scroll down</span>
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L10 9L19 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
