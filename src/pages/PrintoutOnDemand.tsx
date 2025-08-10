import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Upload, Printer, TruckIcon, DollarSign, Download, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PrintoutOnDemand = () => {
  console.log('PrintoutOnDemand component is rendering');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  
  // Student form state
  const [formData, setFormData] = useState({
    studentName: '',
    studentContact: '',
    copies: 1,
    printType: 'black_white',
    paperSize: 'A4',
    bindingOption: '',
    deliveryLocation: '',
    deliveryTime: '',
    additionalNotes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper state
  const [helperData, setHelperData] = useState({
    name: '',
    contact: '',
    email: ''
  });
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [helperStats, setHelperStats] = useState({ totalJobs: 0, totalEarnings: 0 });
  const [helperId, setHelperId] = useState<string | null>(null);

  // Load available jobs for helpers
  const loadAvailableJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAvailableJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'helper') {
      loadAvailableJobs();
    }
  }, [activeTab]);

  const calculateCosts = () => {
    if (!pageCount || !formData.copies) return { printing: 0, service: 0, helper: 0, total: 0 };
    
    const totalPages = pageCount * formData.copies;
    
    if (formData.printType === 'black_white') {
      const printing = totalPages * 5;
      const service = totalPages * 5;
      const helper = totalPages * 5;
      return { printing, service, helper, total: printing + service + helper };
    } else {
      const printing = totalPages * 10;
      const service = totalPages * 8;
      const helper = totalPages * 7;
      return { printing, service, helper, total: printing + service + helper };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      
      setSelectedFile(file);
      // Simulate page count calculation
      if (file.type === 'application/pdf') {
        setPageCount(Math.floor(Math.random() * 10) + 1);
      } else {
        setPageCount(1);
      }
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to print');
      return;
    }

    setIsSubmitting(true);
    try {
      const costs = calculateCosts();
      
      const jobData = {
        file_name: selectedFile.name,
        file_url: 'temp-url', // In real app, upload to storage first
        file_size: selectedFile.size,
        page_count: pageCount,
        copies: formData.copies,
        print_type: formData.printType,
        paper_size: formData.paperSize,
        binding_option: formData.bindingOption,
        delivery_location: formData.deliveryLocation,
        delivery_time: formData.deliveryTime,
        additional_notes: formData.additionalNotes,
        student_name: formData.studentName,
        student_contact: formData.studentContact,
        total_cost: costs.total,
        printing_cost: costs.printing,
        service_fee: costs.service,
        helper_fee: costs.helper
      };

      const { error } = await supabase.from('print_jobs').insert([jobData]);
      
      if (error) throw error;
      
      toast.success('🎉 Print job submitted! You\'ll be notified when a helper accepts it.');
      
      // Reset form
      setFormData({
        studentName: '',
        studentContact: '',
        copies: 1,
        printType: 'black_white',
        paperSize: 'A4',
        bindingOption: '',
        deliveryLocation: '',
        deliveryTime: '',
        additionalNotes: ''
      });
      setSelectedFile(null);
      setPageCount(0);
      
    } catch (error) {
      toast.error('Failed to submit print job. Please try again.');
      console.error('Error submitting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelperSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('print_helpers')
        .insert([helperData])
        .select()
        .single();
      
      if (error) throw error;
      
      setHelperId(data.id);
      toast.success('🎉 Welcome! You can now accept print jobs.');
      
    } catch (error) {
      toast.error('Failed to sign up as helper. Please try again.');
      console.error('Error signing up:', error);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    if (!helperId) {
      toast.error('Please sign up as a helper first');
      return;
    }

    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'accepted', 
          helper_id: helperId,
          accepted_at: new Date().toISOString(),
          secure_download_token: crypto.randomUUID(),
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', jobId);
      
      if (error) throw error;
      
      toast.success('Job accepted! Download link generated.');
      loadAvailableJobs();
      
    } catch (error) {
      toast.error('Failed to accept job. Please try again.');
      console.error('Error accepting job:', error);
    }
  };

  const costs = calculateCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/20 via-background to-campus-purple/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glassmorphism border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-campus-blue hover:text-campus-blue/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-campus-blue mb-6 animate-fade-in">
            🖨️ Printouts on Demand
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Too lazy to go out? Send a PDF, get it printed & delivered!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Request a Print
              </TabsTrigger>
              <TabsTrigger value="helper" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Help & Earn
              </TabsTrigger>
            </TabsList>

            {/* Student Tab */}
            <TabsContent value="student" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Order Form */}
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="text-campus-blue">Order Details</CardTitle>
                    <CardDescription>Fill in your print requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleStudentSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentName">Full Name</Label>
                          <Input
                            id="studentName"
                            required
                            value={formData.studentName}
                            onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentContact">Contact Number</Label>
                          <Input
                            id="studentContact"
                            type="tel"
                            required
                            value={formData.studentContact}
                            onChange={(e) => setFormData({...formData, studentContact: e.target.value})}
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="file">Upload File (PDF, JPG, PNG - Max 20MB)</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                          required
                        />
                        {selectedFile && (
                          <div className="mt-2 p-3 bg-campus-blue/10 rounded-lg">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Pages: {pageCount} | Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="copies">Number of Copies</Label>
                          <Input
                            id="copies"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.copies}
                            onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Print Type</Label>
                          <Select value={formData.printType} onValueChange={(value) => setFormData({...formData, printType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="black_white">Black & White (₹15/page)</SelectItem>
                              <SelectItem value="color">Color (₹25/page)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Paper Size</Label>
                          <Select value={formData.paperSize} onValueChange={(value) => setFormData({...formData, paperSize: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bindingOption">Binding Option (Optional)</Label>
                          <Input
                            id="bindingOption"
                            value={formData.bindingOption}
                            onChange={(e) => setFormData({...formData, bindingOption: e.target.value})}
                            placeholder="e.g., Spiral binding"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryLocation">Delivery Location</Label>
                          <Input
                            id="deliveryLocation"
                            required
                            value={formData.deliveryLocation}
                            onChange={(e) => setFormData({...formData, deliveryLocation: e.target.value})}
                            placeholder="e.g., Hostel 1, Room 205"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryTime">Preferred Delivery Time</Label>
                          <Input
                            id="deliveryTime"
                            value={formData.deliveryTime}
                            onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                            placeholder="e.g., After 6 PM"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                          placeholder="Any special instructions..."
                          rows={3}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full py-6 text-lg"
                        disabled={isSubmitting || !selectedFile}
                      >
                        {isSubmitting ? 'Submitting...' : 'Pay & Confirm Order 💳'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <div className="space-y-6">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="text-campus-blue">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedFile ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>File:</span>
                            <span className="font-medium">{selectedFile.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pages:</span>
                            <span className="font-medium">{pageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Copies:</span>
                            <span className="font-medium">{formData.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Pages:</span>
                            <span className="font-medium">{pageCount * formData.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Print Type:</span>
                            <span className="font-medium">
                              {formData.printType === 'black_white' ? 'Black & White' : 'Color'}
                            </span>
                          </div>
                          
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Printing Cost:</span>
                              <span>₹{costs.printing}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>KIIT Saathi Fee:</span>
                              <span>₹{costs.service}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Helper Fee:</span>
                              <span>₹{costs.helper}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                              <span>Total:</span>
                              <span className="text-campus-blue">₹{costs.total}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Upload a file to see pricing
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 text-campus-blue">How It Works</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Upload className="w-4 h-4 text-campus-blue" />
                          <span>Upload your file & fill details</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Printer className="w-4 h-4 text-campus-orange" />
                          <span>Helper prints your document</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <TruckIcon className="w-4 h-4 text-kiit-green" />
                          <span>Get it delivered to your location</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Helper Tab */}
            <TabsContent value="helper" className="space-y-8">
              {!helperId ? (
                <Card className="glassmorphism max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="text-campus-blue">Become a Print Helper</CardTitle>
                    <CardDescription>Sign up to start earning money by helping students with printouts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleHelperSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="helperName">Full Name</Label>
                        <Input
                          id="helperName"
                          required
                          value={helperData.name}
                          onChange={(e) => setHelperData({...helperData, name: e.target.value})}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="helperContact">Contact Number</Label>
                        <Input
                          id="helperContact"
                          type="tel"
                          required
                          value={helperData.contact}
                          onChange={(e) => setHelperData({...helperData, contact: e.target.value})}
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="helperEmail">Email (Optional)</Label>
                        <Input
                          id="helperEmail"
                          type="email"
                          value={helperData.email}
                          onChange={(e) => setHelperData({...helperData, email: e.target.value})}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Sign Up as Helper
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Helper Stats */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="glassmorphism">
                      <CardContent className="p-6 text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-kiit-green" />
                        <p className="text-2xl font-bold text-kiit-green">₹{helperStats.totalEarnings}</p>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                      </CardContent>
                    </Card>
                    <Card className="glassmorphism">
                      <CardContent className="p-6 text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-campus-blue" />
                        <p className="text-2xl font-bold text-campus-blue">{helperStats.totalJobs}</p>
                        <p className="text-sm text-muted-foreground">Jobs Completed</p>
                      </CardContent>
                    </Card>
                    <Card className="glassmorphism">
                      <CardContent className="p-6 text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-campus-orange" />
                        <p className="text-2xl font-bold text-campus-orange">{availableJobs.length}</p>
                        <p className="text-sm text-muted-foreground">Available Jobs</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Available Jobs */}
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="text-campus-blue">Available Print Jobs</CardTitle>
                      <CardDescription>Accept jobs to start earning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {availableJobs.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>File Name</TableHead>
                              <TableHead>Pages</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Your Earning</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableJobs.map((job) => (
                              <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.file_name}</TableCell>
                                <TableCell>{job.page_count * job.copies}</TableCell>
                                <TableCell>
                                  <Badge variant={job.print_type === 'color' ? 'default' : 'secondary'}>
                                    {job.print_type === 'black_white' ? 'B&W' : 'Color'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{job.delivery_location}</TableCell>
                                <TableCell className="font-bold text-kiit-green">₹{job.helper_fee}</TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptJob(job.id)}
                                    className="bg-kiit-green hover:bg-kiit-green/90"
                                  >
                                    Accept
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No jobs available right now. Check back later!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default PrintoutOnDemand;