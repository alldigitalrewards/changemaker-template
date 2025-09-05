'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

// Simplified schema for MVP
const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  points: z.number().min(50).max(1000),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface SimpleChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (challenge: any) => void;
  workspaceSlug: string;
}

export default function SimpleChallengeModal({
  isOpen,
  onClose,
  onSuccess,
  workspaceSlug
}: SimpleChallengeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      points: 100,
    },
  });

  const onSubmit = async (data: ChallengeFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: 'DRAFT',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      const result = await response.json();
      onSuccess(result);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Challenge creation error:', error);
      alert('Failed to create challenge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Challenge</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...form.register('title')}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter challenge title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...form.register('description')}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe what participants will do and achieve"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                {...form.register('startDate')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                {...form.register('endDate')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Points</label>
            <input
              type="number"
              {...form.register('points', { valueAsNumber: true })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="50"
              max="1000"
              placeholder="100"
            />
            {form.formState.errors.points && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.points.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}