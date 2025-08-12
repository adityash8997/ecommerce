import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PrintJobCard } from './PrintJobCard';
import { usePrintJobManager } from '@/hooks/usePrintJobManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DollarSign, Briefcase, Clock, TrendingUp } from 'lucide-react';

interface HelperStats {
  totalJobs: number;
  totalEarnings: number;
  activeJobs: number;
  completedJobs: number;
}

export function HelperDashboard() {
  const { user } = useAuth();
  const { jobs, loading, loadAvailableJobs, loadHelperJobs, acceptJob, updateJobStatus, getSecureDownloadUrl } = usePrintJobManager();
  const [activeTab, setActiveTab] = useState('available');
  const [helperProfile, setHelperProfile] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [stats, setStats] = useState<HelperStats>({
    totalJobs: 0,
    totalEarnings: 0,
    activeJobs: 0,
    completedJobs: 0
  });

  const [signupData, setSignupData] = useState({
    name: '',
    contact: '',
    location: ''
  });

  // Check if user is already a registered helper
  useEffect(() => {
    const checkHelperStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('print_helpers')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setHelperProfile(data);
          setIsRegistered(true);
          loadHelperStats(data.id);
        }
      } catch (error) {
        console.error('Error checking helper status:', error);
      }
    };

    checkHelperStatus();
  }, [user]);

  const loadHelperStats = async (helperId: string) => {
    try {
      const { data: jobs, error } = await supabase
        .from('print_jobs')
        .select('status, helper_fee')
        .eq('helper_id', helperId);

      if (error) throw error;

      const totalJobs = jobs.length;
      const completedJobs = jobs.filter(job => job.status === 'completed').length;
      const activeJobs = jobs.filter(job => ['accepted', 'printing', 'ready_for_pickup', 'delivered'].includes(job.status)).length;
      const totalEarnings = jobs
        .filter(job => job.status === 'completed')
        .reduce((sum, job) => sum + (parseFloat(job.helper_fee) || 0), 0);

      setStats({
        totalJobs,
        totalEarnings,
        activeJobs,
        completedJobs
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailableJobs();
    } else if (activeTab === 'my-jobs' && helperProfile) {
      loadHelperJobs(helperProfile.id);
    }
  }, [activeTab, helperProfile, loadAvailableJobs, loadHelperJobs]);

  const handleHelperSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to register as a helper');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('print_helpers')
        .insert([{
          name: signupData.name,
          contact: signupData.contact,
          email: user.email,
          location: signupData.location
        }])
        .select()
        .single();

      if (error) throw error;

      setHelperProfile(data);
      setIsRegistered(true);
      toast.success('🎉 Welcome! You can now accept print jobs.');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to register as helper');
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    if (!helperProfile) return;

    const success = await acceptJob(jobId, helperProfile.id);
    if (success) {
      loadAvailableJobs();
      if (activeTab === 'my-jobs') {
        loadHelperJobs(helperProfile.id);
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const success = await updateJobStatus(jobId, newStatus);
    if (success && helperProfile) {
      loadHelperJobs(helperProfile.id);
      loadHelperStats(helperProfile.id);
    }
  };

  const handleDownload = async (filePath: string) => {
    const url = await getSecureDownloadUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!user) {
    return (
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Helper Dashboard</CardTitle>
          <CardDescription>Please sign in to access the helper dashboard</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isRegistered) {
    return (
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Become a Print Helper</CardTitle>
          <CardDescription>
            Join our network of helpers and earn money by helping students with their printing needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHelperSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                type="tel"
                required
                value={signupData.contact}
                onChange={(e) => setSignupData({...signupData, contact: e.target.value})}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <Label htmlFor="location">Your Location/Hostel</Label>
              <Input
                id="location"
                required
                value={signupData.location}
                onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                placeholder="e.g., Hostel 3, Room 205"
              />
            </div>

            <Button type="submit" className="w-full">
              Register as Helper
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Jobs</TabsTrigger>
          <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="text-center py-2">
            <h3 className="text-lg font-semibold">Available Print Jobs</h3>
            <p className="text-muted-foreground">Accept jobs to start earning</p>
          </div>
          
          {jobs.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No available jobs at the moment</p>
                <Button 
                  variant="outline" 
                  onClick={loadAvailableJobs}
                  className="mt-4"
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <PrintJobCard
                  key={job.id}
                  job={job}
                  onAccept={handleAcceptJob}
                  isHelper={true}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-jobs" className="space-y-4">
          <div className="text-center py-2">
            <h3 className="text-lg font-semibold">My Accepted Jobs</h3>
            <p className="text-muted-foreground">Track and manage your accepted print jobs</p>
          </div>

          {jobs.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">You haven't accepted any jobs yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('available')}
                  className="mt-4"
                >
                  Browse Available Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <PrintJobCard
                  key={job.id}
                  job={job}
                  onStatusChange={handleStatusChange}
                  onDownload={handleDownload}
                  isHelper={true}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}