'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
}

export default function AdminChallengesPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch challenges
  useEffect(() => {
    fetchChallenges();
  }, [params.slug]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/workspaces/${params.slug}/challenges`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${params.slug}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges([data.challenge, ...challenges]);
        setTitle('');
        setDescription('');
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Challenges</h1>
          <p className="text-muted-foreground mt-2">
            Manage challenges for workspace: <span className="font-mono text-coral-600">{params.slug}</span>
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-coral-500 hover:bg-coral-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
                <DialogDescription>
                  Add a new challenge to engage your participants.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter challenge title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what participants will do"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Challenge'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No challenges yet. Create your first challenge to get started!</p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {challenge.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}