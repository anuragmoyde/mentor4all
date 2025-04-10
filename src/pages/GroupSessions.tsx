
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterBar from "@/components/FilterBar";

// Mock group sessions data
const mockSessions = [
  {
    id: "1",
    title: "Introduction to Product Management",
    mentor: {
      name: "John Doe",
      avatar: "/placeholder.svg"
    },
    date: "2025-04-15T10:00:00",
    duration: 60,
    price: 999,
    category: "Product Management",
    level: "Beginner",
    spots: {
      total: 10,
      filled: 7
    }
  },
  {
    id: "2",
    title: "Advanced Frontend Development",
    mentor: {
      name: "Jane Smith",
      avatar: "/placeholder.svg"
    },
    date: "2025-04-20T15:00:00",
    duration: 120,
    price: 1499,
    category: "Software Development",
    level: "Advanced",
    spots: {
      total: 8,
      filled: 2
    }
  },
  {
    id: "3",
    title: "Leadership Skills Workshop",
    mentor: {
      name: "Mike Johnson",
      avatar: "/placeholder.svg"
    },
    date: "2025-04-25T09:00:00",
    duration: 90,
    price: 1299,
    category: "Leadership",
    level: "Intermediate",
    spots: {
      total: 12,
      filled: 8
    }
  }
];

const GroupSessions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    switch (filterName) {
      case "category":
        setCategoryFilters(values);
        break;
      case "level":
        setLevelFilters(values);
        break;
      case "price":
        setPriceFilters(values);
        break;
      default:
        break;
    }
  };
  
  // Filter sessions based on search and filters
  const filteredSessions = mockSessions.filter(session => {
    // Search filter
    const matchesSearch = !searchQuery || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilters.length === 0 || 
      categoryFilters.includes(session.category);
    
    // Level filter
    const matchesLevel = levelFilters.length === 0 || 
      levelFilters.includes(session.level);
    
    // Price filter
    let matchesPrice = true;
    if (priceFilters.length > 0) {
      matchesPrice = false;
      for (const priceRange of priceFilters) {
        if (priceRange === "0-500" && session.price <= 500) {
          matchesPrice = true;
          break;
        } else if (priceRange === "500-1000" && session.price > 500 && session.price <= 1000) {
          matchesPrice = true;
          break;
        } else if (priceRange === "1000-2000" && session.price > 1000 && session.price <= 2000) {
          matchesPrice = true;
          break;
        } else if (priceRange === "2000+" && session.price > 2000) {
          matchesPrice = true;
          break;
        }
      }
    }
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });
  
  const upcomingSessions = filteredSessions.filter(session => 
    new Date(session.date) > new Date()
  );
  
  const pastSessions = filteredSessions.filter(session => 
    new Date(session.date) <= new Date()
  );
  
  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Group Sessions</h1>
      <p className="text-muted-foreground mb-8">Learn together with other mentees in scheduled group sessions.</p>
      
      <FilterBar 
        onSearch={handleSearch}
        onIndustryChange={(industry) => {
          if (industry) {
            handleFilterChange("category", [industry]);
          } else {
            handleFilterChange("category", []);
          }
        }}
        className="mb-6"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-slate-50">
              <p className="text-lg font-medium">No upcoming sessions found</p>
              <p className="text-muted-foreground mt-1">Check back later or adjust your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map(session => (
                <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img src={session.mentor.avatar} alt={session.mentor.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">with {session.mentor.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {session.category}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">
                          {session.level}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mb-4 text-sm">
                        <span>
                          {new Date(session.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span>
                          {new Date(session.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </span>
                        <span>{session.duration} min</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <p className="text-xl font-bold">₹{session.price}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.spots.filled}/{session.spots.total} spots filled
                          </p>
                        </div>
                        <Button>Book Session</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastSessions.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-slate-50">
              <p className="text-lg font-medium">No past sessions found</p>
              <p className="text-muted-foreground mt-1">You haven't attended any group sessions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastSessions.map(session => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img src={session.mentor.avatar} alt={session.mentor.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">with {session.mentor.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {session.category}
                        </span>
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">
                          {session.level}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mb-4 text-sm">
                        <span>
                          {new Date(session.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span>
                          {new Date(session.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </span>
                        <span>{session.duration} min</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-xl font-bold">₹{session.price}</p>
                        <Button variant="outline">View Recording</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupSessions;
