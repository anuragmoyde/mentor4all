
import React from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  filters: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      selected: string[];
    }
  };
  onFilterChange: (filterName: string, values: string[]) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onSearch, 
  filters, 
  onFilterChange,
  className 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const dropdownRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
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
  
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  const handleFilterSelect = (filterName: string, value: string) => {
    const currentSelected = [...filters[filterName].selected];
    const index = currentSelected.indexOf(value);
    
    if (index === -1) {
      currentSelected.push(value);
    } else {
      currentSelected.splice(index, 1);
    }
    
    onFilterChange(filterName, currentSelected);
  };
  
  const clearFilter = (filterName: string) => {
    onFilterChange(filterName, []);
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
              onSearch('');
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
