import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Smartphone, LogIn, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kiitMascot from "@/assets/kiit-mascot.png";
export const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [{
    label: "Services",
    href: "#services"
  }, {
    label: "How It Works",
    href: "#how-it-works"
  }, {
    label: "Testimonials",
    href: "#testimonials"
  }, {
    label: "FAQ",
    href: "#faq"
  }, {
    label: "Contact",
    href: "#contact"
  }];
  return <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src={kiitMascot} alt="KIIT Buddy" className="w-8 h-8" />
            <div className="font-poppins font-bold text-xl text-gradient">KIIT Saathi</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="text-foreground hover:text-kiit-green transition-colors font-medium flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </button>
            {navItems.map(item => <a key={item.label} href={item.href} className="text-foreground hover:text-kiit-green transition-colors font-medium">
                {item.label}
              </a>)}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button size="sm" className="bg-kiit-green hover:bg-kiit-green-dark text-white">
              <Smartphone className="w-4 h-4 mr-2" />
              Get App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="md:hidden border-t border-white/20 py-4 space-y-4">
            <button onClick={() => {
          navigate('/');
          setIsOpen(false);
        }} className="w-full text-left text-foreground hover:text-kiit-green transition-colors font-medium py-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </button>
            {navItems.map(item => <a key={item.label} href={item.href} className="block text-foreground hover:text-kiit-green transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                {item.label}
              </a>)}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
              <Button variant="outline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="bg-kiit-green hover:bg-kiit-green-dark text-white">
                <Smartphone className="w-4 h-4 mr-2" />
                Get App
              </Button>
            </div>
          </div>}
      </div>
    </nav>;
};