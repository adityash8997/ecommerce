import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [shouldAutoClose, setShouldAutoClose] = useState(true);

  useEffect(() => {
    // Show bell after page loads (1.5s delay)
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    // Auto-show panel after bell appears
    if (isVisible && !isPanelOpen) {
      const panelTimer = setTimeout(() => {
        setIsPanelOpen(true);
        setShouldAutoClose(true);
      }, 800);

      return () => clearTimeout(panelTimer);
    }
  }, [isVisible, isPanelOpen]);

  useEffect(() => {
    // Auto-close panel after 8 seconds (only if it should auto-close)
    if (isPanelOpen && shouldAutoClose) {
      const closeTimer = setTimeout(() => {
        setIsPanelOpen(false);
      }, 8000);

      return () => clearTimeout(closeTimer);
    }
  }, [isPanelOpen, shouldAutoClose]);

  const handleBellClick = () => {
    setIsPanelOpen(!isPanelOpen);
    setShouldAutoClose(false); // Disable auto-close when manually clicked
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setShouldAutoClose(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className={`
          relative bg-gradient-primary text-white p-3 rounded-full shadow-elegant
          transition-all duration-500 hover:scale-110 hover:shadow-glow
          ${isVisible ? 'animate-[bounceIn_0.8s_ease-out]' : ''}
        `}
        style={{
          animation: isVisible ? 'dropDown 0.8s ease-out' : undefined
        }}
      >
        <Bell className="w-6 h-6" />
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-kiit-orange rounded-full border-2 border-white">
          <div className="w-full h-full bg-kiit-orange rounded-full animate-ping"></div>
        </div>
      </button>

      {/* Events Panel */}
      {isPanelOpen && (
        <Card className={`
          absolute top-16 right-0 w-80 md:w-96 glass-card border-primary/20
          transition-all duration-300 animate-scale-in shadow-elegant
          ${isPanelOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gradient flex items-center gap-2">
                🔔 Upcoming Events
              </h3>
              <button
                onClick={handleClosePanel}
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`
                    p-3 rounded-lg bg-gradient-to-r from-background/50 to-accent/30
                    border border-primary/10 hover:border-primary/30 transition-all
                    hover:scale-[1.02] cursor-pointer group
                    animate-fade-in
                  `}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{event.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-primary/10">
              <p className="text-xs text-center text-muted-foreground">
                ✨ Stay tuned for more exciting campus events!
              </p>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};