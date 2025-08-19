import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Users, 
  Calculator, 
  TrendingUp, 
  ArrowLeft, 
  Receipt, 
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Settings
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Group {
  id: string;
  name: string;
  description: string;
  currency: string;
}

interface Member {
  id: string;
  name: string;
  email_phone: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes: string;
  paid_by_member: Member;
}

const GroupDashboard = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    paid_by_member_id: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    split_type: "equal"
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (groupId) {
      loadGroupData();
    }
  }, [groupId, user]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (groupError) throw groupError;
      setGroup(groupData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);
      
      if (membersError) throw membersError;
      setMembers(membersData);

      // Load expenses with member details
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          paid_by_member:group_members(*)
        `)
        .eq('group_id', groupId)
        .order('date', { ascending: false });
      
      if (expensesError) throw expensesError;
      setExpenses(expensesData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.paid_by_member_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: groupId,
          title: expenseForm.title,
          amount: parseFloat(expenseForm.amount),
          paid_by_member_id: expenseForm.paid_by_member_id,
          date: expenseForm.date,
          notes: expenseForm.notes
        })
        .select(`
          *,
          paid_by_member:group_members(*)
        `)
        .single();

      if (expenseError) throw expenseError;

      // Add expense splits (equal split for now)
      const splitAmount = parseFloat(expenseForm.amount) / members.length;
      const splits = members.map(member => ({
        expense_id: expense.id,
        member_id: member.id,
        amount: splitAmount
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits);

      if (splitsError) throw splitsError;

      toast({
        title: "Expense Added! 💰",
        description: `${expenseForm.title} has been added to the group.`
      });

      setIsAddingExpense(false);
      setExpenseForm({
        title: "",
        amount: "",
        paid_by_member_id: "",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        split_type: "equal"
      });
      
      loadGroupData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgPerPerson = members.length > 0 ? totalExpenses / members.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading group data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="pt-24 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
          <Button onClick={() => navigate('/split-saathi')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SplitSaathi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/split-saathi')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                {group.description && (
                  <p className="text-muted-foreground">{group.description}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {group.currency}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.currency}{totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Avg per Person</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.currency}{avgPerPerson.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Record a new expense for the group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expenseTitle">Title *</Label>
                    <Input
                      id="expenseTitle"
                      placeholder="e.g., Dinner at CCD, Uber fare, Movie tickets"
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paidBy">Paid by *</Label>
                    <Select value={expenseForm.paid_by_member_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paid_by_member_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who paid" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details..."
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={addExpense} className="flex-1">Add Expense</Button>
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Balances
            </Button>
            
            <Button variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Simplify Debts
            </Button>
            
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
            
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Group Settings
            </Button>
          </div>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Expenses
              </CardTitle>
              <CardDescription>
                All group expenses in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first group expense</p>
                  <Button onClick={() => setIsAddingExpense(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{expense.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                            <span>Paid by {expense.paid_by_member.name}</span>
                            {expense.notes && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Notes
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{group.currency}{expense.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.currency}{(expense.amount / members.length).toFixed(2)} per person
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;