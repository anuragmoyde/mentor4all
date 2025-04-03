
import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MentorCard from '../components/MentorCard';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: string;
  image: string;
  industry: string;
  experience: string;
  availabilityCount?: number;
}

// Sample data for mentors (fallback data if API fails)
const sampleMentors = [
  {
    id: '1',
    name: 'Jennifer Lee',
    title: 'Senior Product Manager',
    company: 'Google',
    expertise: ['Product Strategy', 'UX', 'Team Leadership'],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 2000,
    availability: 'Next available: Tomorrow',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Technology',
    experience: '10+ years'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Engineering Manager',
    company: 'Meta',
    expertise: ['Software Architecture', 'Career Growth', 'Leadership'],
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: 2200,
    availability: 'Next available: Today',
    image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Technology',
    experience: '10+ years'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    title: 'Marketing Director',
    company: 'Spotify',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Analytics'],
    rating: 4.7,
    reviewCount: 86,
    hourlyRate: 1800,
    availability: 'Next available: Thursday',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Marketing',
    experience: '5-10 years'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    title: 'CTO',
    company: 'Startup Accelerator',
    expertise: ['Scaling Teams', 'Technical Strategy', 'Startups'],
    rating: 4.9,
    reviewCount: 113,
    hourlyRate: 2500,
    availability: 'Next available: Friday',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Technology',
    experience: '10+ years'
  },
  {
    id: '5',
    name: 'Emma Wilson',
    title: 'Senior UX Designer',
    company: 'Airbnb',
    expertise: ['UX Research', 'Design Systems', 'UI Design'],
    rating: 4.8,
    reviewCount: 79,
    hourlyRate: 1900,
    availability: 'Next available: Monday',
    image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Design',
    experience: '5-10 years'
  },
  {
    id: '6',
    name: 'James Taylor',
    title: 'Finance Director',
    company: 'JP Morgan',
    expertise: ['Financial Planning', 'Investment', 'Career Transition'],
    rating: 4.6,
    reviewCount: 68,
    hourlyRate: 2300,
    availability: 'Next available: Wednesday',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    industry: 'Finance',
    experience: '10+ years'
  },
];

const MentorDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    industry: {
      label: 'Industry',
      options: [
        { label: 'Technology', value: 'Technology' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Design', value: 'Design' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Consulting', value: 'Consulting' },
        { label: 'Education', value: 'Education' },
      ],
      selected: [],
    },
    expertise: {
      label: 'Expertise',
      options: [
        { label: 'UX Design', value: 'UX' },
        { label: 'Product Strategy', value: 'Product Strategy' },
        { label: 'Leadership', value: 'Leadership' },
        { label: 'Software Architecture', value: 'Software Architecture' },
        { label: 'Career Growth', value: 'Career Growth' },
        { label: 'Digital Marketing', value: 'Digital Marketing' },
      ],
      selected: [],
    },
    experience: {
      label: 'Experience',
      options: [
        { label: '0-2 years', value: '0-2 years' },
        { label: '3-5 years', value: '3-5 years' },
        { label: '5-10 years', value: '5-10 years' },
        { label: '10+ years', value: '10+ years' },
      ],
      selected: [],
    },
    price: {
      label: 'Price Range',
      options: [
        { label: '₹0 - ₹1000', value: '0-1000' },
        { label: '₹1000 - ₹2000', value: '1000-2000' },
        { label: '₹2000 - ₹3000', value: '2000-3000' },
        { label: '₹3000+', value: '3000+' },
      ],
      selected: [],
    },
  });

  // Fetch mentors from Supabase
  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        // Fetch all mentors from the database
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('mentors')
          .select(`
            id,
            hourly_rate,
            years_experience,
            industry,
            expertise,
            company,
            job_title,
            average_rating,
            review_count,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('profiles.user_type', 'mentor')
          .not('hourly_rate', 'is', null)
          .not('expertise', 'is', null);

        if (mentorsError) throw mentorsError;

        // Fetch availability information for each mentor
        const formattedMentors: Mentor[] = await Promise.all(
          mentorsData.map(async (mentor) => {
            // Get availability count
            const { data: availabilityData, error: availabilityError } = await supabase
              .from('mentor_availability')
              .select('id')
              .eq('mentor_id', mentor.id)
              .gte('day', new Date().toISOString().split('T')[0]);

            if (availabilityError) console.error('Error fetching availability:', availabilityError);

            const availabilityCount = availabilityData?.length || 0;

            let experienceCategory = '0-2 years';
            if (mentor.years_experience > 10) {
              experienceCategory = '10+ years';
            } else if (mentor.years_experience > 5) {
              experienceCategory = '5-10 years';
            } else if (mentor.years_experience > 2) {
              experienceCategory = '3-5 years';
            }

            // Format the mentor data
            return {
              id: mentor.id,
              name: `${mentor.profiles.first_name} ${mentor.profiles.last_name}`,
              title: mentor.job_title || 'Professional',
              company: mentor.company || 'Company',
              expertise: mentor.expertise || [],
              rating: mentor.average_rating || 4.5,
              reviewCount: mentor.review_count || 0,
              hourlyRate: mentor.hourly_rate,
              availability: availabilityCount > 0 ? 'Has available slots' : 'No availability',
              availabilityCount: availabilityCount,
              image: mentor.profiles.avatar_url || 'https://via.placeholder.com/150',
              industry: mentor.industry || 'Other',
              experience: experienceCategory,
            };
          })
        );

        setMentors(formattedMentors.length > 0 ? formattedMentors : sampleMentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
        // Fallback to sample data if API fails
        setMentors(sampleMentors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    setFilters({
      ...filters,
      [filterName]: {
        ...filters[filterName],
        selected: values,
      },
    });
  };
  
  // Filter mentors based on search query and selected filters
  const filteredMentors = mentors.filter((mentor) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !mentor.name.toLowerCase().includes(query) &&
        !mentor.title.toLowerCase().includes(query) &&
        !mentor.company.toLowerCase().includes(query) &&
        !mentor.expertise.some(skill => skill.toLowerCase().includes(query))
      ) {
        return false;
      }
    }
    
    // Industry filter
    if (filters.industry.selected.length > 0 && !filters.industry.selected.includes(mentor.industry)) {
      return false;
    }
    
    // Expertise filter
    if (filters.expertise.selected.length > 0 && 
        !mentor.expertise.some(skill => filters.expertise.selected.includes(skill))) {
      return false;
    }
    
    // Experience filter
    if (filters.experience.selected.length > 0 && !filters.experience.selected.includes(mentor.experience)) {
      return false;
    }
    
    // Price filter
    if (filters.price.selected.length > 0) {
      const matchesPrice = filters.price.selected.some(range => {
        const [min, max] = range.split('-').map(Number);
        if (!max) { // For the "₹3000+" case
          return mentor.hourlyRate >= min;
        }
        return mentor.hourlyRate >= min && mentor.hourlyRate <= max;
      });
      
      if (!matchesPrice) {
        return false;
      }
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Page header */}
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with industry experts for personalized guidance to accelerate your career growth.
          </p>
        </div>
        
        {/* Filters and View Controls */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Loading mentors...' : 
                `${filteredMentors.length} ${filteredMentors.length === 1 ? 'Mentor' : 'Mentors'} Available`}
            </h2>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List size={18} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="md:hidden flex items-center"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <SlidersHorizontal size={18} className="mr-1.5" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <FilterBar
              onSearch={handleSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          {/* Mobile Filters (collapsible) */}
          <div className={cn("md:hidden", mobileFiltersOpen ? "block" : "hidden")}>
            <FilterBar
              onSearch={handleSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
        
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col space-y-4"
          )}>
            {Array(6).fill(0).map((_, i) => (
              <div 
                key={i}
                className="bg-slate-100 animate-pulse rounded-lg h-64"
              ></div>
            ))}
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col space-y-4"
          )}>
            {filteredMentors.map((mentor) => (
              <MentorCard 
                key={mentor.id} 
                mentor={mentor} 
                className={viewMode === 'list' ? "flex flex-row p-4" : ""}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search criteria to find available mentors.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilters(Object.keys(filters).reduce((acc, key) => {
                  acc[key] = { ...filters[key], selected: [] };
                  return acc;
                }, {} as typeof filters));
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDirectory;
