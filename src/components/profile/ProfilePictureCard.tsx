
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0 || !userId) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Upload the file to supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setCurrentAvatarUrl(data.publicUrl);
      await updateProfile({ avatar_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="md:col-span-4">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="w-32 h-32">
          <AvatarImage src={currentAvatarUrl || undefined} alt={firstName || "User"} />
          <AvatarFallback>
            {firstName && lastName 
              ? `${firstName[0]}${lastName[0]}`
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
              {uploading ? 'Uploading...' : 'Upload New Picture'}
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
          <p className="text-xs text-muted-foreground">
            Supported formats: JPEG, PNG. Max size: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureCard;
