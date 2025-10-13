'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

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
import { Gender, UserProfile } from '@/lib/types';

interface PersonalInformationProps {
  userId: number;
}

const initialProfileState: UserProfile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '' as unknown as Gender,
  email: '',
  phoneNumber: '',
  address: { streetAddress: '', city: '', state: '', postalCode: '', country: '' },
  emergencyContact: { name: '', phoneNumber: '' },
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default function PersonalInformation({ userId }: PersonalInformationProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfileState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const response = await api.get<UserProfile>(`/api/users/${userId}`);
        const fetchedData = response.data;
        const newProfile: UserProfile = {
          ...initialProfileState,
          ...fetchedData,
          address: fetchedData.address
            ? { ...initialProfileState.address, ...fetchedData.address }
            : initialProfileState.address,
          emergencyContact: fetchedData.emergencyContact
            ? { ...initialProfileState.emergencyContact, ...fetchedData.emergencyContact }
            : initialProfileState.emergencyContact,
        };
        setProfile(newProfile);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.') as [keyof UserProfile, string];
      if (typeof profile[parent] === 'object' && profile[parent] !== null) {
        setProfile((prev) => ({
          ...prev,
          [parent]: { ...(prev[parent] as object), [child]: value },
        }));
      }
    } else {
      setProfile((prev) => ({ ...prev, [name as keyof UserProfile]: value as never }));
    }
  };

  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value as Gender }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${userId}/profile`, profile, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/api/users/${userId}/profile-photo`, formData);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Error updating profile.');
    }
  };

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
                value={profile.dateOfBirth}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Gender</FieldLabel>
              <Select value={profile.gender || undefined} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                  <SelectItem value={Gender.NON_BINARY}>Non-binary</SelectItem>
                  <SelectItem value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</SelectItem>
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
                value={profile.phoneNumber}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input name="email" type="email" value={profile.email} onChange={handleChange} />
            </Field>
            <Field className="col-span-2">
              <FieldLabel>Street Address</FieldLabel>
              <Input
                name="address.streetAddress"
                value={profile.address.streetAddress}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>City</FieldLabel>
              <Input name="address.city" value={profile.address.city} onChange={handleChange} />
            </Field>
            <Field>
              <FieldLabel>State</FieldLabel>
              <Input name="address.state" value={profile.address.state} onChange={handleChange} />
            </Field>
            <Field>
              <FieldLabel>Postal Code</FieldLabel>
              <Input
                name="address.postalCode"
                value={profile.address.postalCode}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Input
                name="address.country"
                value={profile.address.country}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Emergency Contact</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                name="emergencyContact.name"
                value={profile.emergencyContact.name}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                name="emergencyContact.phoneNumber"
                type="tel"
                value={profile.emergencyContact.phoneNumber}
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
