import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Lock, 
  Upload, 
  Phone, 
  Mail, 
  CheckCircle, 
  Filter,
  Plus,
  Heart,
  Star,
  Camera,
  Clock,
  AlertCircle,
  ArrowRight,
  Users,
  Shield,
  Coffee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";

// Mock data for lost and found items
const mockItems = [
  {
    id: 1,
    type: "Found",
    title: "Black JBL Earbuds Case",
    description: "Found near Food Court, has scratches on the back",
    location: "Food Court, Block 3",
    date: "2024-08-03",
    image: "/placeholder.svg",
    category: "Electronics",
    status: "available"
  },
  {
    id: 2,
    type: "Lost",
    title: "Blue Water Bottle with Stickers",
    description: "Cello brand, has engineering stickers",
    location: "Library, 2nd Floor",
    date: "2024-08-02",
    image: "/placeholder.svg",
    category: "Misc",
    status: "available"
  },
  {
    id: 3,
    type: "Found",
    title: "Student ID Card - Priya Sharma",
    description: "Found in CR-7 classroom",
    location: "CR-7, Academic Block",
    date: "2024-08-01",
    image: "/placeholder.svg",
    category: "ID Card",
    status: "available"
  },
  {
    id: 4,
    type: "Lost",
    title: "Red Notebook - Data Structures",
    description: "Contains handwritten notes for DS course",
    location: "Computer Lab 3",
    date: "2024-07-30",
    image: "/placeholder.svg",
    category: "Books",
    status: "available"
  }
];

const testimonials = [
  {
    text: "Lost my AirPods near Food Court — got them back in 2 hours!",
    author: "Rahul, CSE 3rd Year",
    icon: "🎧"
  },
  {
    text: "Someone found my file near Block 5. Thank you so much 💗",
    author: "Sneha, IT 2nd Year", 
    icon: "📁"
  },
  {
    text: "This platform is amazing! Got my wallet back with everything intact.",
    author: "Arjun, ETC 4th Year",
    icon: "👛"
  }
];

