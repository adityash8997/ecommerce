import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Search,
  Filter,
  ShoppingCart,
  Star,
  Users,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Package,
  DollarSign,
  Plus,
  Minus,
  X,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { useBookBuyback } from "@/hooks/useBookBuyback";

interface AvailableBook {
  id: string;
  condition: string;
  selling_price: number;
  semester_book: {
    book_name: string;
    author: string;
    edition: string;
    publisher: string;
    semester: number;
  };
}

interface CartItem extends AvailableBook {
  quantity: number;
}

const BuyPrelovedBooks = () => {
  const { user } = useAuth();
  const { bookConditions, fetchAvailableBooks } = useBookBuyback();
  const [availableBooks, setAvailableBooks] = useState<AvailableBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    semester: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const books = await fetchAvailableBooks({
        semester: filters.semester ? parseInt(filters.semester) : undefined,
        condition: filters.condition || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined
      });
      
      // Filter by search term if provided
      const filteredBooks = books.filter((book: AvailableBook) => {
        if (!filters.search) return true;
        const searchTerm = filters.search.toLowerCase();
        return (
          book.semester_book.book_name.toLowerCase().includes(searchTerm) ||
          book.semester_book.author.toLowerCase().includes(searchTerm)
        );
      });
      
      setAvailableBooks(filteredBooks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addToCart = (book: AvailableBook) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === book.id);
      if (existingItem) {
        toast({
          title: "Already in cart",
          description: "This book is already in your cart",
          variant: "destructive"
        });
        return prev;
      }
      
      toast({
        title: "Added to cart! 🛒",
        description: `${book.semester_book.book_name} added to your cart`
      });
      
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(bookId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === bookId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.selling_price * item.quantity), 0);
  };

  const getConditionInfo = (condition: string) => {
    return bookConditions.find(c => c.value === condition) || bookConditions[0];
  };

  const isInCart = (bookId: string) => {
    return cart.some(item => item.id === bookId);
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive"
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some books to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Implement actual checkout flow
    toast({
      title: "Checkout coming soon! 🚀",
      description: "Payment integration will be available soon. For now, contact the sellers directly."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft to-white">
      <Navbar />
      
      {!user && <GuestBrowsingBanner />}
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <BookOpen className="w-4 h-4" />
            📚 Buy Pre-Loved Books
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Give Books a Second Life
            <span className="block text-2xl lg:text-3xl mt-2 text-muted-foreground">
              💙 Affordable, Authentic, Amazing
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Browse through hundreds of pre-loved books from your seniors. 
            Save money, help the environment, and get quality books at student-friendly prices.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Verified Quality
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Student-Friendly Prices
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              By Students, For Students
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Search Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Input
                    placeholder="Search by book name or author..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={filters.semester} onValueChange={(value) => handleFilterChange('semester', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Book Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Conditions</SelectItem>
                    {bookConditions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.emoji} {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  placeholder="Min Price (₹)"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                
                <Input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Books Grid */}
      <section className="px-4 mb-16">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gradient">
              Available Books ({availableBooks.length})
            </h2>
            
            {/* Cart Button */}
            <Button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative bg-gradient-primary text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableBooks.length === 0 ? (
            <Card className="glass-card text-center p-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v) 
                  ? "Try adjusting your filters to see more books"
                  : "Be the first to sell your books and help fellow students!"
                }
              </p>
              <Button onClick={() => setFilters({ semester: '', condition: '', minPrice: '', maxPrice: '', search: '' })}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBooks.map((book) => {
                const conditionInfo = getConditionInfo(book.condition);
                const inCart = isInCart(book.id);
                
                return (
                  <Card key={book.id} className="glass-card group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="text-xs">
                          Semester {book.semester_book.semester}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{conditionInfo.emoji}</div>
                          <div className="text-xs text-muted-foreground">{conditionInfo.label}</div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-kiit-green transition-colors">
                        {book.semester_book.book_name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-muted-foreground mb-4">
                        <p><span className="font-medium">Author:</span> {book.semester_book.author}</p>
                        <p><span className="font-medium">Edition:</span> {book.semester_book.edition}</p>
                        <p><span className="font-medium">Publisher:</span> {book.semester_book.publisher}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-kiit-green">
                          ₹{book.selling_price}
                        </div>
                        
                        <Button
                          onClick={() => addToCart(book)}
                          disabled={inCart}
                          className={`${inCart 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-primary hover:bg-gradient-primary/90'
                          } text-white`}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsCartOpen(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-60 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Shopping Cart</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {item.semester_book.book_name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold">₹{item.selling_price * item.quantity}</div>
                            <div className="text-xs text-muted-foreground">₹{item.selling_price} each</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-kiit-green">₹{getTotalPrice()}</span>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-primary text-white font-semibold py-3"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Why Buy Pre-Loved Books Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-kiit-green-soft to-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Why Buy Pre-Loved Books? 💚
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Make a smart choice for your wallet and the planet
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card text-center p-6">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Save 30-60%</h3>
              <p className="text-sm text-muted-foreground">
                Get the same quality books at student-friendly prices
              </p>
            </Card>
            
            <Card className="glass-card text-center p-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Help Environment</h3>
              <p className="text-sm text-muted-foreground">
                Reduce waste by giving books a second life
              </p>
            </Card>
            
            <Card className="glass-card text-center p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Student Community</h3>
              <p className="text-sm text-muted-foreground">
                Support fellow students and build connections
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BuyPrelovedBooks;