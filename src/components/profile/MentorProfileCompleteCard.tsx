
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BriefcaseIcon, 
  Building, 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  GraduationCap, 
  Loader2, 
  TagIcon, 
  Verified, 
  XCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

interface MentorProfileCompleteCardProps {
  userId: string;
  onProfileUpdate?: () => void;
}

interface MentorProfile {
  id: string;
  hourly_rate?: number;
  years_experience?: number;
  industry?: string;
  expertise?: string[];
  company?: string;
  job_title?: string;
}

const industries = [
  'Technology',
  'Finance',
  'Marketing',
  'Design',
  'Education',
  'Healthcare',
  'Consulting',
  'Human Resources',
  'Sales',
  'Business Strategy',
  'Data Science',
  'Legal',
  'Real Estate',
  'Non-profit',
  'Other'
];

const MentorProfileCompleteCard: React.FC<MentorProfileCompleteCardProps> = ({ userId, onProfileUpdate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Form fields
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(undefined);
  const [industry, setIndustry] = useState<string | undefined>(undefined);
  const [company, setCompany] = useState<string | undefined>(undefined);
  const [jobTitle, setJobTitle] = useState<string | undefined>(undefined);

  // Required fields tracking
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Fetch existing mentor profile
  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (mentorError && mentorError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which just means the mentor profile doesn't exist yet
          console.error('Error fetching mentor profile:', mentorError);
        }
        
        if (mentorData) {
          setMentorProfile(mentorData);
          setHourlyRate(mentorData.hourly_rate);
          setYearsExperience(mentorData.years_experience);
          setIndustry(mentorData.industry);
          setExpertiseTags(mentorData.expertise || []);
          setCompany(mentorData.company);
          setJobTitle(mentorData.job_title);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchMentorProfile();
    }
  }, [userId]);

  // Check for missing required fields
  useEffect(() => {
    const missing: string[] = [];
    
    if (!hourlyRate) missing.push('Hourly Rate');
    if (!yearsExperience) missing.push('Years of Experience');
    if (!industry) missing.push('Industry');
    if (expertiseTags.length === 0) missing.push('Areas of Expertise');
    if (!company) missing.push('Company');
    if (!jobTitle) missing.push('Job Title');
    
    setMissingFields(missing);
  }, [hourlyRate, yearsExperience, industry, expertiseTags, company, jobTitle]);

  const handleAddTag = () => {
    if (newTag.trim() && !expertiseTags.includes(newTag.trim())) {
      setExpertiseTags([...expertiseTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setExpertiseTags(expertiseTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveProfile = async () => {
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // If mentor profile exists, update it
      if (mentorProfile) {
        const { error } = await supabase
          .from('mentors')
          .update({
            hourly_rate: hourlyRate,
            years_experience: yearsExperience,
            industry: industry,
            expertise: expertiseTags,
            company: company,
            job_title: jobTitle
          })
          .eq('id', userId);
          
        if (error) throw error;
      } else {
        // Create new mentor profile
        const { error } = await supabase
          .from('mentors')
          .insert({
            id: userId,
            hourly_rate: hourlyRate,
            years_experience: yearsExperience,
            industry: industry,
            expertise: expertiseTags,
            company: company,
            job_title: jobTitle
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Profile saved",
        description: "Your mentor profile has been updated successfully.",
      });
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error('Error saving mentor profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message || "There was an error saving your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Mentor Profile</CardTitle>
          <CardDescription>Loading your mentor profile...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <GraduationCap className="h-6 w-6 text-primary" />
          Complete Your Mentor Profile
        </CardTitle>
        <CardDescription>
          Provide the necessary information to become a mentor and get listed in the mentors directory.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="hourlyRate" className="flex items-center gap-2 mb-2">
              Hourly Rate (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate || ''}
              onChange={(e) => setHourlyRate(Number(e.target.value) || undefined)}
              placeholder="e.g., 2000"
              className="bg-slate-50/50 transition-all focus:bg-white"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This is the amount you'll charge per hour of mentorship.
            </p>
          </div>
          
          <div>
            <Label htmlFor="yearsExperience" className="flex items-center gap-2 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </Label>
            <Input
              id="yearsExperience"
              type="number"
              value={yearsExperience || ''}
              onChange={(e) => setYearsExperience(Number(e.target.value) || undefined)}
              placeholder="e.g., 5"
              className="bg-slate-50/50 transition-all focus:bg-white"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company" className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4" /> Company <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              type="text"
              value={company || ''}
              onChange={(e) => setCompany(e.target.value || undefined)}
              placeholder="e.g., Google"
              className="bg-slate-50/50 transition-all focus:bg-white"
            />
          </div>
          
          <div>
            <Label htmlFor="jobTitle" className="flex items-center gap-2 mb-2">
              <BriefcaseIcon className="h-4 w-4" /> Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobTitle"
              type="text"
              value={jobTitle || ''}
              onChange={(e) => setJobTitle(e.target.value || undefined)}
              placeholder="e.g., Senior Product Manager"
              className="bg-slate-50/50 transition-all focus:bg-white"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="industry" className="flex items-center gap-2 mb-2">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={industry}
            onValueChange={setIndustry}
          >
            <SelectTrigger className="bg-slate-50/50 transition-all focus:bg-white">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <TagIcon className="h-4 w-4" /> Areas of Expertise <span className="text-red-500">*</span>
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {expertiseTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-gray-100 rounded-full p-1"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="flex">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add expertise (e.g., Data Analysis)"
              className="bg-slate-50/50 transition-all focus:bg-white rounded-r-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button"
              onClick={handleAddTag}
              className="rounded-l-none"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Add tags that represent your areas of expertise. Press Enter or click Add after each tag.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
        <div className="w-full">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Complete the following to become a mentor:
          </h4>
          
          <div className="space-y-2">
            {[
              { name: 'Hourly Rate', value: hourlyRate },
              { name: 'Years of Experience', value: yearsExperience },
              { name: 'Industry', value: industry },
              { name: 'Areas of Expertise', value: expertiseTags.length > 0 },
              { name: 'Company', value: company },
              { name: 'Job Title', value: jobTitle }
            ].map((field) => (
              <div 
                key={field.name} 
                className="flex items-center justify-between text-sm"
              >
                <span>{field.name}</span>
                {field.value ? (
                  <Verified className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end w-full">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving || missingFields.length > 0}
            className="w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MentorProfileCompleteCard;
