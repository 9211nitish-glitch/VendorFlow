import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';

const CONTENT_CREATOR_TYPES = [
  { value: 'influencer', label: 'Social Media Influencer' },
  { value: 'blogger', label: 'Blogger/Writer' },
  { value: 'youtuber', label: 'YouTuber' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'artist', label: 'Digital Artist' },
  { value: 'musician', label: 'Musician/Audio Creator' },
  { value: 'podcaster', label: 'Podcaster' },
  { value: 'streamer', label: 'Live Streamer' },
  { value: 'educator', label: 'Educational Creator' },
  { value: 'reviewer', label: 'Product Reviewer' },
  { value: 'other', label: 'Other' }
];

export default function VendorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    contentCreatorType: '',
    socialLinks: {
      instagram: '',
      youtube: '',
      twitter: '',
      facebook: '',
      tiktok: '',
      website: ''
    },
    profilePhoto: null as string | null
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        contentCreatorType: profile.contentCreatorType || '',
        socialLinks: profile.socialLinks || {
          instagram: '',
          youtube: '',
          twitter: '',
          facebook: '',
          tiktok: '',
          website: ''
        },
        profilePhoto: profile.profilePhoto || null
      });
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data.data.url;
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1GB max)
    if (file.size > 1024 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 1GB",
        variant: "destructive",
      });
      return;
    }

    const photoUrl = await handlePhotoUpload(file);
    if (photoUrl) {
      setProfileData({ ...profileData, profilePhoto: photoUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        [platform]: value
      }
    });
  };

  if (isLoading) {
    return <Loading className="h-64" text="Loading profile..." />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your profile information and content creator settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative shrink-0">
                {profileData.profilePhoto ? (
                  <img
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-user text-gray-400 text-xl sm:text-2xl"></i>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <input
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profile-photo"
                  disabled={isUploading}
                />
                <label htmlFor="profile-photo">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer w-full sm:w-auto"
                    disabled={isUploading}
                    onClick={() => document.getElementById('profile-photo')?.click()}
                    data-testid="button-upload-photo"
                  >
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </label>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Any file type up to 1GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled
                  className="bg-gray-50"
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  data-testid="input-location"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="textarea-bio"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Creator Information */}
        <Card>
          <CardHeader>
            <CardTitle>Content Creator Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contentCreatorType">Content Creator Type</Label>
              <Select
                value={profileData.contentCreatorType}
                onValueChange={(value) => handleInputChange('contentCreatorType', value)}
              >
                <SelectTrigger data-testid="select-creator-type">
                  <SelectValue placeholder="Select your content creator type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_CREATOR_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={profileData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                  data-testid="input-instagram"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={profileData.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/channel/..."
                  data-testid="input-youtube"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                  data-testid="input-twitter"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={profileData.socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                  data-testid="input-facebook"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={profileData.socialLinks.tiktok}
                  onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@username"
                  data-testid="input-tiktok"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profileData.socialLinks.website}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  data-testid="input-website"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            data-testid="button-save-profile"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}