
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Camera, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfilePictureCardProps {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userId?: string;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const ProfilePictureCard: React.FC<ProfilePictureCardProps> = ({
  avatarUrl,
  firstName,
  lastName,
  userId,
  updateProfile,
}) => {
  const [uploading, setUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadSuccess(false);

      if (!event.target.files || event.target.files.length === 0 || !userId) {
        toast({
          title: "No file selected",
          description: "Please select an image file to upload.",
          variant: "destructive"
        });
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, GIF or WEBP image.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB.",
          variant: "destructive"
        });
        return;
      }

      // Upload the file to supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Add a cache-busting parameter to force refresh of the image
      const cacheBuster = `?t=${new Date().getTime()}`;
      const urlWithCache = `${data.publicUrl}${cacheBuster}`;

      setCurrentAvatarUrl(urlWithCache);
      await updateProfile({ avatar_url: data.publicUrl });
      setUploadSuccess(true);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully.",
      });
      
      // Reset success indicator after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your profile picture.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="md:col-span-4 border-2 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-6">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="h-5 w-5 text-primary" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative group">
            <Avatar className="w-36 h-36 border-4 border-white shadow-lg">
              <AvatarImage 
                src={currentAvatarUrl || undefined} 
                alt={firstName || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {firstName && lastName 
                  ? `${firstName[0]}${lastName[0]}`
                  : "U"}
              </AvatarFallback>
            </Avatar>
            
            {uploadSuccess && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1"
              >
                <Check className="h-5 w-5" />
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-3 w-full">
            <label htmlFor="avatar" className="w-full">
              <div className={`
                flex items-center justify-center gap-2 
                ${uploading ? 'bg-slate-300' : 'bg-primary'} 
                text-primary-foreground hover:bg-primary/90 
                px-4 py-3 rounded-md cursor-pointer transition-all
                w-full text-center
              `}>
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    {currentAvatarUrl ? 'Change Picture' : 'Upload Picture'}
                  </>
                )}
              </div>
              <input
                type="file"
                id="avatar"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Supported formats: JPEG, PNG, GIF. Max size: 5MB
            </p>
            {currentAvatarUrl && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                <Check className="h-4 w-4" />
                Profile picture uploaded
              </p>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureCard;
