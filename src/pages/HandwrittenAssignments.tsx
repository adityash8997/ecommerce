import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Upload,
  Clock,
  User,
  CheckCircle,
  Star,
  MapPin,
  MessageCircle,
  ArrowRight,
  Calculator,
  PenTool,
  FileText,
  Truck,
  Coffee,
  ArrowLeft
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const HandwrittenAssignments = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    year: "",
    branch: "",
    pages: "",
    deadline: "",
    hostel: "",
    room: "",
    notes: "",
    urgent: false,
    matchHandwriting: false
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const calculatePrice = () => {
    const pages = parseInt(formData.pages) || 0;
    const basePrice = pages * (formData.urgent ? 15 : 10);
    const matchingFee = formData.matchHandwriting ? 20 : 0;
    const deliveryFee = 10;
    const total = basePrice + matchingFee + deliveryFee;
    setCalculatedPrice(total);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const writers = [
    {
      name: "Priya S.",
      year: "3rd Year",
      course: "CSE",
      rating: 4.9,
      tags: ["Fast writer", "Neat handwriting"],
      sample: "✨ Beautiful cursive style"
    },
    {
      name: "Rahul M.",
      year: "4th Year", 
      course: "Mechanical",
      rating: 4.8,
      tags: ["Technical diagrams", "Engineering notes"],
      sample: "📐 Perfect for technical work"
    },
    {
      name: "Sneha K.",
      year: "2nd Year",
      course: "MBBS",
      rating: 5.0,
      tags: ["Medical student", "Precise writing"],
      sample: "💊 Medical precision writing"
    }
  ];

  const faqs = [
    {
      question: "Will the handwriting match mine?",
      answer: "If you upload a sample, we'll try our best to match your style. Our writers are skilled at adapting different handwriting styles."
    },
    {
      question: "Is this allowed by college?",
      answer: "This is just handwriting support. The content must be your own original work. We're simply helping with the physical writing process."
    },
    {
      question: "Can I request urgent assignments?",
      answer: "Yes, but we charge extra for urgent same-day deliveries. We recommend placing orders at least 24 hours in advance for best results."
    },
    {
      question: "Who writes my assignments?",
      answer: "KIIT students who love neat handwriting and earn through this service. All writers are verified and their work is reviewed before delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50">
      {/* Back to Home Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient font-poppins">
              📝 Handwritten Assignments
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Don't have time to write? We've got real students who'll do it for you — neat, accurate, and on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                Your handwriting break starts here
              </Badge>
              <Badge variant="outline" className="text-lg py-2 px-4">
                Real handwriting. Real paper. Real students.
              </Badge>
            </div>
            <Button 
              size="lg" 
              className="gradient-primary text-white px-8 py-4 text-lg"
              onClick={() => document.getElementById('upload-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Place an Assignment Request
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">🎒 How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <Upload className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Upload Assignment</h3>
                <p className="text-muted-foreground">Upload your PDF or image of the assignment</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <PenTool className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Choose Style</h3>
                <p className="text-muted-foreground">Select writing style and delivery time</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <User className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Writer Assigned</h3>
                <p className="text-muted-foreground">We assign a verified student writer</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <Truck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Delivered</h3>
                <p className="text-muted-foreground">Handwritten copy delivered to your hostel</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-muted-foreground italic">
            "We use college students who love handwriting and need extra income — so it helps everyone."
          </p>
        </div>
      </section>

      {/* Upload Form */}
      <section id="upload-form" className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto glass-card">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-gradient">📤 Assignment Upload Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input 
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                  <Input 
                    placeholder="+91 99999 99999"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Input 
                    placeholder="1st/2nd/3rd/4th Year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Branch</label>
                  <Input 
                    placeholder="CSE/EEE/Mechanical/etc."
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Assignment Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-kiit-green transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload PDF or images</p>
                  <p className="text-sm text-gray-500 mt-2">Support for multiple files</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Pages</label>
                  <Input 
                    type="number"
                    placeholder="Auto-suggested from PDF"
                    value={formData.pages}
                    onChange={(e) => {
                      handleInputChange('pages', e.target.value);
                      calculatePrice();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <Input 
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hostel Name</label>
                  <Input 
                    placeholder="CV Raman/Kalam/etc."
                    value={formData.hostel}
                    onChange={(e) => handleInputChange('hostel', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Room Number</label>
                  <Input 
                    placeholder="Room 101"
                    value={formData.room}
                    onChange={(e) => handleInputChange('room', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                <Textarea 
                  placeholder="Any specific requirements..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => {
                      handleInputChange('urgent', e.target.checked);
                      calculatePrice();
                    }}
                  />
                  <label htmlFor="urgent">Urgent (within 24 hrs) - ₹5 extra per page</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="match"
                    checked={formData.matchHandwriting}
                    onChange={(e) => {
                      handleInputChange('matchHandwriting', e.target.checked);
                      calculatePrice();
                    }}
                  />
                  <label htmlFor="match">Match my handwriting - ₹20 extra</label>
                </div>
              </div>

              {calculatedPrice > 0 && (
                <div className="bg-kiit-green/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-kiit-green">
                    Estimated Total: ₹{calculatedPrice}
                  </p>
                </div>
              )}

              <Button className="w-full gradient-primary text-white py-4 text-lg">
                Request Writer
                <CheckCircle className="ml-2" />
              </Button>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-green-700">✅ Writer Assigned! You'll get updates via WhatsApp.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">💸 Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Calculator className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">₹10/page</h3>
                <p className="text-muted-foreground">Standard delivery</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center border-kiit-green">
              <CardContent className="pt-6">
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">₹15/page</h3>
                <p className="text-muted-foreground">Urgent (24 hrs)</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <PenTool className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">+₹20</h3>
                <p className="text-muted-foreground">Handwriting match</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-muted-foreground">
            + ₹10 delivery fee (pickup also available for free)
          </p>
        </div>
      </section>

      {/* Meet the Writers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">🧑‍💼 Meet the Writers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {writers.map((writer, index) => (
              <Card key={index} className="glass-card hover:scale-105 transition-transform">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-kiit-green to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                    {writer.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg">{writer.name}</h3>
                  <p className="text-muted-foreground">{writer.year} • {writer.course}</p>
                  <div className="flex justify-center items-center gap-1 my-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{writer.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {writer.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">{writer.sample}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground italic">
            "All writers are KIIT students. We review all work before sending it to you."
          </p>
        </div>
      </section>

      {/* Why This Works */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">🧠 Why This Works</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card mb-8">
              <CardContent className="pt-6">
                <blockquote className="text-xl italic text-center text-muted-foreground mb-4">
                  "I was totally overwhelmed with 5 assignments due the same week. This service saved my semester!"
                </blockquote>
                <p className="text-center font-semibold">— 2nd Year CSE Student</p>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-3xl font-bold text-kiit-green mb-2">1,000+</h3>
                <p className="text-muted-foreground">Assignments completed</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-blue-500 mb-2">200+</h3>
                <p className="text-muted-foreground">Verified writers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-500 mb-2">90%</h3>
                <p className="text-muted-foreground">Student satisfaction</p>
              </div>
            </div>

            <div className="mt-12 space-y-4 text-center">
              <p className="text-lg">Perfect for when you're unwell, overbooked, or stuck with other work.</p>
              <p className="text-lg font-semibold">No AI, no copy-paste — just real handwritten work.</p>
              <blockquote className="text-lg italic text-muted-foreground mt-8">
                "Wrote for 3 hours, forgot to write my own." – A satisfied user 😅
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">🙋 FAQs</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">📦 Delivery Options</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Truck className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">📬 To your hostel room</h3>
                <p className="text-muted-foreground">Extra ₹10</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">📍 Campus pickup</h3>
                <p className="text-muted-foreground">Free</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">📸 WhatsApp preview</h3>
                <p className="text-muted-foreground">Before delivery</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-xl font-semibold text-kiit-green">
            "You'll never miss a deadline again."
          </p>
        </div>
      </section>

      {/* Become a Writer */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto glass-card text-center">
            <CardContent className="pt-8">
              <h2 className="text-4xl font-bold mb-6 text-gradient">🙌 Love Handwriting? Earn with Us</h2>
              <p className="text-xl text-muted-foreground mb-8">
                We're looking for neat writers who want to earn ₹8–₹12 per page. Flexible, chill work.
              </p>
              <Button size="lg" className="gradient-primary text-white px-8 py-4 text-lg">
                Join as a Writer
                <Coffee className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 text-white shadow-lg">
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default HandwrittenAssignments;