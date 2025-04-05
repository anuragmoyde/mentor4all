import React from "react";
import Hero from "../components/Hero";
import MentorCard from "../components/MentorCard";
import SessionCard from "../components/SessionCard";
import TestimonialSection from "../components/TestimonialSection";
import Button from "../components/Button";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Globe,
  Lightbulb,
  Users,
  Heart,
} from "lucide-react";

// Updated sample data with Indian names
const featuredMentors = [
  {
    id: "1",
    name: "Neha Mehta",
    title: "Serial Entrepreneur",
    company: "TechVentures India",
    expertise: ["Business Strategy", "Startup Scaling", "Funding"],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 2000,
    availability: "Next available: Tomorrow",
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "2",
    name: "Rajiv Khanna",
    title: "Legal Advisor",
    company: "LegalEdge Consultants",
    expertise: ["Startup Law", "IP Rights", "Compliance"],
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: 1800,
    availability: "Next available: Today",
    image:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "3",
    name: "Ananya Desai",
    title: "Impact Investor",
    company: "Samridhi Ventures",
    expertise: ["Social Enterprise", "Impact Measurement", "Funding"],
    rating: 4.7,
    reviewCount: 86,
    hourlyRate: 1500,
    availability: "Next available: Thursday",
    image:
      "https://images.unsplash.com/photo-1598641795816-a84ac9eac40c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
  },
];

const featuredSessions = [
  {
    id: "1",
    title: "Building a Scalable Startup: From Idea to Series A",
    mentor: {
      name: "Vivek Sharma",
      image:
        "https://images.unsplash.com/photo-1623605931891-d5b95ee98459?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    },
    date: "June 15, 2023 - 10:00 AM IST",
    duration: "2 hours",
    capacity: 30,
    enrolled: 21,
    price: 999,
    category: "Entrepreneurship",
  },
  {
    id: "2",
    title: "Leadership Skills for New-Age Business Leaders",
    mentor: {
      name: "Sunita Reddy",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    },
    date: "June 20, 2023 - 1:00 PM IST",
    duration: "3 hours",
    capacity: 25,
    enrolled: 18,
    price: 1499,
    category: "Leadership",
  },
  {
    id: "3",
    title: "Building Sustainable Social Enterprises",
    mentor: {
      name: "Karan Verma",
      image:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    },
    date: "June 25, 2023 - 9:00 AM IST",
    duration: "4 hours",
    capacity: 40,
    enrolled: 32,
    price: 1299,
    category: "Social Impact",
  },
];

// Mentor categories with icons and descriptions
const mentorCategories = [
  {
    title: "Business & Entrepreneurship",
    description:
      "Connect with founders and business leaders to build and scale your venture",
    icon: <Briefcase className="w-10 h-10 text-primary" />,
  },
  {
    title: "Career Growth & Professional Development",
    description:
      "Accelerate your professional journey with tailored guidance from industry experts",
    icon: <GraduationCap className="w-10 h-10 text-primary" />,
  },
  {
    title: "Social Impact & Non-Profit",
    description:
      "Create meaningful change with guidance from experienced social entrepreneurs",
    icon: <Heart className="w-10 h-10 text-primary" />,
  },
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* How It Works Section - Moved up for better flow */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it simple to connect with the right expert and
              accelerate your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10 text-primary" />,
                title: "Find Your Expert",
                description:
                  "Browse our curated network of industry leaders across business, social impact, legal, and career growth.",
              },
              {
                icon: <Globe className="w-10 h-10 text-primary" />,
                title: "Book a Session",
                description:
                  "Schedule a one-on-one mentorship or join a group session at your convenience.",
              },
              {
                icon: <Lightbulb className="w-10 h-10 text-primary" />,
                title: "Learn & Implement",
                description:
                  "Gain strategic insights and practical advice to apply to your business or career.",
              },
              {
                icon: <Briefcase className="w-10 h-10 text-primary" />,
                title: "Scale & Grow",
                description:
                  "Apply expert guidance to scale your venture or advance your professional journey.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-white transition-colors hover:shadow-md"
              >
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

      {/* Mentor Categories Section - Enhanced design */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Find Expert Guidance In</h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                Connect with mentors specialized in these key areas to help you
                achieve your goals
              </p>
            </div>
            <Button
              to="/mentors"
              variant="outline"
              className="mt-4 md:mt-0 group"
            >
              View all categories{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mentorCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1"
              >
                <div className="mx-auto bg-primary/10 w-20 h-20 flex items-center justify-center rounded-full mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {category.description}
                </p>
                <Button
                  to="/mentors"
                  variant="ghost"
                  className="text-primary group"
                >
                  Find a mentor{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Top-Rated Experts</h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                Connect with industry-leading mentors for personalized guidance.
              </p>
            </div>
            <Button
              to="/mentors"
              variant="ghost"
              className="mt-4 md:mt-0 group"
            >
              Explore all mentors{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <MentorCard 
                key={mentor.id}
                id={mentor.id}
                name={mentor.name}
                title={mentor.title}
                hourlyRate={mentor.hourlyRate}
                rating={mentor.rating}
                reviewCount={mentor.reviewCount}
                expertise={mentor.expertise}
                industry="Business"
                bio=""
                avatarUrl={mentor.image}
                company={mentor.company}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sessions Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Upcoming Group Sessions</h2>
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                Join interactive workshops led by industry experts to level up
                your skills.
              </p>
            </div>
            <Button
              to="/group-sessions"
              variant="ghost"
              className="mt-4 md:mt-0 group"
            >
              View all sessions{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
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
      <section className="py-20 bg-gradient-to-br from-primary to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Journey?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of entrepreneurs and professionals building their
            future through expert mentorship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/mentors"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-base"
            >
              Explore Mentors
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
