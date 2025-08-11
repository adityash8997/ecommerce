import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Automatrix2.0 Agentic AI Workshop",
    date: "This Saturday, 16 Aug",
    time: "10:00 AM",
    emoji: "🤖"
  },
  {
    id: 2,
    title: "Fed Hackathon",
    date: "Saturday",
    time: "10:00 AM",
    emoji: "💻"
  },
  {
    id: 3,
    title: "Cultural Night - Music & Dance",
    date: "Sunday, 17 Aug",
    time: "6:00 PM",
    emoji: "🎵"
  },
  {
    id: 4,
    title: "Career Fair 2024",
    date: "Monday, 18 Aug",
    time: "9:00 AM",
    emoji: "💼"
  }
];

export const NotificationBell = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventTextVisible, setEventTextVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create soft ding sound using Web Audio API
  const playDingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Handle scroll to hide when past Services section
  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        const isPastServices = rect.bottom < window.innerHeight / 2;
        setShouldShow(!isPastServices);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show bell after page loads
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(showTimer);
  }, []);

  // Handle landing animation and sound
  useEffect(() => {
    if (isVisible && !hasLanded) {
      const landTimer = setTimeout(() => {
        setHasLanded(true);
        playDingSound();
        // Start showing events after landing
        setTimeout(() => {
          setEventTextVisible(true);
        }, 500);
      }, 800); // Match animation duration

      return () => clearTimeout(landTimer);
    }
  }, [isVisible, hasLanded]);

  // Cycle through events
  useEffect(() => {
    if (!hasLanded || !shouldShow) return;

    const cycleEvents = () => {
      // Fade out current event
      setEventTextVisible(false);
      
      setTimeout(() => {
        // Move to next event
        setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
        // Fade in new event
        setEventTextVisible(true);
      }, 300); // Brief pause between events
    };

    // Initial delay, then cycle every 4.3 seconds (4s visible + 0.3s transition)
    const timer = setTimeout(() => {
      const interval = setInterval(cycleEvents, 4300);
      return () => clearInterval(interval);
    }, 4000); // First event shows for 4 seconds

    return () => clearTimeout(timer);
  }, [hasLanded, shouldShow, currentEventIndex]);

  if (!shouldShow) return null;

  const currentEvent = upcomingEvents[currentEventIndex];

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      {/* Bell Icon */}
      <div className="relative flex items-start justify-end">
        <div
          className={`
            relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 
            text-white p-3 rounded-full shadow-lg
            transition-all duration-300 hover:scale-110
            ${isVisible ? 'animate-[dropDown_0.8s_ease-out]' : 'opacity-0 -translate-y-20'}
            ${hasLanded ? 'animate-[bellWiggle_0.5s_ease-in-out_0.8s]' : ''}
          `}
        >
          <Bell className="w-6 h-6" />
          
          {/* Golden glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-500/30 animate-pulse"></div>
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Event Text */}
        {hasLanded && (
          <div 
            className={`
              absolute top-0 right-20 max-w-xs sm:max-w-sm md:max-w-md
              transition-all duration-300 pointer-events-auto
              ${eventTextVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
          >
            <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 
                          rounded-xl p-4 shadow-xl border border-purple-200/50 dark:border-purple-500/20
                          backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{currentEvent.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-purple-800 dark:text-purple-200 leading-tight">
                    {currentEvent.title}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-300 text-sm mt-1">
                    {currentEvent.date} • {currentEvent.time}
                  </p>
                </div>
              </div>
              
              {/* Sparkle decoration */}
              <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse">
                ✨
              </div>
              <div className="absolute -bottom-1 -left-1 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
                💫
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};