import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, Home, LogOut, User, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import kiitMascot from "@/assets/kiit-mascot.jpg";

interface NavItem {
  label: string;
  href: string;
  isRoute?: boolean;
}

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Check if current user is admin
  const isAdmin = user?.email === 'adityash8997@gmail.com' || user?.email === '24155598@kiit.ac.in';



  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      // Force redirect after sign out
      window.location.href = "/auth";
    } catch (error) {
      toast.error("Error signing out");
      console.error("Sign out error:", error);
    }
  };

  const navItems: NavItem[] = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Our Team", href: "#team" },
    { label: "FAQ", href: "#faq" },
    { label: "Feedback", href: "/feedback", isRoute: true },
    { label: "Contact", href: "#contact" },
  ];

  // Smooth scroll to section or navigate to route
  const scrollToSection = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      navigate(href);
      setIsOpen(false);
      return;
    }
    
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
    setIsOpen(false);
  };

  // Scroll spy functionality
  useEffect(() => {
    if (location.pathname !== "/"){
      setActiveSection("home")
       return;
    }

    const sections = ["home", ...navItems.map((item) => item.href.substring(1))]

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
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
  }, [location.pathname, navItems]);

  const isActive = (href: string) => {
    const sectionId = href.substring(1);
    return activeSection === sectionId;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-kiit-green text-white border-b border-white/20 shadow-lg mx-2 mt-2 lg:rounded-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={() => navigate("/")}
          >
            <img
              src={kiitMascot}
              alt="KIIT Saathi Mascot"
              className="w-11 h-11 animate-pulse rounded-full"
            />
            <div className="font-poppins font-bold text-lg sm:text-xl lg:text-3xl text-white-700 drop-shadow-lg">
              KIIT Saathi
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href, item.isRoute)}
                className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium relative ${
                  isActive(item.href)
                    ? "text-black bg-white/40"
                    : "text-white hover:text-kiit-green hover:bg-kiit-green/5"
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
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/admin-dashboard")}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 gap-2 px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Button>
                )}
                <Button onClick={() => navigate("/order-history")} 
                  className="bg-black/10 hover:text-black transition-all duration-300 gap-2 px-3 rounded-full py-4">
                  <User className="w-6 h-6 " />
                  {/* {user.email} */}
                  </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="bg-black/10 hover:text-black transition-all duration-300 gap-2 px-2 rounded-full py-4 "
                >
                  <LogOut className="w-6 h-6 mr-2" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
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
            {/* <button
              onClick={() => {
                navigate("/");
                setIsOpen(false);
                setActiveSection("home");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                isActive("#home")
                  ? "text-black bg-white/40"
                  : "text-white hover:text-kiit-green hover:bg-kiit-green/5"
              }`}
            >
              
            </button> */}

            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href, item.isRoute)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive(item.href)
                    ? "text-black bg-white/40"
                    : "text-white hover:text-kiit-green hover:bg-kiit-green/5"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate("/admin-dashboard");
                        setIsOpen(false);
                      }}
                      className="justify-start hover:bg-red-500/10 hover:text-red-500 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-500 border border-red-500/30"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate("/order-history");
                      setIsOpen(false);
                    }}
                    className="justify-start hover:bg-kiit-green/10 hover:text-kiit-green"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Order History
                  </Button>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-white">
                    <User className="w-4 h-4" />
                    {user.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="border-red-500/30 hover:bg-red-500/10 text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                  className="gradient-primary text-white font-semibold shadow-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
