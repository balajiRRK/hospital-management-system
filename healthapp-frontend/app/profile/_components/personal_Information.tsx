'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/authProvider';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dtoToUi, Gender, uiToDto, UserProfile, UserProfileResponseDto } from '@/lib/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default function PersonalInformation() {
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle' | 'error'>('loading');

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setProfile(user);
      setStatus('idle');
    } else {
      setStatus('error');
    }
  }, [authLoading, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.') as ['address' | 'emergencyContact', string];
      setProfile((prev) =>
        prev
          ? ({
              ...prev,
              [parent]: { ...(prev[parent] as unknown as Record<string, unknown>), [child]: value },
            } as UserProfile)
          : prev,
      );
    } else {
      setProfile((prev) => (prev ? ({ ...prev, [name]: value } as UserProfile) : prev));
    }
  };

  const handleGenderChange = (value: string) => {
    if (!profile) return;
    setProfile({ ...profile, gender: value as Gender });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const updateRes = await api.put<UserProfileResponseDto>(
        '/api/users/me/profile',
        uiToDto(profile),
      );
      setProfile(dtoToUi(updateRes.data));

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post<{ profilePhotoUrl: string }>(
          '/api/users/me/profile-photo',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        setProfile((prev) =>
          prev ? { ...prev, profilePhotoUrl: uploadRes.data.profilePhotoUrl } : prev,
        );
        setSelectedFile(null);
      }

      void refreshAuth?.();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile.');
    }
  };

  if (status === 'loading' || authLoading) {
    return <div>Loading profile information...</div>;
  }
  if (status === 'error' || !profile) {
    return <div className="text-red-600">Failed to load profile.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="m-auto w-full border pt-5">
        <FieldSet>
          <FieldLegend className="m-auto pb-5">Profile</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>First Name</FieldLabel>
              <Input name="firstName" value={profile.firstName} onChange={handleChange} />
            </Field>
            <Field>
              <FieldLabel>Last Name</FieldLabel>
              <Input name="lastName" value={profile.lastName} onChange={handleChange} />
            </Field>
            <Field>
              <FieldLabel>Date of Birth</FieldLabel>
              <Input
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth || ''}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel>Gender</FieldLabel>
              <Select value={profile.gender || ''} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(Gender.MALE)}>Male</SelectItem>
                  <SelectItem value={String(Gender.FEMALE)}>Female</SelectItem>
                  <SelectItem value={String(Gender.NON_BINARY)}>Non-binary</SelectItem>
                  <SelectItem value={String(Gender.PREFER_NOT_TO_SAY)}>
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="col-span-2">
              <FieldLabel>Profile Photo</FieldLabel>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                name="phoneNumber"
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                name="email"
                type="email"
                value={profile.email || ''}
                onChange={handleChange}
              />
            </Field>
            <Field className="col-span-2">
              <FieldLabel>Street Address</FieldLabel>
              <Input
                name="address.streetAddress"
                value={profile.address?.streetAddress || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>City</FieldLabel>
              <Input
                name="address.city"
                value={profile.address?.city || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>State</FieldLabel>
              <Input
                name="address.state"
                value={profile.address?.state || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Postal Code</FieldLabel>
              <Input
                name="address.postalCode"
                value={profile.address?.postalCode || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Input
                name="address.country"
                value={profile.address?.country || ''}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Emergency Contact */}
        <FieldSet>
          <FieldLegend>Emergency Contact</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                name="emergencyContact.name"
                value={profile.emergencyContact?.name || ''}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                name="emergencyContact.phoneNumber"
                type="tel"
                value={profile.emergencyContact?.phoneNumber || ''}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="p-4">
          <Button type="submit">Save Profile</Button>
        </div>
      </div>
    </form>
  );
}
