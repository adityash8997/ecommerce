import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Users, Truck, Clock, CheckCircle, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CartonTransfer = () => {
  const navigate = useNavigate();
  const [selectedBoxes, setSelectedBoxes] = useState(1);
  const [needTape, setNeedTape] = useState('no');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    hostel: '',
    room: '',
    mobile: '',
    paymentMethod: 'upi'
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const calculateTotal = () => {
    let total = 0;
    if (selectedBoxes === 1) total += 40;
    else if (selectedBoxes === 3) total += 110;
    else total += selectedBoxes * 40;
    
    if (needTape === 'yes') total += 15;
    total += 49; // Pickup service
    return total;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select a pickup time slot');
      return;
    }
    
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      setBookingSuccess(true);
      toast.success('🎉 Booking confirmed! Check WhatsApp for details.');
    }, 2000);
  };

  const timeSlots = [
    '10:00–11:00 AM',
    '12:00–1:00 PM',
    '3:00–4:00 PM',
    '5:00–6:00 PM'
  ];

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center glassmorphism animate-scale-in">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-kiit-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-kiit-green mb-2">🎉 Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                You'll get a WhatsApp message with confirmation soon. Our team will call 15 minutes before pickup!
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => setBookingSuccess(false)} className="w-full">
                Book Another Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glassmorphism border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open('https://wa.me/919876543210', '_blank')}
          >
            <MessageCircle className="w-4 h-4" />
            Need Help?
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
            📦 Hostel Carton Box & Transfer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Moving hostels? We deliver the boxes, you pack, and we move everything safely!
          </p>
          <div className="mb-8 animate-scale-in">
            <img 
              src="/placeholder.svg" 
              alt="Students moving boxes with pickup truck"
              className="mx-auto w-full max-w-md rounded-2xl shadow-lg"
            />
          </div>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
            onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Book Boxes Now! 📦
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          How It Works ✨
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Package className="w-12 h-12 text-kiit-green" />,
              title: "You book boxes 📦",
              description: "Select how many cartons you need + tape. We deliver them in the morning."
            },
            {
              icon: <Users className="w-12 h-12 text-campus-blue" />,
              title: "You pack your stuff 🎒",
              description: "You do the packing, we stay out (hostel rules!)."
            },
            {
              icon: <Truck className="w-12 h-12 text-campus-orange" />,
              title: "We pick & shift your cartons 🚚",
              description: "Our truck comes during your slot and moves your items to the new hostel."
            }
          ].map((step, index) => (
            <Card key={index} className="text-center glassmorphism hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="mb-4 flex justify-center">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-4 text-kiit-green">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          Simple Pricing 💸
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
          {[
            { item: "1 Box", price: "₹40", popular: false },
            { item: "3 Boxes Combo", price: "₹110", popular: true },
            { item: "Tape (optional)", price: "₹15", popular: false },
            { item: "Pickup Service", price: "₹49 flat", popular: false }
          ].map((pricing, index) => (
            <Card key={index} className={`glassmorphism text-center ${pricing.popular ? 'ring-2 ring-kiit-green' : ''}`}>
              <CardContent className="p-6">
                {pricing.popular && (
                  <Badge className="mb-4 bg-kiit-green text-white">Most Popular</Badge>
                )}
                <h3 className="text-lg font-semibold mb-2">{pricing.item}</h3>
                <p className="text-2xl font-bold text-kiit-green">{pricing.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-muted-foreground">
          ✨ Free delivery of empty boxes in the morning!
        </p>
      </section>

      {/* Pickup Time Slots */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-8">
          Choose Your Pickup Slot ⏰
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Choose one slot while booking — we'll shift your cartons safely in that hour.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {timeSlots.map((slot, index) => (
            <Card 
              key={index} 
              className={`glassmorphism cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedSlot === slot ? 'ring-2 ring-kiit-green bg-kiit-green/10' : ''
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-3 text-kiit-green" />
                <p className="font-semibold">{slot}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking-form" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glassmorphism">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-kiit-green">Book Your Carton Transfer 📋</CardTitle>
              <CardDescription>No login required! Quick and easy booking.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hostel">Hostel Name</Label>
                    <Input
                      id="hostel"
                      required
                      value={formData.hostel}
                      onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                      placeholder="e.g., Hostel 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      required
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="e.g., 205"
                    />
                  </div>
                </div>

                <div>
                  <Label>Number of Boxes</Label>
                  <Select value={selectedBoxes.toString()} onValueChange={(value) => setSelectedBoxes(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Box (₹40)</SelectItem>
                      <SelectItem value="3">3 Boxes Combo (₹110)</SelectItem>
                      <SelectItem value="5">5 Boxes (₹200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Need Tape? (+₹15)</Label>
                  <RadioGroup value={needTape} onValueChange={setNeedTape} className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="tape-yes" />
                      <Label htmlFor="tape-yes">Yes, add tape</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="tape-no" />
                      <Label htmlFor="tape-no">No, I have tape</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Preferred Pickup Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your pickup time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pod" id="pod" />
                      <Label htmlFor="pod">Pay on Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-kiit-green/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-kiit-green mb-2">
                    Total: ₹{calculateTotal()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Includes {selectedBoxes} box{selectedBoxes > 1 ? 'es' : ''}, 
                    {needTape === 'yes' ? ' tape,' : ''} and pickup service
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg rounded-full"
                  disabled={isBooking}
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking 🚀'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-kiit-green mb-12">
          Frequently Asked Questions 🙋
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Can your team help me pack?",
                answer: "Nope! Hostel rules don't allow helpers inside. You pack, we move."
              },
              {
                question: "Can I get boxes today and shift tomorrow?",
                answer: "Yes! We deliver boxes in the morning and shift at your booked time."
              },
              {
                question: "Will someone call me before pickup?",
                answer: "Yes. Our team will call/WhatsApp 15 min before your scheduled slot."
              },
              {
                question: "What if I need more boxes later?",
                answer: "Just book again using this page. We'll deliver the extras."
              },
              {
                question: "Is this service available on weekends?",
                answer: "Yes! We operate 7 days a week, including weekends and holidays."
              },
              {
                question: "What if my items get damaged?",
                answer: "We handle everything with care. For any issues, contact us immediately and we'll resolve it."
              }
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glassmorphism px-6">
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
      </section>

      {/* WhatsApp Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
          onClick={() => window.open('https://wa.me/919876543210', '_blank')}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Need Help? Chat with Team 📲
        </Button>
      </div>
    </div>
  );
};

export default CartonTransfer;