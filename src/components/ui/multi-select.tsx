
import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
  emptyText?: string;
}

export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  className,
  placeholder = "Select options",
  emptyText = "No options found.",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options?.filter((option) => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Toggle selection of an option
  const toggleOption = (value: string) => {
    const currentIndex = selected.indexOf(value);
    const newSelected = [...selected];
    
    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    
    onChange(newSelected);
  };

  // Remove an option
  const removeOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  };

  // Clear all selected options
  const clearOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Focus the input when the popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:cursor-pointer hover:bg-accent/5 transition-colors",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 w-full">
            {selected?.length > 0 ? (
              <>
                {selected.map((value) => (
                  <Badge 
                    key={value} 
                    variant="secondary" 
                    className="mr-1 mb-1 bg-primary/10 hover:bg-primary/20 text-primary border-none transition-colors"
                  >
                    {options?.find(opt => opt.value === value)?.label || value}
                    <button
                      className="ml-1 ring-offset-background hover:bg-primary/10 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => removeOption(e, value)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex-1">
                  {!open && selected.length > 0 && (
                    <button
                      className="px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={clearOptions}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="ml-auto self-center flex-shrink-0">
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[200]" align="start">
        <Command className="max-h-80">
          <CommandInput 
            placeholder="Search..." 
            onValueChange={setSearchQuery}
            ref={inputRef}
            className="h-9"
          />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = selected?.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <div className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
