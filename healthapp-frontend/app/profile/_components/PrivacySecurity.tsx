'use client';
import axios from 'axios';
import React, { useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function PrivacySecurity() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${base}/api/users/me/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      alert('Password updated successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Error resetting password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="m-auto w-full border pt-5">
      <FieldSet>
        <FieldLegend className="m-auto pb-5">Reset Password</FieldLegend>
        <FieldGroup className="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
            <Input
              id="current-password"
              name="current"
              type="password"
              value={passwords.current}
              onChange={handleChange}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-password">New Password</FieldLabel>
            <Input
              id="new-password"
              name="newPass"
              type="password"
              value={passwords.newPass}
              onChange={handleChange}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              name="confirm"
              type="password"
              value={passwords.confirm}
              onChange={handleChange}
              required
            />
          </Field>
        </FieldGroup>
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
}
