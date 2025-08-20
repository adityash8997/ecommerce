import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Heart, Box, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kiitMascot from "@/assets/kiit-mascot.png";
import heroCampus from "@/assets/hero-campus.png";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-campus-orange rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-campus-purple rounded-full animate-float"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-white">
              <Heart className="w-4 h-4 text-campus-orange" />
              Made with love for KIIT students
            </div>

            {/* Main Heading */}
            <div className="space-y-4 my-4">
              <h1 className="text-5xl lg:text-5xl font-poppins font-bold text-white leading-tight">
                One app that
                <span className="block text-white">solves all</span>
                your campus needs
              </h1>

              <p className="text-xl lg:text-2xl text-white/80 font-inter leading-relaxed">
                From assignments to mentorship, hostel moves to campus activities - everything you need, in one platform!
              </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="glass-button text-white font-semibold px-8 py-4 text-lg group"
                onClick={() => navigate('/auth')}
                >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>


            </div>
                </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">18+</div>
                <div className="text-white/70 font-medium">Campus Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-white/70 font-medium">AI Assistant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-white/70 font-medium">KIIT Focused</div>
              </div>
            </div>
          </div>

          {/* Right Content - Mascot and Campus */}
          <div className="relative mt-8">
            {/* Campus Background */}
            <div className="relative">
              <img
                src={heroCampus}
                alt="KIIT Campus Life"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />

              {/* Floating Mascot */}
              {/* <div className="absolute -top-10 -right-10 lg:-right-20">
                <div className="mascot-bounce">
                  <img 
                    src={kiitMascot} 
                    alt="KIIT Buddy - Your Campus Assistant" 
                    className="w-32 h-32 lg:w-48 lg:h-48 drop-shadow-2xl"
                  />
                </div>
              </div> */}

              {/* Floating Elements */}
              <div className="absolute top-6 left-4 backdrop-blur-sm bg-white/20 rounded-lg p-3 shadow-lg animate-float hover:shadow-xl transition-all ">
                <div className="text-sm font-semibold text-kiit-green flex items-center gap-2">
                  <Box width={16} height={16} />
                  Carton Service
                </div>
              </div>

              <div className="absolute bottom-4 right-4 backdrop-blur-sm bg-white/20 rounded-lg p-3 shadow-lg animate-bounce-slow hover:shadow-xl transition-all ">
                <div className="text-sm font-semibold text-campus-blue flex items-center gap-2">
                  <Bot width={16} height={16} />
                  AI Assistant
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div> */}
    </section>
  );
};