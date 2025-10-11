'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/lib/types';
import { updateUserDetails } from '@/lib/actions/user-actions';
import { refreshUserSession } from '@/lib/actions/session-actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
    reset({
      name: user.name || '',
      bio: user.bio || '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty && !selectedImage) {
      toast({
        title: 'No changes detected',
        description: 'Please make some changes before updating',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        name: data.name,
        bio: data.bio,
        ...(selectedImage && { avatar: selectedImage }),
      };

      const result = await updateUserDetails(user.id, updateData);

      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message || 'Profile updated successfully',
          variant: 'default',
        });

        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);

        // Refresh user session with updated data
        await refreshUserSession(user.id);

        // Wait a bit for toast to show, then refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayAvatar = imagePreview || user.avatarUrl;

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-6 md:mb-8">
        Your Profile
      </h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={displayAvatar} alt={user.name} />
                <AvatarFallback>
                  <UserIcon className="h-10 w-10 md:h-12 md:w-12" />
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="text-center md:text-left">
              <CardTitle className="text-xl md:text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground capitalize">{user.role}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={!isEditing || isLoading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                disabled={!isEditing || isLoading}
                placeholder="Tell us about yourself..."
                className={`min-h-[100px] ${errors.bio ? 'border-destructive' : ''}`}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-3 mt-6">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEdit}
                  className="w-full md:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
