import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Upload, 
  CheckCircle, 
  MapPin, 
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Phone,
  Mail,
  GraduationCap,
  Package
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const sellBookSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  email: z.string().email("Valid email is required"),
  bookTitles: z.string().min(1, "Book titles are required"),
  branch: z.string().min(1, "Branch is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  bookCondition: z.string().min(1, "Book condition is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms"
  })
});

const buyBookSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  bookSetNeeded: z.string().min(1, "Book set details are required")
});

type SellBookFormData = z.infer<typeof sellBookSchema>;
type BuyBookFormData = z.infer<typeof buyBookSchema>;

export default function BookBuyback() {
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const sellForm = useForm<SellBookFormData>({
    resolver: zodResolver(sellBookSchema)
  });

  const buyForm = useForm<BuyBookFormData>({
    resolver: zodResolver(buyBookSchema)
  });

  const handleSellSubmit = async (data: SellBookFormData) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-book-request', {
        body: {
          type: 'sell',
          ...data,
          photoUrls
        }
      });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Thanks! Our team will reach out within 24 hours. Meanwhile, start dreaming about how you'll spend your extra cash 😄"
      });
      
      sellForm.reset();
      setPhotoUrls([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuySubmit = async (data: BuyBookFormData) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-book-request', {
        body: {
          type: 'buy',
          ...data
        }
      });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "We've received your request and will contact you soon with available book sets!"
      });
      
      buyForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <BookOpen className="w-4 h-4" />
            Student-to-Student Book Exchange
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Give Your Books a 
            <span className="block">Second Life 📚💙</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            We'll buy your old semester books at a fair price — not by weight, but by value. 
            <span className="font-semibold text-kiit-green block mt-2">More cash for you, more savings for juniors.</span>
          </p>

          <div className="flex justify-center mb-12">
            <img src="/placeholder.svg" alt="Students exchanging books" className="w-96 h-64 object-contain" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center text-gradient mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-kiit-green to-campus-blue p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. List Your Books</h3>
                <p className="text-muted-foreground">Fill out a short form telling us what you have.</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-campus-blue to-campus-purple p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Get a Fair Price</h3>
                <p className="text-muted-foreground">We calculate based on condition & demand.</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center hover-lift">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-campus-purple to-campus-orange p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. We Pick Them Up</h3>
                <p className="text-muted-foreground">No extra hassle; we'll collect from your hostel or meet nearby.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Book Condition Guide */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-poppins font-bold text-center text-gradient mb-12">
            Book Condition Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-green-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📗</div>
                <Badge className="bg-green-100 text-green-800 mb-2">Mint Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">No markings, looks new</p>
                <p className="font-semibold text-green-600">Highest Price</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📘</div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Good Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">Few highlights, neat</p>
                <p className="font-semibold text-blue-600">Medium Price</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📙</div>
                <Badge className="bg-orange-100 text-orange-800 mb-2">Fair Condition</Badge>
                <p className="text-sm text-muted-foreground mb-2">Notes inside, still usable</p>
                <p className="font-semibold text-orange-600">Lower Price</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Forms Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Tabs defaultValue="sell" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Sell Your Books
              </TabsTrigger>
              <TabsTrigger value="buy" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Buy Pre-Loved Books
              </TabsTrigger>
            </TabsList>

            {/* Sell Books Form */}
            <TabsContent value="sell">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-poppins text-gradient">
                    Sell Your Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={sellForm.handleSubmit(handleSellSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input 
                          id="fullName"
                          {...sellForm.register("fullName")}
                          placeholder="Your full name"
                        />
                        {sellForm.formState.errors.fullName && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="rollNumber" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Roll Number *
                        </Label>
                        <Input 
                          id="rollNumber"
                          {...sellForm.register("rollNumber")}
                          placeholder="Your roll number"
                        />
                        {sellForm.formState.errors.rollNumber && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.rollNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactNumber" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Number *
                        </Label>
                        <Input 
                          id="contactNumber"
                          {...sellForm.register("contactNumber")}
                          placeholder="Your contact number"
                        />
                        {sellForm.formState.errors.contactNumber && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.contactNumber.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email ID *
                        </Label>
                        <Input 
                          id="email"
                          type="email"
                          {...sellForm.register("email")}
                          placeholder="your.email@kiit.ac.in"
                        />
                        {sellForm.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bookTitles" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Book Title(s) & Edition *
                      </Label>
                      <Textarea 
                        id="bookTitles"
                        {...sellForm.register("bookTitles")}
                        placeholder="List your books with editions (e.g., Mathematics 3 by RK Jain, Engineering Graphics by ND Bhatt 53rd Edition)"
                        rows={3}
                      />
                      {sellForm.formState.errors.bookTitles && (
                        <p className="text-sm text-destructive mt-1">
                          {sellForm.formState.errors.bookTitles.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="branch">Branch *</Label>
                        <Select onValueChange={(value) => sellForm.setValue("branch", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="ECE">ECE</SelectItem>
                            <SelectItem value="EEE">EEE</SelectItem>
                            <SelectItem value="MECH">MECH</SelectItem>
                            <SelectItem value="CIVIL">CIVIL</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {sellForm.formState.errors.branch && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.branch.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="yearOfStudy">Year of Study *</Label>
                        <Select onValueChange={(value) => sellForm.setValue("yearOfStudy", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        {sellForm.formState.errors.yearOfStudy && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.yearOfStudy.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="bookCondition">Book Condition *</Label>
                        <Select onValueChange={(value) => sellForm.setValue("bookCondition", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mint">Mint</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                          </SelectContent>
                        </Select>
                        {sellForm.formState.errors.bookCondition && (
                          <p className="text-sm text-destructive mt-1">
                            {sellForm.formState.errors.bookCondition.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pickupLocation" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Preferred Pickup Location *
                      </Label>
                      <Input 
                        id="pickupLocation"
                        {...sellForm.register("pickupLocation")}
                        placeholder="e.g., Kalinga Hostel Gate, CS Building, Campus 15"
                      />
                      {sellForm.formState.errors.pickupLocation && (
                        <p className="text-sm text-destructive mt-1">
                          {sellForm.formState.errors.pickupLocation.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="termsAccepted"
                        checked={sellForm.watch("termsAccepted")}
                        onCheckedChange={(checked) => sellForm.setValue("termsAccepted", checked as boolean)}
                      />
                      <Label htmlFor="termsAccepted" className="text-sm">
                        I confirm these books are original and belong to me *
                      </Label>
                    </div>
                    {sellForm.formState.errors.termsAccepted && (
                      <p className="text-sm text-destructive">
                        {sellForm.formState.errors.termsAccepted.message}
                      </p>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-kiit-green to-campus-blue text-white font-semibold py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit Book Request"}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buy Books Form */}
            <TabsContent value="buy">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-poppins text-gradient">
                    Buy Pre-Loved Books
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Reserve book sets from seniors at discounted prices
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={buyForm.handleSubmit(handleBuySubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buyFullName" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input 
                          id="buyFullName"
                          {...buyForm.register("fullName")}
                          placeholder="Your full name"
                        />
                        {buyForm.formState.errors.fullName && (
                          <p className="text-sm text-destructive mt-1">
                            {buyForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="buyRollNumber" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Roll Number *
                        </Label>
                        <Input 
                          id="buyRollNumber"
                          {...buyForm.register("rollNumber")}
                          placeholder="Your roll number"
                        />
                        {buyForm.formState.errors.rollNumber && (
                          <p className="text-sm text-destructive mt-1">
                            {buyForm.formState.errors.rollNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="buyContactNumber" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Number *
                      </Label>
                      <Input 
                        id="buyContactNumber"
                        {...buyForm.register("contactNumber")}
                        placeholder="Your contact number"
                      />
                      {buyForm.formState.errors.contactNumber && (
                        <p className="text-sm text-destructive mt-1">
                          {buyForm.formState.errors.contactNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bookSetNeeded" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Book Set Needed *
                      </Label>
                      <Textarea 
                        id="bookSetNeeded"
                        {...buyForm.register("bookSetNeeded")}
                        placeholder="Describe the books you need (e.g., 2nd Year CSE complete set, Mathematics 3 books, etc.)"
                        rows={3}
                      />
                      {buyForm.formState.errors.bookSetNeeded && (
                        <p className="text-sm text-destructive mt-1">
                          {buyForm.formState.errors.bookSetNeeded.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-campus-blue to-campus-purple text-white font-semibold py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Reserve Book Set"}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Bonus Combos Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-kiit-green-soft to-white">
        <div className="container mx-auto text-center">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-kiit-green" />
              <h3 className="text-2xl font-poppins font-bold text-gradient mb-4">
                Bonus Combos
              </h3>
              <p className="text-lg text-muted-foreground">
                Sell more, earn more! Bundle full semester sets for a bonus price.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety & Trust */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Safety & Trust</h3>
              <p className="text-sm text-muted-foreground">
                This service is independent of KIIT University. By Students, For Students. 
                100% safe, verified books only.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}