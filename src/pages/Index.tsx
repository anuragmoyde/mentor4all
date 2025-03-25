
import React from 'react';
import Hero from '../components/Hero';
import MentorCard from '../components/MentorCard';
import SessionCard from '../components/SessionCard';
import TestimonialSection from '../components/TestimonialSection';
import Button from '../components/Button';
import { ArrowRight, Award, Globe, Lightbulb, Users } from 'lucide-react';

// Sample data
const featuredMentors = [
  {
    id: '1',
    name: 'Jennifer Lee',
    title: 'Senior Product Manager',
    company: 'Google',
    expertise: ['Product Strategy', 'UX', 'Team Leadership'],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 120,
    availability: 'Next available: Tomorrow',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Engineering Manager',
    company: 'Meta',
    expertise: ['Software Architecture', 'Career Growth', 'Leadership'],
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: 110,
    availability: 'Next available: Today',
    image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    title: 'Marketing Director',
    company: 'Spotify',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Analytics'],
    rating: 4.7,
    reviewCount: 86,
    hourlyRate: 100,
    availability: 'Next available: Thursday',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
  }
];

const featuredSessions = [
  {
    id: '1',
    title: 'Mastering Design Systems for Product Designers',
    mentor: {
      name: 'Alex Rivera',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'June 15, 2023 - 10:00 AM PST',
    duration: '2 hours',
    capacity: 30,
    enrolled: 21,
    price: 49,
    category: 'Design'
  },
  {
    id: '2',
    title: 'Leadership Skills for New Engineering Managers',
    mentor: {
      name: 'Sophie Lin',
      image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'June 20, 2023 - 1:00 PM PST',
    duration: '3 hours',
    capacity: 25,
    enrolled: 18,
    price: 79,
    category: 'Leadership'
  },
  {
    id: '3',
    title: 'Data Analysis with Python for Beginners',
    mentor: {
      name: 'Marcus Johnson',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'June 25, 2023 - 9:00 AM PST',
    duration: '4 hours',
    capacity: 40,
    enrolled: 32,
    price: 59,
    category: 'Data Science'
  }
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Mentors Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Top-Rated Mentors</h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                Connect with industry-leading experts for personalized guidance.
              </p>
            </div>
            <Button to="/mentors" variant="ghost" className="mt-4 md:mt-0">
              View all mentors <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How Mentor4All Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it simple to connect with the right mentor and accelerate your professional growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10 text-primary" />,
                title: "Find Your Mentor",
                description: "Browse our curated network of industry experts based on your goals and interests."
              },
              {
                icon: <Globe className="w-10 h-10 text-primary" />,
                title: "Book a Session",
                description: "Schedule a one-on-one session at a time that works for your calendar."
              },
              {
                icon: <Lightbulb className="w-10 h-10 text-primary" />,
                title: "Get Expert Guidance",
                description: "Meet virtually to receive personalized advice and actionable feedback."
              },
              {
                icon: <Award className="w-10 h-10 text-primary" />,
                title: "Accelerate Your Growth",
                description: "Apply your learnings and track your progress towards your goals."
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Sessions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Upcoming Group Sessions</h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                Join interactive workshops led by industry experts to level up your skills.
              </p>
            </div>
            <Button to="/group-sessions" variant="ghost" className="mt-4 md:mt-0">
              View all sessions <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <TestimonialSection />
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of professionals who are advancing their careers through expert mentorship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              to="/mentors" 
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-base"
            >
              Find a Mentor
            </Button>
            <Button 
              to="/group-sessions" 
              className="bg-transparent border border-white hover:bg-white/10 px-8 py-3 text-base"
            >
              Browse Group Sessions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
