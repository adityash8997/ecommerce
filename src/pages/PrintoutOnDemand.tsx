import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, TruckIcon, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HelperDashboard } from '@/components/HelperDashboard';
import { PrintJobCard } from '@/components/PrintJobCard';
import { usePrintJobManager } from '@/hooks/usePrintJobManager';
import { useAuth } from '@/hooks/useAuth';

const PrintoutOnDemand = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, loading, createPrintJob, loadMyJobs } = usePrintJobManager();
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
    deliveryType: 'pickup',
    pickupLocation: '',
    additionalNotes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's jobs when on dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && user) {
      loadMyJobs();
    }
  }, [activeTab, user, loadMyJobs]);

  const calculateCosts = () => {
    if (!pageCount || !formData.copies) return { printing: 0, service: 0, helper: 0, total: 0 };
    
    const totalPages = pageCount * formData.copies;
    const extraDeliveryFee = formData.deliveryType === 'delivery' ? 50 : 0;
    
    if (formData.printType === 'black_white') {
      const printing = totalPages * 5;
      const service = totalPages * 5;
      const helper = totalPages * 5;
      return { 
        printing, 
        service, 
        helper, 
        total: printing + service + helper + extraDeliveryFee,
        delivery: extraDeliveryFee
      };
    } else {
      const printing = totalPages * 10;
      const service = totalPages * 8;
      const helper = totalPages * 7;
      return { 
        printing, 
        service, 
        helper, 
        total: printing + service + helper + extraDeliveryFee,
        delivery: extraDeliveryFee
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOCX, JPG, and PNG files are allowed');
        return;
      }
      
      setSelectedFile(file);
      // Estimate page count based on file type
      if (file.type === 'application/pdf') {
        setPageCount(Math.floor(Math.random() * 10) + 1); // In real app, use PDF parser
      } else if (file.type.includes('word')) {
        setPageCount(Math.floor(file.size / 50000) + 1); // Rough estimate
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

    if (!user) {
      toast.error('Please sign in to submit a print job');
      return;
    }

    setIsSubmitting(true);
    try {
      const costs = calculateCosts();
      const formWithPageCount = { ...formData, pageCount };
      
      const success = await createPrintJob(formWithPageCount, selectedFile, costs);
      
      if (success) {
        // Reset form
        setFormData({
          studentName: '',
          studentContact: '',
          copies: 1,
          printType: 'black_white',
          paperSize: 'A4',
          bindingOption: '',
          deliveryLocation: '',
          deliveryType: 'pickup',
          pickupLocation: '',
          additionalNotes: ''
        });
        setSelectedFile(null);
        setPageCount(0);
      }
      
    } catch (error) {
      console.error('Error submitting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This logic is now handled by HelperDashboard component

  const costs = calculateCosts();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-campus-blue/20 via-background to-campus-purple/20">
        <Navbar />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-campus-blue mb-6 animate-fade-in">
              🖨️ Printouts on Demand
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
              Secure, fast, and convenient printing service
            </p>
            
            {/* Privacy Notice */}
            <Card className="glassmorphism max-w-2xl mx-auto mb-8">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-yellow-700">
                  <Shield className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Privacy & Security Notice</p>
                    <p className="text-sm">
                      Please do not upload confidential documents. Files are encrypted and only accessible 
                      to assigned helpers. We are not responsible for any data leaks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Request Print
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  My Orders
                </TabsTrigger>
                <TabsTrigger value="helper" className="flex items-center gap-2">
                  <TruckIcon className="w-4 h-4" />
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
                        <Label htmlFor="file">Upload File (PDF, DOCX, JPG, PNG - Max 20MB)</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.docx,.jpg,.jpeg,.png"
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

                      <div>
                        <Label>Delivery Type</Label>
                        <Select value={formData.deliveryType} onValueChange={(value) => setFormData({...formData, deliveryType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pickup">Pickup from Helper (Free)</SelectItem>
                            <SelectItem value="delivery">Delivery to Location (+₹50)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.deliveryType === 'delivery' ? (
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
                      ) : (
                        <div>
                          <Label htmlFor="pickupLocation">Preferred Pickup Location (Optional)</Label>
                          <Input
                            id="pickupLocation"
                            value={formData.pickupLocation}
                            onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                            placeholder="Helper will specify pickup location"
                          />
                        </div>
                      )}

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
                        {isSubmitting ? 'Submitting...' : 'Submit Print Job'}
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
                          <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span className="font-medium">
                              {formData.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
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
      <Footer />
    </div>
  );
};

export default PrintoutOnDemand;