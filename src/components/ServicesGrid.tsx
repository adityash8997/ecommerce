import { 
  Package, 
  Printer, 
  Users, 
  PenTool, 
  Calendar, 
  ShoppingBag, 
  PartyPopper, 
  Bot, 
  BookOpen, 
  MessageCircle,
  Shield,
  Timer,
  Trophy,
  MapPin,
  Search,
  Car,
  Lightbulb,
  Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Package,
    title: "Carton Packing & Hostel Transfers",
    description: "Moving day? Get cartons, packing, and hostel-to-hostel delivery in one tap.",
    price: "₹50/carton",
    gradient: "from-kiit-green to-campus-blue",
    emoji: "📦"
  },
  {
    icon: Printer,
    title: "Printouts on Demand",
    description: "Too lazy to go out? Just send a PDF and get it printed and delivered.",
    price: "₹2/page",
    gradient: "from-campus-blue to-campus-purple",
    emoji: "🖨️"
  },
  {
    icon: Users,
    title: "Senior Connect",
    description: "Talk to seniors, get real answers, and book mentorship calls.",
    price: "₹99/session",
    gradient: "from-campus-purple to-campus-orange",
    emoji: "🎓"
  },
  {
    icon: PenTool,
    title: "Handwritten Assignments",
    description: "We write. You relax. Real paper, neat handwriting, delivered on time.",
    price: "₹5/page",
    gradient: "from-campus-orange to-kiit-green",
    emoji: "✍️"
  },
  {
    icon: Calendar,
    title: "Society Openings",
    description: "One calendar. All societies. Never miss an interview again.",
    price: "Free",
    gradient: "from-kiit-green to-campus-blue",
    emoji: "📣"
  },
  {
    icon: ShoppingBag,
    title: "Grocery & Momo Delivery",
    description: "From Deepak Momos to Doms pencils — delivery from nearby shops.",
    price: "₹20 delivery",
    gradient: "from-campus-blue to-campus-purple",
    emoji: "🛍️"
  },
  {
    icon: PartyPopper,
    title: "Fest Announcements",
    description: "All fest updates, registrations, and event highlights — in one place.",
    price: "Free",
    gradient: "from-campus-purple to-campus-orange",
    emoji: "🎊"
  },
  {
    icon: Bot,
    title: "AI Campus Assistant",
    description: "Lost? Hungry? Confused? Ask our chatbot — 24x7 KIIT help.",
    price: "Free",
    gradient: "from-campus-orange to-kiit-green",
    emoji: "🤖"
  },
  {
    icon: BookOpen,
    title: "Study Material by Seniors",
    description: "Seniors' notes, solved papers, lab manuals — shared with you.",
    price: "₹49/subject",
    gradient: "from-kiit-green to-campus-blue",
    emoji: "📚"
  },
  {
    icon: MessageCircle,
    title: "Tutoring & Counselling",
    description: "Struggling in class or life? Book a session with a real senior mentor.",
    price: "₹199/hour",
    gradient: "from-campus-blue to-campus-purple",
    emoji: "💬"
  },
  {
    icon: Shield,
    title: "Campus Safety Map",
    description: "Real-time dark path tracker. SOS alert. Feel safer, walk smarter.",
    price: "Free",
    gradient: "from-campus-purple to-campus-orange",
    emoji: "🌃"
  },
  {
    icon: Timer,
    title: "Queue-Free Print System",
    description: "One student prints for all. Save time. Split cost.",
    price: "₹1.5/page",
    gradient: "from-campus-orange to-kiit-green",
    emoji: "🖨️"
  },
  {
    icon: Trophy,
    title: "Sports Events Hub",
    description: "See tryout dates, match schedules, and urgent team alerts.",
    price: "Free",
    gradient: "from-kiit-green to-campus-blue",
    emoji: "🎾"
  },
  {
    icon: MapPin,
    title: "Recreation Discovery",
    description: "Find common rooms, guitar classes, foosball tables, movie rooms.",
    price: "Free",
    gradient: "from-campus-blue to-campus-purple",
    emoji: "🎬"
  },
  {
    icon: Search,
    title: "Interview Deadlines Tracker",
    description: "Track every interview and onboarding deadline.",
    price: "Free",
    gradient: "from-campus-purple to-campus-orange",
    emoji: "🗓️"
  },
  {
    icon: Search,
    title: "Lost & Found Portal",
    description: "Lost your ID card? Found someone's AirPods? Report it here.",
    price: "Free",
    gradient: "from-campus-orange to-kiit-green",
    emoji: "🔍"
  },
  {
    icon: Car,
    title: "Campus Tour Booking",
    description: "Auto tours for parents across KIIT, KIMS, and KISS campuses.",
    price: "₹500/tour",
    gradient: "from-kiit-green to-campus-blue",
    emoji: "🚗"
  },
  {
    icon: Lightbulb,
    title: "Skill-Enhancing Sessions",
    description: "Learn Figma, AI tools, Excel, freelancing — from your peers.",
    price: "₹299/workshop",
    gradient: "from-campus-blue to-campus-purple",
    emoji: "🛠️"
  }
];

export const ServicesGrid = () => {
  const navigate = useNavigate();

  const handleServiceClick = (index: number) => {
    if (index === 0) { // Carton Packing service
      navigate("/carton-transfer");
    } else if (index === 2) { // Senior Connect service
      navigate("/senior-connect");
    } else if (index === 3) { // Handwritten Assignments service
      navigate("/handwritten-assignments");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-kiit-green-soft to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <Star className="w-4 h-4" />
            18+ Campus Services
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Everything You Need
            <span className="block">In One App</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From academic help to daily essentials, we've built the complete ecosystem 
            for your KIIT experience. <span className="font-semibold text-kiit-green">Because campus life is hectic enough already.</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index}
                className="service-card group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl">{service.emoji}</div>
                </div>

                {/* Service Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-poppins font-semibold text-foreground group-hover:text-kiit-green transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${service.gradient} text-white`}>
                      {service.price}
                    </span>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => handleServiceClick(index)}
                    >
                      Try Now
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-poppins font-bold text-gradient mb-4">
              Ready to simplify your campus life?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of KIIT students who've already made their lives easier.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-kiit-green to-campus-blue text-white font-semibold px-8 py-4">
              Download Now - It's Free!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};