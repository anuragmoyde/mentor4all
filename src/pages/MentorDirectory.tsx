import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import MentorCard from '@/components/MentorCard';
import MentorDetailView from '@/components/mentors/MentorDetailView';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MentorData {
  id: string;
  hourly_rate: number;
  years_experience: number | null;
  expertise: string[];
  industry: string | null;
  job_title: string | null;
  company: string | null;
  average_rating: number;
  review_count: number;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

const MentorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [availableExpertise, setAvailableExpertise] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            avatar_url,
            bio
          )
        `)
        .order('hourly_rate', { ascending: true });

      if (error) {
        console.error("Error fetching mentors:", error);
        throw error;
      }

      return data as MentorData[];
    }
  });

  useEffect(() => {
    if (mentors) {
      const expertise = new Set<string>();
      const industries = new Set<string>();
      
      mentors.forEach(mentor => {
        if (mentor.expertise) {
          mentor.expertise.forEach(exp => expertise.add(exp));
        }
        if (mentor.industry) {
          industries.add(mentor.industry);
        }
      });
      
      setAvailableExpertise(Array.from(expertise));
      setAvailableIndustries(Array.from(industries));
    }
  }, [mentors]);

  const filteredMentors = mentors?.filter(mentor => {
    const nameMatch = 
      !searchTerm || 
      (mentor.profiles.first_name && mentor.profiles.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.profiles.last_name && mentor.profiles.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.job_title && mentor.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.company && mentor.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const priceMatch = 
      mentor.hourly_rate >= priceRange[0] && 
      mentor.hourly_rate <= priceRange[1];
    
    const expertiseMatch = 
      selectedExpertise.length === 0 || 
      selectedExpertise.some(exp => mentor.expertise?.includes(exp));
    
    const industryMatch = 
      selectedIndustries.length === 0 || 
      (mentor.industry && selectedIndustries.includes(mentor.industry));
    
    return nameMatch && priceMatch && expertiseMatch && industryMatch;
  });

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise(prev => 
      prev.includes(expertise) 
        ? prev.filter(e => e !== expertise) 
        : [...prev, expertise]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry) 
        : [...prev, industry]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 5000]);
    setSelectedExpertise([]);
    setSelectedIndustries([]);
  };

  const handleMentorSelect = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMentors = () => {
    setSelectedMentorId(null);
  };

  if (selectedMentorId) {
    return (
      <div className="container mx-auto py-12 px-4">
        <MentorDetailView mentorId={selectedMentorId} onBack={handleBackToMentors} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Find Mentors</h1>
      <p className="text-muted-foreground mb-8">Connect with experienced mentors who can guide you on your career path.</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="hidden md:block w-64 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range (₹/hour)</label>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={5000}
                    step={100}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Expertise</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {availableExpertise.map(expertise => (
                      <div 
                        key={expertise} 
                        className="flex items-center"
                        onClick={() => toggleExpertise(expertise)}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer
                          ${selectedExpertise.includes(expertise) ? 'bg-primary border-primary' : 'border-gray-300'}`}
                        >
                          {selectedExpertise.includes(expertise) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="ml-2 text-sm cursor-pointer">{expertise}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Industry</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {availableIndustries.map(industry => (
                      <div 
                        key={industry} 
                        className="flex items-center"
                        onClick={() => toggleIndustry(industry)}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer
                          ${selectedIndustries.includes(industry) ? 'bg-primary border-primary' : 'border-gray-300'}`}
                        >
                          {selectedIndustries.includes(industry) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="ml-2 text-sm cursor-pointer">{industry}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, job title, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="md:hidden" 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="md:hidden mb-6">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-between">
                <span>Filters</span>
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price Range (₹/hour)</label>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        min={0}
                        max={5000}
                        step={100}
                        onValueChange={setPriceRange}
                        className="mb-6"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Expertise</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedExpertise.length === 0 ? (
                          <span className="text-sm text-muted-foreground">None selected</span>
                        ) : (
                          selectedExpertise.map(exp => (
                            <Badge 
                              key={exp} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {exp}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpertise(exp);
                                }}
                              />
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIndustries.length === 0 ? (
                          <span className="text-sm text-muted-foreground">None selected</span>
                        ) : (
                          selectedIndustries.map(ind => (
                            <Badge 
                              key={ind} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {ind}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleIndustry(ind);
                                }}
                              />
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? 'Loading mentors...' 
                : `Showing ${filteredMentors?.length || 0} mentors`}
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMentors?.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <p className="text-lg font-medium">No mentors match your criteria</p>
              <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button className="mt-4" onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors?.map(mentor => (
                <div 
                  key={mentor.id} 
                  onClick={() => handleMentorSelect(mentor.id)}
                  className="cursor-pointer transform hover:scale-[1.02] transition-transform"
                >
                  <MentorCard
                    id={mentor.id}
                    name={`${mentor.profiles.first_name || ''} ${mentor.profiles.last_name || ''}`}
                    title={mentor.job_title || ''}
                    company={mentor.company || ''}
                    hourlyRate={mentor.hourly_rate}
                    rating={mentor.average_rating}
                    reviewCount={mentor.review_count}
                    expertise={mentor.expertise || []}
                    industry={mentor.industry || ''}
                    bio={mentor.profiles.bio || ''}
                    avatarUrl={mentor.profiles.avatar_url || ''}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDirectory;
