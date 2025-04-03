
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { BadgeIndianRupee, Briefcase, Building, Layers, PenLine, Save } from 'lucide-react';
import { MultiSelect } from '../ui/multi-select';

interface MentorProfileFormProps {
  onProfileUpdated?: () => void;
}

interface MentorProfileFormData {
  job_title: string;
  company: string;
  industry: string;
  expertise: string[];
  hourly_rate: number;
  years_experience: number;
  bio: string;
}

const expertiseOptions = [
  'Career Guidance', 'Resume Review', 'Interview Preparation', 'Leadership', 
  'Public Speaking', 'Technical Skills', 'Product Management', 'UX Design',
  'Marketing', 'Sales', 'Business Strategy', 'Entrepreneurship', 'Finance',
  'Data Science', 'Software Development', 'Web Development', 'Mobile Development',
  'DevOps', 'Cloud Computing', 'Machine Learning', 'Blockchain', 'Cybersecurity'
];

const industryOptions = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 
  'Manufacturing', 'Media & Entertainment', 'Retail', 'Travel & Hospitality',
  'Real Estate', 'Consulting', 'Automotive', 'Energy', 'Telecommunications'
];

const MentorProfileForm: React.FC<MentorProfileFormProps> = ({ onProfileUpdated }) => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<MentorProfileFormData>();
  
  const selectedExpertise = watch('expertise', []);
  
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setMentorProfile(data);
        
        // Set form values
        setValue('job_title', data.job_title || '');
        setValue('company', data.company || '');
        setValue('industry', data.industry || '');
        setValue('expertise', data.expertise || []);
        setValue('hourly_rate', data.hourly_rate || 500);
        setValue('years_experience', data.years_experience || 1);
        
        // Fetch bio from profile table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData) {
          setValue('bio', profileData.bio || '');
        }
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load your mentor profile information.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && profile?.user_type === 'mentor') {
      fetchMentorProfile();
    }
  }, [user, profile, setValue]);
  
  const onSubmit = async (data: MentorProfileFormData) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update mentor table
      const { error: mentorError } = await supabase
        .from('mentors')
        .update({
          job_title: data.job_title,
          company: data.company,
          industry: data.industry,
          expertise: data.expertise,
          hourly_rate: data.hourly_rate,
          years_experience: data.years_experience
        })
        .eq('id', user.id);
        
      if (mentorError) throw mentorError;
      
      // Update bio in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          bio: data.bio
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Profile updated",
        description: "Your mentor profile has been successfully updated.",
      });
      
      if (updateProfile) {
        updateProfile({ ...profile, bio: data.bio });
      }
      
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      toast({
        title: "Error updating profile",
        description: "Could not update your mentor profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading profile information...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <PenLine className="h-5 w-5 mr-2 text-primary" />
          Mentor Profile Information
        </CardTitle>
        <CardDescription>
          Complete your profile to attract more mentees. All fields are required for your profile to be visible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="job_title" className="flex items-center">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Job Title
              </Label>
              <Input
                id="job_title"
                placeholder="Senior Software Engineer"
                {...register('job_title', { required: "Job title is required" })}
                className={errors.job_title ? "border-red-300" : ""}
              />
              {errors.job_title && (
                <p className="text-xs text-red-500">{errors.job_title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center">
                <Building className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Company
              </Label>
              <Input
                id="company"
                placeholder="Acme Corp"
                {...register('company', { required: "Company is required" })}
                className={errors.company ? "border-red-300" : ""}
              />
              {errors.company && (
                <p className="text-xs text-red-500">{errors.company.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center">
                <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Industry
              </Label>
              <select
                id="industry"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('industry', { required: "Industry is required" })}
              >
                <option value="">Select an industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-xs text-red-500">{errors.industry.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expertise" className="flex items-center">
                <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Expertise (Select up to 5)
              </Label>
              <MultiSelect
                options={expertiseOptions.map(exp => ({ label: exp, value: exp }))}
                selected={selectedExpertise}
                onChange={(selected) => {
                  // Limit to 5 selections
                  if (selected.length <= 5) {
                    setValue('expertise', selected, { shouldDirty: true });
                  } else {
                    toast({
                      title: "Maximum 5 expertise",
                      description: "You can select up to 5 areas of expertise.",
                      variant: "destructive"
                    });
                  }
                }}
                placeholder="Select your areas of expertise"
              />
              {errors.expertise && (
                <p className="text-xs text-red-500">{errors.expertise.message}</p>
              )}
              {selectedExpertise.length === 0 && (
                <p className="text-xs text-amber-500">Please select at least one area of expertise</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="flex items-center">
                <BadgeIndianRupee className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Hourly Rate (₹)
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="100"
                placeholder="1000"
                {...register('hourly_rate', { 
                  required: "Hourly rate is required",
                  min: { value: 0, message: "Rate cannot be negative" },
                  valueAsNumber: true
                })}
                className={errors.hourly_rate ? "border-red-300" : ""}
              />
              {errors.hourly_rate && (
                <p className="text-xs text-red-500">{errors.hourly_rate.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is the amount you will charge per hour of mentorship.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="years_experience" className="flex items-center">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Years of Experience
              </Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                step="1"
                placeholder="5"
                {...register('years_experience', { 
                  required: "Years of experience is required",
                  min: { value: 0, message: "Experience cannot be negative" },
                  valueAsNumber: true
                })}
                className={errors.years_experience ? "border-red-300" : ""}
              />
              {errors.years_experience && (
                <p className="text-xs text-red-500">{errors.years_experience.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center">
              <PenLine className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell mentees about your experience, skills, and mentoring style..."
              {...register('bio', { 
                required: "Bio is required",
                minLength: { value: 50, message: "Bio should be at least 50 characters" }
              })}
              className={`min-h-[150px] ${errors.bio ? "border-red-300" : ""}`}
            />
            {errors.bio && (
              <p className="text-xs text-red-500">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be displayed on your public profile. Minimum 50 characters.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: isDirty ? 1.02 : 1 }}
            whileTap={{ scale: isDirty ? 0.98 : 1 }}
          >
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSaving || !isDirty || selectedExpertise.length === 0}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MentorProfileForm;
