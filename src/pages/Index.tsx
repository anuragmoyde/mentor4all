import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import TestimonialSection from "@/components/TestimonialSection";
import MentorCard from "@/components/MentorCard";
import FilterBar from "@/components/FilterBar";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Fetch mentors data from Supabase
  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('mentors')
          .select(`
            id,
            hourly_rate,
            years_experience,
            expertise,
            industry,
            job_title,
            company,
            average_rating,
            review_count,
            profiles(first_name, last_name, avatar_url, bio)
          `);
        
        // Apply filters
        if (selectedIndustry) {
          query = query.eq('industry', selectedIndustry);
        }
        
        if (selectedExpertise) {
          query = query.contains('expertise', [selectedExpertise]);
        }
        
        if (selectedRating) {
          query = query.gte('average_rating', selectedRating);
        }
        
        query = query.gte('hourly_rate', priceRange[0]).lte('hourly_rate', priceRange[1]);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const formattedMentors = data.map(mentor => ({
          id: mentor.id,
          name: `${mentor.profiles?.first_name || ''} ${mentor.profiles?.last_name || ''}`.trim(),
          avatarUrl: mentor.profiles?.avatar_url || '/placeholder.svg',
          title: mentor.job_title || 'Mentor',
          company: mentor.company || '',
          hourlyRate: mentor.hourly_rate || 0,
          expertise: mentor.expertise || [],
          industry: mentor.industry || '',
          rating: mentor.average_rating || 4.5,
          reviewCount: mentor.review_count || 0,
          bio: mentor.profiles?.bio || '',
          availabilityCount: 0 // We'll fetch this separately if needed
        }));
        
        setMentors(formattedMentors);
      } catch (error: any) {
        console.error('Error fetching mentors:', error);
        toast({
          title: "Error loading mentors",
          description: "Could not load mentor data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentors();
  }, [selectedIndustry, selectedExpertise, selectedRating, priceRange]);

  const handleIndustryChange = (industry: string | null) => {
    setSelectedIndustry(industry);
  };

  const handleExpertiseChange = (expertise: string | null) => {
    setSelectedExpertise(expertise);
  };

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleViewProfile = (mentorId: string) => {
    navigate(`/mentor/${mentorId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold mb-4 md:mb-0">Find Your Perfect Mentor</h2>
            <Button onClick={() => navigate('/mentors')} size="lg" className="bg-primary hover:bg-primary/90">
              View All Mentors
            </Button>
          </div>
          
          <FilterBar 
            onIndustryChange={handleIndustryChange}
            onExpertiseChange={handleExpertiseChange}
            onRatingChange={handleRatingChange}
            onPriceRangeChange={handlePriceRangeChange}
          />
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="p-6 border rounded-lg shadow-sm animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-4" />
                  <div className="h-8 bg-gray-200 rounded w-full mt-4" />
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {mentors.slice(0, 6).map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  id={mentor.id}
                  name={mentor.name}
                  title={mentor.title}
                  company={mentor.company}
                  hourlyRate={mentor.hourlyRate}
                  rating={mentor.rating}
                  reviewCount={mentor.reviewCount}
                  expertise={mentor.expertise}
                  industry={mentor.industry}
                  bio={mentor.bio}
                  avatarUrl={mentor.avatarUrl}
                  availabilityCount={mentor.availabilityCount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
          
          {mentors.length > 6 && (
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/mentors')} variant="outline" size="lg">
                View All Mentors
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <TestimonialSection />
    </div>
  );
};

export default Index;
