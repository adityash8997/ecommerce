import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Smartphone, LogIn, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import kiitMascot from "@/assets/kiit-mascot.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" }
  ];

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    setIsOpen(false);
  };

  // Scroll spy functionality
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = navItems.map(item => item.href.substring(1));
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [location.pathname]);

  const isActive = (href: string) => {
    const sectionId = href.substring(1);
    return activeSection === sectionId;
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-kiit-green/10 via-campus-blue/10 to-campus-purple/10 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-all duration-300" 
            onClick={() => navigate('/')}
          >
            <img src={kiitMascot} alt="KIIT Saathi Mascot" className="w-8 h-8 animate-pulse" />
            <div className="font-poppins font-bold text-xl text-gradient hover:scale-105 transition-transform">
              KIIT Saathi
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/')} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-medium ${
                location.pathname === '/' 
                  ? 'text-kiit-green bg-kiit-green/10' 
                  : 'text-foreground hover:text-kiit-green hover:bg-kiit-green/5'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium relative ${
                  isActive(item.href)
                    ? 'text-kiit-green bg-kiit-green/10'
                    : 'text-foreground hover:text-kiit-green hover:bg-kiit-green/5'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-primary rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-kiit-green/10 hover:text-kiit-green transition-all duration-300"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button 
              size="sm" 
              className="gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Get App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-kiit-green/10 transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-2 backdrop-blur-sm">
            <button 
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }} 
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                location.pathname === '/' 
                  ? 'text-kiit-green bg-kiit-green/10' 
                  : 'text-foreground hover:text-kiit-green hover:bg-kiit-green/5'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive(item.href)
                    ? 'text-kiit-green bg-kiit-green/10'
                    : 'text-foreground hover:text-kiit-green hover:bg-kiit-green/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
              <Button 
                variant="outline" 
                size="sm"
                className="border-kiit-green/30 hover:bg-kiit-green/10"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button 
                size="sm" 
                className="gradient-primary text-white font-semibold shadow-lg"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Get App
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};