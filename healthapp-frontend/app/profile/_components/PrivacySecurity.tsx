'use client';

import axios from 'axios';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PrivacySecurityProps {
  userId: number;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default function PrivacySecurity({ userId }: PrivacySecurityProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // If your backend expects currentPassword too, include it here
      await api.post(`/api/users/${userId}/password`, {
        currentPassword,
        newPassword: password,
      });
      alert('Password updated successfully!');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Error resetting password.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="m-auto w-full border pt-5">
      <FieldSet>
        <FieldLegend className="m-auto pb-5">Reset Password</FieldLegend>
        <FieldGroup className="grid grid-cols-1 gap-2">
          <Field>
            <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">New Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>
        </FieldGroup>
        <div className="pt-4">
          <Button type="submit">Update Password</Button>
        </div>
      </FieldSet>
    </form>
  );
}