export default function LostAndFound() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [filteredItems, setFilteredItems] = useState(mockItems);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<"lost" | "found">("lost");
  const { toast } = useToast();

  const handleSearch = () => {
    let filtered = mockItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType);
    }
    
    setFilteredItems(filtered);
  };

  const handleUnlockContact = (itemId: number) => {
    toast({
      title: "Payment Required",
      description: "Redirecting to payment gateway for ₹10...",
    });
    // In a real app, this would integrate with Razorpay/UPI
    setTimeout(() => {
      toast({
        title: "Contact Unlocked! 🎉",
        description: "You can now contact the person. Check your email for details.",
      });
    }, 2000);
  };

  const handleFormSubmit = () => {
    toast({
      title: "✅ Submitted Successfully!",
      description: "Your post has been submitted for admin approval. We'll notify you once it goes live.",
    });
    setShowUploadForm(false);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategory, selectedType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft to-white">
      <Navbar />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-kiit-green to-campus-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-poppins font-bold mb-6">
              🎒 Lost & Found
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              One campus. Thousands of students. Things get lost.<br />
              <span className="font-semibold">Let's help them find their way back.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-kiit-green hover:bg-gray-100 font-semibold px-8 py-4"
                onClick={() => {
                  setUploadType("lost");
                  setShowUploadForm(true);
                }}
              >
                <Plus className="mr-2 w-5 h-5" />
                Post Lost Item
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-kiit-green font-semibold px-8 py-4"
                onClick={() => {
                  setUploadType("found");
                  setShowUploadForm(true);
                }}
              >
                <Camera className="mr-2 w-5 h-5" />
                Post Found Item
              </Button>
            </div>
            
            {/* Floating Items Illustration */}
            <div className="relative opacity-20">
              <div className="flex justify-center items-center space-x-8 text-6xl animate-fade-in">
                🎧 💻 📱 🔑 📚 ☂️ 👓 💳
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold text-gradient mb-4">
              🧭 How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to reunite you with your belongings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Upload className="w-8 h-8" />,
                title: "Post Item",
                description: "Upload lost or found item details (Free!)"
              },
              {
                step: "2", 
                icon: <Shield className="w-8 h-8" />,
                title: "Admin Approval",
                description: "We verify and approve in 1-2 hours"
              },
              {
                step: "3",
                icon: <Search className="w-8 h-8" />,
                title: "Browse Freely",
                description: "Everyone can view all items for free"
              },
              {
                step: "4",
                icon: <Phone className="w-8 h-8" />,
                title: "Connect",
                description: "Pay ₹10 to unlock contact details"
              }
            ].map((step, index) => (
              <Card key={index} className="text-center service-card">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-r from-kiit-green to-campus-blue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="bg-kiit-green text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground italic">
              "Just a little fee to prevent spam — we're not making money here."
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">🔍 Search Items</Label>
                <Input
                  id="search"
                  placeholder="e.g., 'black wallet', 'spectacles', 'Block-3'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="w-full lg:w-48">
                <Label>Category</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="Lost">Lost Items</SelectItem>
                    <SelectItem value="Found">Found Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full lg:w-48">
                <Label>Item Type</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="ID Card">ID Cards</SelectItem>
                    <SelectItem value="Books">Books & Stationery</SelectItem>
                    <SelectItem value="Misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch} className="bg-kiit-green hover:bg-kiit-green/90">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lost & Found Listings Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold text-gradient mb-4">
              📋 Recent Posts
            </h2>
            <p className="text-muted-foreground">
              {filteredItems.length} items found matching your search
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="service-card overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 left-2 ${
                      item.type === "Lost" 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {item.type}
                  </Badge>
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    {item.category}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {item.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-kiit-green to-campus-blue hover:opacity-90"
                        size="sm"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock Contact - ₹10
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>🔓 Unlock Contact Details</DialogTitle>
                        <DialogDescription>
                          This student has uploaded a {item.type.toLowerCase()} item matching your search. 
                          Pay just ₹10 to unlock their contact and connect with them.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-kiit-green-soft rounded-lg">
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        
                        <div className="text-center">
                          <Button 
                            onClick={() => handleUnlockContact(item.id)}
                            className="bg-gradient-to-r from-kiit-green to-campus-blue text-white px-8"
                          >
                            Pay ₹10 & Unlock Contact
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          Please be respectful. If the item isn't yours, don't misuse contact info.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Reunions Carousel */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold text-gradient mb-4">
              🌟 Recent Reunions
            </h2>
            <p className="text-muted-foreground">
              Happy stories from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="service-card text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{testimonial.icon}</div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-poppins font-bold text-gradient mb-4">
                🙋 Frequently Asked Questions
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "Is this service paid?",
                  answer: "Posting items is completely free. Viewing listings is free. Only connecting with the poster costs ₹10 to prevent spam and ensure serious inquiries."
                },
                {
                  question: "Why not make it 100% free?",
                  answer: "The ₹10 fee ensures only serious people reach out. This prevents spam, false claims, and protects both parties. It's minimal but effective."
                },
                {
                  question: "What if someone lies about an item?",
                  answer: "All listings are admin-approved before going live. Plus, users can report misuse, and we investigate all reports promptly."
                },
                {
                  question: "How fast is the approval process?",
                  answer: "Usually within 1-2 hours during college hours. We review each post to ensure authenticity and appropriate content."
                },
                {
                  question: "Can I update or remove my post?",
                  answer: "Yes! After posting, you'll receive a link via email to edit or delete your post anytime."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept UPI, debit/credit cards, and net banking through our secure payment gateway."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              📤 Post {uploadType === "lost" ? "Lost" : "Found"} Item
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. Your post will be live after admin approval (1-2 hours).
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input id="name" required />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input id="whatsapp" type="tel" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year & Branch *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year and branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st-cse">1st Year - CSE</SelectItem>
                    <SelectItem value="2nd-it">2nd Year - IT</SelectItem>
                    <SelectItem value="3rd-ece">3rd Year - ECE</SelectItem>
                    <SelectItem value="4th-mech">4th Year - Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">KIIT Email *</Label>
                <Input id="email" type="email" required placeholder="your.name@kiit.ac.in" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input id="item-name" required placeholder="e.g., Black JBL Earbuds Case" />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                required 
                placeholder="Detailed description of the item..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location {uploadType === "lost" ? "Last Seen" : "Found"} *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food-court">Food Court</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="academic-block">Academic Block</SelectItem>
                    <SelectItem value="hostel">Hostel Area</SelectItem>
                    <SelectItem value="sports-complex">Sports Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Item Category *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="id-card">ID Card</SelectItem>
                    <SelectItem value="books">Books & Stationery</SelectItem>
                    <SelectItem value="misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Date & Time {uploadType === "lost" ? "Lost" : "Found"} *</Label>
              <Input id="date" type="datetime-local" required />
            </div>
            
            <div>
              <Label htmlFor="photo">Upload Photo *</Label>
              <Input id="photo" type="file" accept="image/*" required />
              <p className="text-xs text-muted-foreground mt-1">
                Clear photo helps in identification
              </p>
            </div>
            
            {uploadType === "lost" && (
              <div>
                <Label htmlFor="proof">Upload Proof (Optional)</Label>
                <Input id="proof" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground mt-1">
                  Any proof of ownership (purchase receipt, etc.)
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostel">Hostel Block *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hostel block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block-1">Block 1</SelectItem>
                    <SelectItem value="block-2">Block 2</SelectItem>
                    <SelectItem value="block-3">Block 3</SelectItem>
                    <SelectItem value="block-4">Block 4</SelectItem>
                    <SelectItem value="block-5">Block 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room">Room Number *</Label>
                <Input id="room" required placeholder="e.g., 245" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional information..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowUploadForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-kiit-green to-campus-blue"
              >
                Submit for Approval
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button 
          size="lg"
          className="rounded-full shadow-lg bg-kiit-green hover:bg-kiit-green/90"
          onClick={() => {
            document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Items
        </Button>
        <Button 
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-campus-blue to-campus-purple"
          onClick={() => setShowUploadForm(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Post Item
        </Button>
      </div>
    </div>
  );
}