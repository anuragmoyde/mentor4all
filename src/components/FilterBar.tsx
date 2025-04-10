
import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  onIndustryChange?: (industry: string | null) => void;
  onExpertiseChange?: (expertise: string | null) => void;
  onRatingChange?: (rating: number | null) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onIndustryChange, 
  onExpertiseChange,
  onRatingChange,
  onPriceRangeChange,
  onSearch,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Initialize filter states
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [expertiseFilter, setExpertiseFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  
  // Define filter options - ensure this is never null/undefined
  const filters = {
    industry: {
      label: "Industry",
      options: [
        { label: "Technology", value: "Technology" },
        { label: "Finance", value: "Finance" },
        { label: "Healthcare", value: "Healthcare" },
        { label: "Education", value: "Education" },
        { label: "E-commerce", value: "E-commerce" },
        { label: "Media & Entertainment", value: "Media & Entertainment" }
      ],
      selected: industryFilter
    },
    expertise: {
      label: "Expertise",
      options: [
        { label: "Career Guidance", value: "Career Guidance" },
        { label: "Leadership", value: "Leadership" },
        { label: "Product Management", value: "Product Management" },
        { label: "UX Design", value: "UX Design" },
        { label: "Marketing", value: "Marketing" },
        { label: "Software Development", value: "Software Development" }
      ],
      selected: expertiseFilter
    },
    rating: {
      label: "Rating",
      options: [
        { label: "5 Stars", value: "5" },
        { label: "4+ Stars", value: "4" },
        { label: "3+ Stars", value: "3" }
      ],
      selected: ratingFilter
    },
    price: {
      label: "Price Range",
      options: [
        { label: "₹0 - ₹500", value: "0-500" },
        { label: "₹500 - ₹1000", value: "500-1000" },
        { label: "₹1000 - ₹2000", value: "1000-2000" },
        { label: "₹2000+", value: "2000+" }
      ],
      selected: priceFilter
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };
  
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (activeDropdown && 
        dropdownRefs.current[activeDropdown] && 
        !dropdownRefs.current[activeDropdown]?.contains(e.target as Node)) {
      setActiveDropdown(null);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  const handleFilterSelect = (filterName: string, value: string) => {
    let newSelected: string[] = [];
    
    switch (filterName) {
      case 'industry':
        // For industry, only allow one selection
        newSelected = industryFilter.includes(value) ? [] : [value];
        setIndustryFilter(newSelected);
        if (onIndustryChange) {
          const industry = newSelected.length > 0 ? newSelected[0] : null;
          onIndustryChange(industry);
        }
        break;
        
      case 'expertise':
        // For expertise, only allow one selection
        newSelected = expertiseFilter.includes(value) ? [] : [value];
        setExpertiseFilter(newSelected);
        if (onExpertiseChange) {
          const expertise = newSelected.length > 0 ? newSelected[0] : null;
          onExpertiseChange(expertise);
        }
        break;
        
      case 'rating':
        // For rating, only allow one selection
        newSelected = ratingFilter.includes(value) ? [] : [value];
        setRatingFilter(newSelected);
        if (onRatingChange) {
          const rating = newSelected.length > 0 ? parseInt(newSelected[0]) : null;
          onRatingChange(rating);
        }
        break;
        
      case 'price':
        // For price, only allow one selection
        newSelected = priceFilter.includes(value) ? [] : [value];
        setPriceFilter(newSelected);
        if (onPriceRangeChange) {
          let range: [number, number] = [0, 10000];
          if (newSelected.length > 0) {
            const priceValue = newSelected[0];
            if (priceValue === '0-500') range = [0, 500];
            else if (priceValue === '500-1000') range = [500, 1000];
            else if (priceValue === '1000-2000') range = [1000, 2000];
            else if (priceValue === '2000+') range = [2000, 10000];
          }
          onPriceRangeChange(range);
        }
        break;
        
      default:
        break;
    }
  };
  
  const clearFilter = (filterName: string) => {
    switch (filterName) {
      case 'industry':
        setIndustryFilter([]);
        if (onIndustryChange) onIndustryChange(null);
        break;
      case 'expertise':
        setExpertiseFilter([]);
        if (onExpertiseChange) onExpertiseChange(null);
        break;
      case 'rating':
        setRatingFilter([]);
        if (onRatingChange) onRatingChange(null);
        break;
      case 'price':
        setPriceFilter([]);
        if (onPriceRangeChange) onPriceRangeChange([0, 10000]);
        break;
      default:
        break;
    }
  };
  
  // Format price labels to use rupee symbol
  const formatPriceLabel = (label: string) => {
    return label.replace(/\$/g, '₹');
  };
  
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-4", className)}>
      <div className="relative flex items-center border border-gray-200 rounded-lg p-2 mb-4">
        <Search size={18} className="text-gray-400 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, expertise or keywords..."
          className="w-full pl-2 pr-4 py-1 focus:outline-none text-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              if (onSearch) onSearch('');
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium flex items-center">
          <SlidersHorizontal size={16} className="mr-1.5" />
          Filters:
        </span>
        
        {Object.entries(filters).map(([name, filter]) => (
          <div 
            key={name} 
            className="relative inline-block" 
            ref={el => dropdownRefs.current[name] = el}
          >
            <button
              onClick={() => toggleDropdown(name)}
              className={cn(
                "flex items-center text-sm px-3 py-1.5 rounded-lg border transition-colors",
                filter.selected.length > 0 
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {filter.label}
              {filter.selected.length > 0 && (
                <span className="ml-1.5 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filter.selected.length}
                </span>
              )}
              <ChevronDown size={16} className="ml-1.5" />
            </button>
            
            {activeDropdown === name && (
              <div className="absolute z-10 mt-1 w-60 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium">{filter.label}</span>
                  {filter.selected.length > 0 && (
                    <button 
                      onClick={() => clearFilter(name)}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {filter.options.map((option) => (
                    <label 
                      key={option.value} 
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filter.selected.includes(option.value)}
                        onChange={() => handleFilterSelect(name, option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm">
                        {name === 'price' ? formatPriceLabel(option.label) : option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
