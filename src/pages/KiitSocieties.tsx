import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  PartyPopper,
  Trophy,
  Search,
  Users,
  MessageSquare
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const KiitSocieties = () => {
  const navigate = useNavigate();

  const societyServices = [
    {
      icon: Search,
      title: "Interview Deadlines Tracker",
      description: "Track every interview and onboarding deadline.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: "🗓️",
      route: "/interview-deadlines"
    },
    {
      icon: PartyPopper,
      title: "Fest Announcements",
      description: "All fest updates, registrations, and event highlights — in one place.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: "🎊",
      route: "/fest-announcements"
    },
    {
      icon: Trophy,
      title: "Sports Events Hub",
      description: "See tryout dates, match schedules, and urgent team alerts.",
      price: "Free",
      gradient: "from-kiit-green to-campus-blue",
      emoji: "🎾",
      route: "/sports-events"
    }
  ];

  const kiitSocieties = [
    {
      name: "KIIT Technology Society",
      description: "Innovation, coding competitions, and tech workshops",
      category: "Technical",
      members: "500+",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "KIIT Cultural Society",
      description: "Dance, music, drama, and cultural events",
      category: "Cultural",
      members: "800+",
      gradient: "from-pink-500 to-orange-500"
    },
    {
      name: "KIIT Debate Society",
      description: "Parliamentary debates, MUNs, and public speaking",
      category: "Literary",
      members: "300+",
      gradient: "from-green-500 to-teal-600"
    },
    {
      name: "KIIT Photography Club",
      description: "Capture memories, workshops, and exhibitions",
      category: "Creative",
      members: "400+",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      name: "KIIT Entrepreneurship Cell",
      description: "Startup culture, business plans, and networking",
      category: "Business",
      members: "250+",
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "KIIT Social Service Society",
      description: "Community service, outreach, and social impact",
      category: "Social",
      members: "600+",
      gradient: "from-teal-500 to-cyan-600"
    }
  ];

  const handleServiceClick = (route: string) => {
    if (route) {
      navigate(route);
    } else {
      alert("🚀 Coming Soon! This service is under development and will be available soon.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft to-white">
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
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
              📣 KIIT Societies, Fests and Sports
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Your gateway to campus societies, events, and opportunities
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Never miss an interview, fest, or sports event again</span>
              <span className="hidden md:inline">•</span>
              <span>One calendar. All societies. All events.</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-kiit-green-light to-purple-200 rounded-full flex items-center justify-center mb-8">
                <div className="text-6xl">🏛️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Services */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🚀 Quick Access</h2>
            <p className="text-gray-600">Track deadlines, events, and announcements</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {societyServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer"
                  onClick={() => handleServiceClick(service.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient} w-fit mx-auto mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl mb-2">{service.emoji}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${service.gradient} text-white`}>
                        {service.price}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All KIIT Societies */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🏛️ All KIIT Societies</h2>
            <p className="text-gray-600">Discover societies that match your interests and passions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kiitSocieties.map((society, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green">
                <CardHeader className="text-center pb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${society.gradient} w-fit mx-auto mb-3`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{society.name}</CardTitle>
                  <p className="text-sm text-gray-600">{society.category} • {society.members} members</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{society.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-kiit-green group-hover:text-white transition-all duration-300"
                    onClick={() => alert("🚀 Coming Soon! Society details page is under development.")}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft to-purple-100">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-kiit-green mb-6">📅 Never Miss an Opportunity</h2>
            <p className="text-gray-600 mb-8">
              Stay updated with all society interviews, fest announcements, and sports events in one place.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3"
                onClick={() => alert("🚀 Coming Soon! Interview tracker is under development.")}
              >
                Track Interviews
              </Button>
              <Button 
                variant="outline" 
                className="border-kiit-green text-kiit-green hover:bg-kiit-green hover:text-white px-8 py-3"
                onClick={() => alert("🚀 Coming Soon! Event calendar is under development.")}
              >
                View All Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Support */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg"
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default KiitSocieties;