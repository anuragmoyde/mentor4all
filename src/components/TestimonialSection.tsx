
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  title: string;
  company: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "The mentorship I received through this platform was instrumental in helping me raise our first round of funding. My mentor's strategic insights and network connections were exactly what our startup needed to scale.",
    author: "Arjun Patel",
    title: "Founder & CEO",
    company: "GreenTech Innovations",
    image: "https://images.unsplash.com/photo-1623605931891-d5b95ee98459?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    content: "As someone transitioning from corporate to social impact, the expert guidance I received helped me navigate challenges specific to the non-profit sector. The group sessions provided valuable networking with like-minded changemakers.",
    author: "Priya Sharma",
    title: "Founder",
    company: "EduReach Foundation",
    image: "https://images.unsplash.com/photo-1598641795816-a84ac9eac40c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    content: "The legal consulting mentorship helped me understand complex regulatory requirements for my fintech startup. This guidance saved us months of potential delays and helped us construct a robust compliance framework.",
    author: "Vikram Malhotra",
    title: "Co-founder",
    company: "PaySmart Solutions",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
];

const TestimonialSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Success Stories</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from entrepreneurs and leaders who have accelerated their growth through our expert mentorship.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div 
            className="grid grid-cols-1 gap-8 transition-transform duration-500"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={cn(
                  "bg-white rounded-2xl p-8 shadow-sm border border-gray-100",
                  index === activeIndex ? "block" : "hidden"
                )}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 flex md:flex-col items-center">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                    />
                    <Quote className="text-primary hidden md:block mt-4 mx-auto" size={32} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-lg md:text-xl italic text-foreground">{testimonial.content}</p>
                    
                    <div className="mt-6">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.title} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  index === activeIndex ? "bg-primary w-6" : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-2 shadow-sm border border-gray-200 hover:border-gray-300 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-2 shadow-sm border border-gray-200 hover:border-gray-300 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
