import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBookListings } from "@/hooks/useBookListings";
import { useBuybackRequests } from "@/hooks/useBuybackRequests";
import { useAuth } from "@/hooks/useAuth";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { BookOpen, DollarSign, Upload, Search, PlusCircle, ShoppingCart, Clock, CheckCircle, AlertCircle, Trash2, Eye } from "lucide-react";

export default function BookBuybackSell() {
  const { user } = useAuth();
  const { 
    submitListing, 
    fetchListings, 
    deleteListing, 
    markAsSold, 
    listings, 
    isSubmitting: isListingSubmitting, 
    isLoading: isListingsLoading 
  } = useBookListings();
  
  const { 
    submitBuybackRequest, 
    fetchMyRequests, 
    calculateEstimatedPrice, 
    getStatusColor, 
    getStatusDescription,
    requests, 
    isSubmitting: isBuybackSubmitting, 
    isLoading: isRequestsLoading 
  } = useBuybackRequests();

  // Listing form state
  const [listingForm, setListingForm] = useState({
    title: '',
    author: '',
    semester: '',
    condition: '',
    price: '',
    description: '',
    contactInfo: {
      name: '',
      phone: '',
      email: user?.email || '',
      preferredContact: 'phone'
    }
  });

  // Buyback form state
  const [buybackForm, setBuybackForm] = useState({
    books: [{ title: '', author: '', condition: '' }],
    pickupAddress: '',
    contactNumber: '',
    studentName: '',
    rollNumber: '',
    paymentPreference: 'upi'
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setListingForm(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, email: user.email }
      }));
    }
  }, [user]);

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitListing({
        title: listingForm.title,
        author: listingForm.author,
        semester: listingForm.semester ? parseInt(listingForm.semester) : undefined,
        condition: listingForm.condition,
        price: parseFloat(listingForm.price),
        description: listingForm.description,
        contactInfo: listingForm.contactInfo
      });

      // Reset form
      setListingForm({
        title: '',
        author: '',
        semester: '',
        condition: '',
        price: '',
        description: '',
        contactInfo: {
          name: '',
          phone: '',
          email: user?.email || '',
          preferredContact: 'phone'
        }
      });
    } catch (error) {
      console.error('Failed to submit listing:', error);
    }
  };

  const handleBuybackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const booksDetails = buybackForm.books.map(book => ({
      title: book.title,
      author: book.author,
      condition: book.condition,
      estimatedPrice: calculateEstimatedPrice(book.condition)
    }));

    const estimatedTotal = booksDetails.reduce((sum, book) => sum + book.estimatedPrice, 0);

    try {
      await submitBuybackRequest({
        booksDetails,
        estimatedTotal,
        pickupAddress: buybackForm.pickupAddress,
        contactNumber: buybackForm.contactNumber,
        studentName: buybackForm.studentName,
        rollNumber: buybackForm.rollNumber,
        paymentPreference: buybackForm.paymentPreference
      });

      // Reset form
      setBuybackForm({
        books: [{ title: '', author: '', condition: '' }],
        pickupAddress: '',
        contactNumber: '',
        studentName: '',
        rollNumber: '',
        paymentPreference: 'upi'
      });
    } catch (error) {
      console.error('Failed to submit buyback request:', error);
    }
  };

  const addBookToBuyback = () => {
    setBuybackForm(prev => ({
      ...prev,
      books: [...prev.books, { title: '', author: '', condition: '' }]
    }));
  };

  const removeBookFromBuyback = (index: number) => {
    setBuybackForm(prev => ({
      ...prev,
      books: prev.books.filter((_, i) => i !== index)
    }));
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = !selectedSemester || selectedSemester === 'all' || listing.semester?.toString() === selectedSemester;
    const matchesCondition = !selectedCondition || selectedCondition === 'all' || listing.condition === selectedCondition;
    
    return matchesSearch && matchesSemester && matchesCondition;
  });

  return (
    <>
      <Navbar />
      {!user && <GuestBrowsingBanner />}
      
      <main className="min-h-screen pt-20 bg-gradient-to-br from-kiit-green-soft to-white">
        <div className="container mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
              <BookOpen className="w-4 h-4" />
              Book Buyback & Sell Platform
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
              📚 Your Campus Book
              <span className="block">Exchange Hub</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sell your old semester books for a fair price, or buy pre-loved books from seniors. 
              <span className="font-semibold text-kiit-green"> By students, for students.</span>
            </p>
          </div>

          <Tabs defaultValue="browse" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse Books
              </TabsTrigger>
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                List Book
              </TabsTrigger>
              <TabsTrigger value="buyback" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Get Buyback
              </TabsTrigger>
              <TabsTrigger value="my-activity" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                My Activity
              </TabsTrigger>
            </TabsList>

            {/* Browse Books Tab */}
            <TabsContent value="browse" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Browse Available Books
                  </CardTitle>
                  <CardDescription>
                    Find pre-loved books from your seniors at great prices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Search by title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="md:col-span-2"
                    />
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="mint">Mint</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isListingsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))
                    ) : filteredListings.length > 0 ? (
                      filteredListings.map((listing) => (
                        <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                                <Badge variant="secondary" className={`
                                  ${listing.condition === 'mint' ? 'bg-green-100 text-green-800' : ''}
                                  ${listing.condition === 'good' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${listing.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' : ''}
                                `}>
                                  {listing.condition}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">by {listing.author}</p>
                              
                              {listing.semester && (
                                <Badge variant="outline">Semester {listing.semester}</Badge>
                              )}
                              
                              {listing.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {listing.description}
                                </p>
                              )}
                              
                              <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-2xl font-bold text-kiit-green">₹{listing.price}</span>
                                <Button size="sm" className="bg-kiit-green hover:bg-kiit-green/90">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Contact Seller
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No books found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* List Book Tab */}
            <TabsContent value="sell" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    List Your Book for Sale
                  </CardTitle>
                  <CardDescription>
                    Sell your old books to help juniors save money
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleListingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Book Title *</Label>
                          <Input
                            id="title"
                            value={listingForm.title}
                            onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Engineering Mathematics"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="author">Author *</Label>
                          <Input
                            id="author"
                            value={listingForm.author}
                            onChange={(e) => setListingForm(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="e.g., Dr. A.K. Singh"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="semester">Semester</Label>
                            <Select value={listingForm.semester} onValueChange={(value) => setListingForm(prev => ({ ...prev, semester: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6,7,8].map(sem => (
                                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="condition">Condition *</Label>
                            <Select value={listingForm.condition} onValueChange={(value) => setListingForm(prev => ({ ...prev, condition: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mint">Mint - Like new</SelectItem>
                                <SelectItem value="good">Good - Minor wear</SelectItem>
                                <SelectItem value="fair">Fair - Used but readable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Price (₹) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={listingForm.price}
                            onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="300"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={listingForm.description}
                            onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Additional details about the book..."
                            rows={4}
                          />
                        </div>
                        
                        <div>
                          <Label>Contact Information</Label>
                          <div className="space-y-3 p-4 border rounded-lg">
                            <Input
                              placeholder="Your name"
                              value={listingForm.contactInfo.name}
                              onChange={(e) => setListingForm(prev => ({ 
                                ...prev, 
                                contactInfo: { ...prev.contactInfo, name: e.target.value }
                              }))}
                              required
                            />
                            <Input
                              placeholder="Phone number"
                              value={listingForm.contactInfo.phone}
                              onChange={(e) => setListingForm(prev => ({ 
                                ...prev, 
                                contactInfo: { ...prev.contactInfo, phone: e.target.value }
                              }))}
                              required
                            />
                            <Select 
                              value={listingForm.contactInfo.preferredContact} 
                              onValueChange={(value) => setListingForm(prev => ({ 
                                ...prev, 
                                contactInfo: { ...prev.contactInfo, preferredContact: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="phone">Prefer Phone</SelectItem>
                                <SelectItem value="email">Prefer Email</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isListingSubmitting || !user} className="w-full bg-kiit-green hover:bg-kiit-green/90">
                      {isListingSubmitting ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Listing Book...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          List Book for Sale
                        </>
                      )}
                    </Button>
                    
                    {!user && (
                      <p className="text-sm text-muted-foreground text-center">
                        Please sign in to list books for sale
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buyback Tab */}
            <TabsContent value="buyback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Request Book Buyback
                  </CardTitle>
                  <CardDescription>
                    Get cash for your old books - we'll evaluate and make you an offer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBuybackSubmit} className="space-y-6">
                    <div>
                      <Label>Books to Sell</Label>
                      <div className="space-y-4">
                        {buybackForm.books.map((book, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                            <Input
                              placeholder="Book title"
                              value={book.title}
                              onChange={(e) => {
                                const newBooks = [...buybackForm.books];
                                newBooks[index].title = e.target.value;
                                setBuybackForm(prev => ({ ...prev, books: newBooks }));
                              }}
                              required
                            />
                            <Input
                              placeholder="Author"
                              value={book.author}
                              onChange={(e) => {
                                const newBooks = [...buybackForm.books];
                                newBooks[index].author = e.target.value;
                                setBuybackForm(prev => ({ ...prev, books: newBooks }));
                              }}
                              required
                            />
                            <Select 
                              value={book.condition} 
                              onValueChange={(value) => {
                                const newBooks = [...buybackForm.books];
                                newBooks[index].condition = value;
                                setBuybackForm(prev => ({ ...prev, books: newBooks }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mint">Mint (₹{calculateEstimatedPrice('mint')})</SelectItem>
                                <SelectItem value="good">Good (₹{calculateEstimatedPrice('good')})</SelectItem>
                                <SelectItem value="fair">Fair (₹{calculateEstimatedPrice('fair')})</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              {book.condition && (
                                <Badge variant="secondary">
                                  Est. ₹{calculateEstimatedPrice(book.condition)}
                                </Badge>
                              )}
                              {buybackForm.books.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeBookFromBuyback(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addBookToBuyback}>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Another Book
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="studentName">Full Name *</Label>
                          <Input
                            id="studentName"
                            value={buybackForm.studentName}
                            onChange={(e) => setBuybackForm(prev => ({ ...prev, studentName: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="rollNumber">Roll Number *</Label>
                          <Input
                            id="rollNumber"
                            value={buybackForm.rollNumber}
                            onChange={(e) => setBuybackForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="contactNumber">Contact Number *</Label>
                          <Input
                            id="contactNumber"
                            value={buybackForm.contactNumber}
                            onChange={(e) => setBuybackForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="pickupAddress">Pickup Address *</Label>
                          <Textarea
                            id="pickupAddress"
                            value={buybackForm.pickupAddress}
                            onChange={(e) => setBuybackForm(prev => ({ ...prev, pickupAddress: e.target.value }))}
                            placeholder="Hostel name, room number, landmark..."
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="paymentPreference">Payment Method *</Label>
                          <Select value={buybackForm.paymentPreference} onValueChange={(value) => setBuybackForm(prev => ({ ...prev, paymentPreference: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upi">UPI Payment</SelectItem>
                              <SelectItem value="cash">Cash on Pickup</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isBuybackSubmitting || !user} className="w-full bg-kiit-green hover:bg-kiit-green/90">
                      {isBuybackSubmitting ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Submit Buyback Request
                        </>
                      )}
                    </Button>
                    
                    {!user && (
                      <p className="text-sm text-muted-foreground text-center">
                        Please sign in to submit buyback requests
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Activity Tab */}
            <TabsContent value="my-activity" className="space-y-6">
              {user ? (
                <>
                  {/* My Buyback Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        My Buyback Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isRequestsLoading ? (
                        <div className="text-center py-8">Loading...</div>
                      ) : requests.length > 0 ? (
                        <div className="space-y-4">
                          {requests.map((request) => (
                            <Card key={request.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-semibold">Request #{request.id.slice(0, 8)}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted on {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-4">
                                  {getStatusDescription(request.status)}
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Books:</span> {request.booksDetails.length}
                                  </div>
                                  <div>
                                    <span className="font-medium">Estimated:</span> ₹{request.estimatedTotal}
                                  </div>
                                  {request.final_amount && (
                                    <div>
                                      <span className="font-medium">Final Amount:</span> ₹{request.final_amount}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">Payment:</span> {request.paymentPreference}
                                  </div>
                                </div>
                                
                                {request.admin_notes && (
                                  <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <p className="text-sm"><strong>Admin Notes:</strong> {request.admin_notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No buyback requests yet</h3>
                          <p className="text-muted-foreground">Submit your first buyback request to get started</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* My Listings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        My Book Listings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* This would show user's own listings */}
                      <div className="text-center py-8">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                        <p className="text-muted-foreground">Create your first book listing to start selling</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
                    <p className="text-muted-foreground">Please sign in to view your activity</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
}