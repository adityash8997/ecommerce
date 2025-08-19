import { Heart, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import kiitMascot from "@/assets/kiit-mascot.png";
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-gradient-to-br from-kiit-green-dark to-foreground text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={kiitMascot} alt="KIIT Buddy" className="w-10 h-10" />
              <div className="font-poppins font-bold text-2xl">KIIT Saathi</div>
            </div>
            
            <p className="text-white/80 leading-relaxed mb-6 max-w-md">
              Your favorite senior in app form. We're here to make campus life easier, 
              one service at a time. Because KIIT life is hectic enough already! 🎓
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#services" className="text-white/80 hover:text-white transition-colors">Services</a></li>
              <li><a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="text-white/80 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#faq" className="text-white/80 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-campus-orange" />
                <span className="text-white/80">+91 99999 88888</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-campus-orange" />
                <span className="text-white/80">help@kiitbuddy.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-campus-orange mt-1" />
                <span className="text-white/80">
                  Campus 1, KIIT University<br />
                  Bhubaneswar, Odisha
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span> Important Disclaimer
            </h4>
            <p className="text-white/80 text-sm leading-relaxed">KIIT Saathi is an independent student-run initiative and is not officially affiliated with KIIT University. We are students serving fellow students with campus-related services. All academic assistance is meant to supplement learning, not replace it. Use responsibly! The university name and logos are used for identification purposes only.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-white/80 text-sm">
            © {currentYear} KIIT Buddy. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2 text-white/80 text-sm mt-4 sm:mt-0">
            Made with <Heart className="w-4 h-4 text-red-400" /> by KIIT students, for KIIT students
          </div>
        </div>
      </div>
    </footer>;
};