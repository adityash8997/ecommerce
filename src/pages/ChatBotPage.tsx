import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Bot, MessageCircle, Zap, Clock, BookOpen } from "lucide-react";
import kiitMascot from "@/assets/kiit-mascot.png";

const ChatBotPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 👋 I'm your KIIT Buddy. What can I help you with today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);

  const sampleQuestions = [
    "How do I book a carton for hostel move?",
    "Where's the nearest printer?", 
    "Which seniors are available for mentoring?",
    "What's happening in campus today?",
    "Help me find my lost ID card",
    "How to join societies?",
    "What are the mess timings?",
    "Where is the library located?"
  ];

  const handleSampleClick = (question: string) => {
    setMessage(question);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thanks for your question! I'm working on getting you the best answer. This AI assistant is currently under development, but I'll be able to help you with all your KIIT-related queries soon! 🤖",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={kiitMascot} alt="KIIT Buddy" className="w-12 h-12" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              AI Campus Assistant
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Your 24/7 KIIT Buddy 🤖
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get instant answers about campus life, services, and everything KIIT. 
            From finding your way around to booking services - I'm here to help!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">24/7 Available</CardTitle>
                <CardDescription>Get help anytime, day or night</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Instant Responses</CardTitle>
                <CardDescription>Quick answers to your queries</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Campus Expert</CardTitle>
                <CardDescription>Knows everything about KIIT</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Friendly Chat</CardTitle>
                <CardDescription>Natural conversation interface</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-kiit-green to-campus-blue text-white">
              <div className="flex items-center gap-3">
                <img src={kiitMascot} alt="KIIT Buddy" className="w-10 h-10" />
                <div>
                  <CardTitle className="text-white">KIIT Saathi Assistant</CardTitle>
                  <CardDescription className="text-white/80">
                    Your friendly campus companion
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-muted/30">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] ${msg.isBot ? 'flex items-start gap-2' : ''}`}>
                        {msg.isBot && (
                          <img src={kiitMascot} alt="KIIT Buddy" className="w-6 h-6 mt-1" />
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            msg.isBot
                              ? 'bg-white shadow-sm text-foreground'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sample Questions */}
              <div className="p-4 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Try asking about:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleClick(question)}
                      className="text-left p-2 text-xs bg-background hover:bg-muted rounded-lg transition-colors border"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about KIIT campus..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} className="bg-kiit-green hover:bg-kiit-green-dark">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChatBotPage;