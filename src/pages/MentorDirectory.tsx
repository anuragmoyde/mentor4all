
import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import MentorCard from '../components/MentorCard';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Button';
import { cn } from '@/lib/utils';

// Sample data for mentors
const mentors = [
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
    hourlyRate: 110,
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
    hourlyRate: 100,
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
    hourlyRate: 150,
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
    hourlyRate: 95,
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
    hourlyRate: 130,
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
  
  const [filters, setFilters] = useState({
    industry: {
      label: 'Industry',
      options: [
        { label: 'Technology', value: 'Technology' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Design', value: 'Design' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Healthcare', value: 'Healthcare' },
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
        { label: '$0 - $50', value: '0-50' },
        { label: '$50 - $100', value: '50-100' },
        { label: '$100 - $150', value: '100-150' },
        { label: '$150+', value: '150+' },
      ],
      selected: [],
    },
  });
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    setFilters({
      ...filters,
      [filterName]: {
        ...filters[filterName],
        selected: values,
      },
    });
    // Implement filter logic here
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
        if (!max) { // For the "$150+" case
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
              {filteredMentors.length} {filteredMentors.length === 1 ? 'Mentor' : 'Mentors'} Available
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
        
        {/* Mentors Grid/List */}
        {filteredMentors.length > 0 ? (
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
