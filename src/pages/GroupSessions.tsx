
import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import SessionCard from '../components/SessionCard';
import { Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Button';
import { cn } from '@/lib/utils';

// Sample data for sessions
const sessions = [
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
    category: 'Design',
    level: 'Intermediate'
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
    category: 'Leadership',
    level: 'Advanced'
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
    category: 'Data Science',
    level: 'Beginner'
  },
  {
    id: '4',
    title: 'UX Research Methods Workshop',
    mentor: {
      name: 'Emily Chen',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'July 2, 2023 - 11:00 AM PST',
    duration: '3 hours',
    capacity: 20,
    enrolled: 12,
    price: 69,
    category: 'Design',
    level: 'Intermediate'
  },
  {
    id: '5',
    title: 'Product Management Fundamentals',
    mentor: {
      name: 'David Kim',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'July 5, 2023 - 2:00 PM PST',
    duration: '2.5 hours',
    capacity: 35,
    enrolled: 28,
    price: 89,
    category: 'Product',
    level: 'Beginner'
  },
  {
    id: '6',
    title: 'Advanced React Patterns for Frontend Developers',
    mentor: {
      name: 'Lisa Wong',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    },
    date: 'July 10, 2023 - 9:00 AM PST',
    duration: '4 hours',
    capacity: 30,
    enrolled: 24,
    price: 99,
    category: 'Development',
    level: 'Advanced'
  },
];

const GroupSessions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeView, setActiveView] = useState('upcoming');
  
  const [filters, setFilters] = useState({
    category: {
      label: 'Category',
      options: [
        { label: 'Design', value: 'Design' },
        { label: 'Development', value: 'Development' },
        { label: 'Leadership', value: 'Leadership' },
        { label: 'Product', value: 'Product' },
        { label: 'Data Science', value: 'Data Science' },
      ],
      selected: [],
    },
    level: {
      label: 'Experience Level',
      options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
      ],
      selected: [],
    },
    price: {
      label: 'Price Range',
      options: [
        { label: '$0 - $50', value: '0-50' },
        { label: '$50 - $100', value: '50-100' },
        { label: '$100+', value: '100+' },
      ],
      selected: [],
    },
  });
  
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
  
  // Filter sessions based on search query and selected filters
  const filteredSessions = sessions.filter((session) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !session.title.toLowerCase().includes(query) &&
        !session.mentor.name.toLowerCase().includes(query) &&
        !session.category.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    // Category filter
    if (filters.category.selected.length > 0 && !filters.category.selected.includes(session.category)) {
      return false;
    }
    
    // Level filter
    if (filters.level.selected.length > 0 && !filters.level.selected.includes(session.level)) {
      return false;
    }
    
    // Price filter
    if (filters.price.selected.length > 0) {
      const matchesPrice = filters.price.selected.some(range => {
        const [min, max] = range.split('-').map(Number);
        if (!max) { // For the "$100+" case
          return session.price >= min;
        }
        return session.price >= min && session.price <= max;
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Group Upskilling Sessions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join interactive workshops led by industry experts to level up your skills along with peers.
          </p>
        </div>
        
        {/* View toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('upcoming')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeView === 'upcoming' 
                  ? "bg-white shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center",
                activeView === 'calendar' 
                  ? "bg-white shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar size={16} className="mr-1.5" /> Calendar View
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'Session' : 'Sessions'} Available
            </h2>
            
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
        
        {/* Sessions Content */}
        {activeView === 'upcoming' && (
          <>
            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">No sessions found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search criteria to find available sessions.
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
          </>
        )}
        
        {activeView === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on a calendar view to make it easier to find sessions that fit your schedule.
              </p>
            </div>
          </div>
        )}
        
        {/* For Companies Section */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Looking for Team Training?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Elevate your entire team's skills with customized group sessions. Get special rates for corporate bookings and tailored content for your team's needs.
              </p>
              <Button variant="primary" size="lg">
                Inquire About Team Training
              </Button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 md:min-w-[300px]">
              <h3 className="text-lg font-semibold mb-4">Team Benefits</h3>
              <ul className="space-y-3">
                {[
                  'Customized training content',
                  'Private sessions for your team',
                  'Flexible scheduling options',
                  'Group discounts available',
                  'Progress tracking for teams'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSessions;
