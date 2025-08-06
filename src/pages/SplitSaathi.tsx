import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Calculator, PieChart, Receipt, Heart, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SplitSaathi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    currency: "₹",
    members: [{ name: "", email_phone: "" }]
  });

  const addMember = () => {
    setGroupForm(prev => ({
      ...prev,
      members: [...prev.members, { name: "", email_phone: "" }]
    }));
  };

  const removeMember = (index: number) => {
    setGroupForm(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const updateMember = (index: number, field: string, value: string) => {
    setGroupForm(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const createGroup = async () => {
    if (!groupForm.name.trim() || groupForm.members.filter(m => m.name.trim()).length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide group name and at least one member.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupForm.name,
          description: groupForm.description,
          currency: groupForm.currency
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add members
      const validMembers = groupForm.members.filter(m => m.name.trim() && m.email_phone.trim());
      const { error: membersError } = await supabase
        .from('group_members')
        .insert(
          validMembers.map(member => ({
            group_id: group.id,
            name: member.name,
            email_phone: member.email_phone
          }))
        );

      if (membersError) throw membersError;

      toast({
        title: "Group Created! 🎉",
        description: `${groupForm.name} is ready for expense tracking.`
      });

      // Navigate to group dashboard
      navigate(`/split-saathi/group/${group.id}`);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="inline-flex items-center gap-2 mb-4">
            <Receipt className="w-8 h-8 text-primary" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              SplitSaathi
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Split Expenses, Not Friendships 💰
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Manage hostel bills, fest contributions, trips, and society spending effortlessly. 
            Because friendship shouldn't cost you your peace of mind! 😌
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setIsCreatingGroup(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create a Group
            </Button>
            <Button size="lg" variant="outline">
              <Users className="w-5 h-5 mr-2" />
              View My Groups
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Students Love SplitSaathi? 🚀</h2>
            <p className="text-lg text-muted-foreground">Built specifically for college life and group adventures</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Calculator className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Smart Calculations</CardTitle>
                <CardDescription>
                  No more mental math! Split bills equally or customize shares for any scenario.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <PieChart className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Visual Insights</CardTitle>
                <CardDescription>
                  See where your money goes with beautiful charts and spending summaries.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Group Harmony</CardTitle>
                <CardDescription>
                  Keep track of who owes what, settle debts, and maintain friendship goals.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Create Group Form */}
      {isCreatingGroup && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Group
                </CardTitle>
                <CardDescription>
                  Start tracking expenses with your friends, roommates, or society members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Hostel Room 420, Tech Fest Committee, Goa Trip Gang"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the group or purpose"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={groupForm.currency}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-20"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Add Members</Label>
                  {groupForm.members.map((member, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Email/Phone"
                          value={member.email_phone}
                          onChange={(e) => updateMember(index, 'email_phone', e.target.value)}
                        />
                      </div>
                      {groupForm.members.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMember}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Member
                  </Button>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button onClick={createGroup} className="flex-1">
                    Create Group & Start Tracking
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingGroup(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Common Use Cases */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect for Every College Scenario 🎓</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">🏠 Hostel Life</h3>
              <p className="text-muted-foreground">Room groceries, electricity bills, cleaning supplies, late-night food orders</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">🎉 Fest & Events</h3>
              <p className="text-muted-foreground">Committee expenses, decoration costs, team meals, celebration parties</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">✈️ Trips & Outings</h3>
              <p className="text-muted-foreground">Transportation, accommodation, meals, activities, souvenirs</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2">📚 Study Groups</h3>
              <p className="text-muted-foreground">Reference books, printing costs, cafe study sessions, project materials</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Button variant="link" onClick={() => navigate('/')}>Home</Button>
            <Button variant="link" onClick={() => navigate('/carton-transfer')}>Carton Transfer</Button>
            <Button variant="link" onClick={() => navigate('/senior-connect')}>Senior Connect</Button>
            <Button variant="link" onClick={() => navigate('/lost-and-found')}>Lost & Found</Button>
          </div>
          
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500" /> for KIIT Students by KIIT Saathi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SplitSaathi;