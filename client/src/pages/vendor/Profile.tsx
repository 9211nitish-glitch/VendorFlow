import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { updateProfileSchema, type UpdateProfileRequest } from '@shared/schema';
import { 
  User, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CreditCard,
  Building2,
  Smartphone
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  referralCode: string;
  profilePhoto?: string;
  bio?: string;
  phone?: string;
  walletBalance?: number;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankName?: string;
  upiId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ['/api/user/profile'],
  });

  const form = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.user.name || '',
      bio: profile?.user.bio || '',
      phone: profile?.user.phone || '',
      bankAccountName: profile?.user.bankAccountName || '',
      bankAccountNumber: profile?.user.bankAccountNumber || '',
      bankIfscCode: profile?.user.bankIfscCode || '',
      bankName: profile?.user.bankName || '',
      upiId: profile?.user.upiId || '',
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile?.user) {
      form.reset({
        name: profile.user.name || '',
        bio: profile.user.bio || '',
        phone: profile.user.phone || '',
        bankAccountName: profile.user.bankAccountName || '',
        bankAccountNumber: profile.user.bankAccountNumber || '',
        bankIfscCode: profile.user.bankIfscCode || '',
        bankName: profile.user.bankName || '',
        upiId: profile.user.upiId || '',
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => 
      apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      return fetch('/api/user/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
      setIsUploadingPhoto(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
      setIsUploadingPhoto(false);
    },
  });

  const onSubmit = (data: UpdateProfileRequest) => {
    updateProfileMutation.mutate(data);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setIsUploadingPhoto(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = profile?.user;
  if (!user) return null;

  const hasBankDetails = user.bankAccountNumber && user.bankIfscCode;
  const hasUPIDetails = user.upiId;

  return (
    <div className="p-6 space-y-6" data-testid="profile-page">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your profile details and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={user.profilePhoto} 
                  alt={user.name}
                  data-testid="profile-avatar"
                />
                <AvatarFallback data-testid="profile-initials">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                </div>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-photo-upload"
                />
              </Label>
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs">Uploading...</div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-semibold" data-testid="profile-name">{user.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" data-testid="profile-role">
                  {user.role}
                </Badge>
                <Badge 
                  variant={user.status === 'active' ? 'default' : 'destructive'}
                  data-testid="profile-status"
                >
                  {user.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Referral Code: <span className="font-mono" data-testid="referral-code">{user.referralCode}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Wallet Balance: <span className="font-semibold text-green-600" data-testid="wallet-balance">
                  ₹{(user.walletBalance || 0).toFixed(2)}
                </span>
              </p>
            </div>

            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              data-testid="button-edit-profile"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  disabled={!isEditing}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register('phone')}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  data-testid="input-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...form.register('bio')}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
                data-testid="textarea-bio"
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Banking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Details
          </CardTitle>
          <CardDescription>
            Add your bank details for withdrawals. Both bank details and UPI ID are required for withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Account Holder Name</Label>
                <Input
                  id="bankAccountName"
                  {...form.register('bankAccountName')}
                  disabled={!isEditing}
                  placeholder="As per bank records"
                  data-testid="input-bank-account-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  {...form.register('bankAccountNumber')}
                  disabled={!isEditing}
                  placeholder="Your bank account number"
                  data-testid="input-bank-account-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankIfscCode">IFSC Code</Label>
                <Input
                  id="bankIfscCode"
                  {...form.register('bankIfscCode')}
                  disabled={!isEditing}
                  placeholder="Bank IFSC code"
                  data-testid="input-bank-ifsc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...form.register('bankName')}
                  disabled={!isEditing}
                  placeholder="Your bank name"
                  data-testid="input-bank-name"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="upiId" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                UPI ID
              </Label>
              <Input
                id="upiId"
                {...form.register('upiId')}
                disabled={!isEditing}
                placeholder="yourname@paytm / phone@ybl"
                data-testid="input-upi-id"
              />
              <p className="text-sm text-muted-foreground">
                Enter your UPI ID for faster withdrawals
              </p>
            </div>

            {/* Banking Status */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">Bank Details:</span>
                <Badge variant={hasBankDetails ? "default" : "secondary"}>
                  {hasBankDetails ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm font-medium">UPI Details:</span>
                <Badge variant={hasUPIDetails ? "default" : "secondary"}>
                  {hasUPIDetails ? "Complete" : "Incomplete"}
                </Badge>
              </div>
            </div>

            {!hasBankDetails || !hasUPIDetails ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Both bank details and UPI ID are required for withdrawals. 
                  Please complete your profile to enable withdrawal functionality.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Your banking details are complete. You can now request withdrawals.
                </p>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-banking"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Banking Details'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}