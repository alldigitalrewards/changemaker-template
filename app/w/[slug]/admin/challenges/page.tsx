'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  Trophy, 
  MoreVertical,
  Edit,
  Archive,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  enrollments: { id: string }[];
  _count?: {
    enrollments: number;
  };
}

export default function AdminChallengesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Fetch challenges
  useEffect(() => {
    fetchChallenges();
  }, [slug]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/workspaces/${slug}/challenges`);
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
      const url = editingChallenge 
        ? `/api/workspaces/${slug}/challenges/${editingChallenge.id}`
        : `/api/workspaces/${slug}/challenges`;
      
      const method = editingChallenge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (editingChallenge) {
          // Update existing challenge in the list
          setChallenges(challenges.map(c => 
            c.id === editingChallenge.id ? data.challenge : c
          ));
        } else {
          // Add new challenge to the list
          setChallenges([data.challenge, ...challenges]);
        }
        
        setTitle('');
        setDescription('');
        setEditingChallenge(null);
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${editingChallenge ? 'update' : 'create'} challenge`);
      }
    } catch (error) {
      console.error(`Error ${editingChallenge ? 'updating' : 'creating'} challenge:`, error);
      alert(`Failed to ${editingChallenge ? 'update' : 'create'} challenge`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (challenge: Challenge) => {
    setTitle(challenge.title);
    setDescription(challenge.description);
    setEditingChallenge(challenge);
    setIsOpen(true);
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      const response = await fetch(`/api/workspaces/${slug}/challenges/${challengeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChallenges(challenges.filter(c => c.id !== challengeId));
      } else {
        alert('Failed to delete challenge');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge');
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) status = 'DRAFT';
    
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' },
      DRAFT: { variant: 'secondary' as const, icon: Clock, color: 'text-gray-600' },
      COMPLETED: { variant: 'outline' as const, icon: CheckCircle2, color: 'text-blue-600' },
      ARCHIVED: { variant: 'outline' as const, icon: Archive, color: 'text-gray-400' },
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Challenges</h1>
          <p className="text-muted-foreground mt-2">
            Manage challenges for workspace: <span className="font-mono text-coral-600">{slug}</span>
          </p>
        </div>
        
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-coral-500 hover:bg-coral-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground mb-4">No challenges yet. Create your first challenge to get started!</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-coral-500 hover:bg-coral-600">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
                      <DialogDescription>
                        {editingChallenge ? 'Update your challenge details.' : 'Add a new challenge to engage your participants.'}
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsOpen(false);
                          setEditingChallenge(null);
                          setTitle('');
                          setDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-coral-500 hover:bg-coral-600">
                        {isLoading ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(challenge.status)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(challenge)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(challenge.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {challenge.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{challenge._count?.enrollments || challenge.enrollments?.length || 0} enrolled</span>
                  </div>
                  {challenge.startDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(challenge.startDate), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Challenge Creation/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingChallenge(null);
          setTitle('');
          setDescription('');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
              <DialogDescription>
                {editingChallenge ? 'Update your challenge details.' : 'Add a new challenge to engage your participants.'}
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  setEditingChallenge(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-coral-500 hover:bg-coral-600">
                {isLoading ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Create Challenge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}