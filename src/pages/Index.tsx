import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Receipt, ShoppingBag, Settings, LogOut, FileText, User, Download } from "lucide-react";
import { products as defaultProducts, getProductByCode, Product } from "@/data/products";
import { generateBillPDF, BillData, BillItem } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/sps-logo.png";
import { addBillRecord, loadBillRecords } from "@/lib/billStore";

interface ProductLine {
  id: string;
  code: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billNumber, setBillNumber] = useState("SPS01");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online");
  const [productLines, setProductLines] = useState<ProductLine[]>([
    { id: "1", code: "", description: "", quantity: 1, price: 0, total: 0 },
  ]);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [products, setProducts] = useState<Product[]>(defaultProducts);

  const billDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Load bill number and custom products from localStorage
  useEffect(() => {
    // Load bill records from localStorage
    loadBillRecords();
    
    const savedBillNumber = localStorage.getItem("lastBillNumber");
    if (savedBillNumber) {
      const numPart = parseInt(savedBillNumber.replace("SPS", ""));
      const nextNum = (numPart + 1).toString().padStart(2, "0");
      setBillNumber(`SPS${nextNum}`);
    }

    const loadCustomProducts = () => {
      const savedProducts = localStorage.getItem("customProducts");
      if (savedProducts) {
        const customProducts = JSON.parse(savedProducts);
        setProducts([...defaultProducts, ...customProducts]);
      }
    };

    loadCustomProducts();

    // Listen for storage changes to dynamically update product list
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key === "customProducts") {
        loadCustomProducts();
      } else if (e.type === "productsUpdated") {
        loadCustomProducts();
      }
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener("productsUpdated", handleStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange as EventListener);
      window.removeEventListener("productsUpdated", handleStorageChange as EventListener);
    };
  }, []);

  const calculateSubtotal = () => {
    return productLines.reduce((sum, line) => sum + line.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + shippingCharge - discount;
  };

  const handleProductCodeChange = (lineId: string, code: string) => {
    const product = products.find((p) => p.code === code);
    if (product) {
      setProductLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                code,
                description: product.description,
                price: product.price,
                total: line.quantity * product.price,
              }
            : line
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleQuantityChange = (lineId: string, quantity: number) => {
    setProductLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, quantity, total: quantity * line.price }
          : line
      )
    );
  };

  const addProductLine = () => {
    const newId = Date.now().toString();
    setProductLines((prev) => [
      ...prev,
      { id: newId, code: "", description: "", quantity: 1, price: 0, total: 0 },
    ]);
  };

  const removeProductLine = (lineId: string) => {
    if (productLines.length > 1) {
      setProductLines((prev) => prev.filter((line) => line.id !== lineId));
    }
  };

  const handleGeneratePDF = async () => {
    // Validation
    if (!customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    const validProducts = productLines.filter((line) => line.code && line.quantity > 0);
    if (validProducts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    const billItems: BillItem[] = validProducts.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      price: line.price,
      total: line.total,
    }));

    const billData: BillData = {
      billNumber,
      billDate,
      customerName,
      customerPhone,
      paymentMode,
      items: billItems,
      shippingCharge,
      discount,
      totalAmount: calculateTotal(),
    };

    try {
      await generateBillPDF(billData, logo);
      
      // Save bill record to global array
      addBillRecord({
        billNo: billNumber,
        date: billDate,
        customer: customerName,
        phone: customerPhone,
        paymentMode,
        subtotal: calculateSubtotal(),
        discount,
        total: calculateTotal(),
        items: validProducts.map(line => ({
          name: line.description,
          qty: line.quantity,
          price: line.price,
        })),
      });
      
      // Update bill number
      localStorage.setItem("lastBillNumber", billNumber);
      const numPart = parseInt(billNumber.replace("SPS", ""));
      const nextNum = (numPart + 1).toString().padStart(2, "0");
      setBillNumber(`SPS${nextNum}`);

      toast({
        title: "Success!",
        description: "Bill PDF generated successfully",
      });

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setProductLines([
        { id: Date.now().toString(), code: "", description: "", quantity: 1, price: 0, total: 0 },
      ]);
      setShippingCharge(0);
      setDiscount(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={logo} alt="SPS Sports Wear" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SPS SPORTS WEAR
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">Billing System</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
              className="hover:scale-105 transition-transform"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleLogout}
              className="hover:scale-105 transition-transform"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Bill Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bill Details */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/20 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 bg-gradient-to-br from-background to-muted/30">
                <div className="space-y-2 animate-scale-in">
                  <Label htmlFor="billNumber" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">🧾</span> Bill Number
                  </Label>
                  <Input
                    id="billNumber"
                    value={billNumber}
                    readOnly
                    className="font-bold bg-muted border-2 border-muted hover:border-primary/30 transition-colors"
                  />
                </div>
                <div className="space-y-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="billDate" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">📅</span> Bill Date
                  </Label>
                  <Input 
                    id="billDate" 
                    value={billDate} 
                    readOnly 
                    className="bg-muted border-2 border-muted hover:border-primary/30 transition-colors" 
                  />
                </div>
                <div className="space-y-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="paymentMode" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">💳</span> Payment Mode
                  </Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger id="paymentMode" className="border-2 border-muted focus:border-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-2">
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-secondary/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="bg-gradient-to-r from-secondary via-secondary/90 to-[hsl(210,100%,50%)] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <User className="h-5 w-5" />
                  </div>
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 bg-gradient-to-br from-background to-muted/30">
                <div className="space-y-2 animate-scale-in">
                  <Label htmlFor="customerName" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">👤</span> Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="border-2 border-muted focus:border-secondary transition-colors"
                  />
                </div>
                <div className="space-y-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="customerPhone" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">📱</span> Phone Number
                  </Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    type="tel"
                    className="border-2 border-muted focus:border-secondary transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="shadow-lg border-2 border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="bg-gradient-to-r from-accent/20 to-accent/10 border-b-2 border-accent/20">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <span className="text-lg">💰</span> Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground font-medium">Subtotal:</span>
                  <span className="font-semibold text-foreground">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">🚚</span> Shipping Charge
                  </Label>
                  <Input
                    id="shipping"
                    type="number"
                    value={shippingCharge || ""}
                    onChange={(e) => setShippingCharge(Number(e.target.value) || 0)}
                    placeholder="Enter the Amount"
                    min="0"
                    step="0.01"
                    className="border-2 border-muted focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">🏷️</span> Discount
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="Enter the Amount"
                    min="0"
                    step="0.01"
                    className="border-2 border-muted focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="pt-4 mt-2 border-t-2 border-primary/30">
                  <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                    <span className="text-lg font-bold text-primary">Total Payable:</span>
                    <span className="text-2xl font-bold text-primary animate-scale-in">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Products */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground pb-2 border-b">
                    <div className="col-span-3">Product Code</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Product Lines */}
                  {productLines.map((line) => (
                    <div
                      key={line.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="md:col-span-3">
                        <Label className="md:hidden text-xs">Product Code</Label>
                        <Select
                          value={line.code}
                          onValueChange={(value) => handleProductCodeChange(line.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select code" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.code} value={product.code}>
                                {product.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="md:hidden text-xs">Description</Label>
                        <Input value={line.description} readOnly className="bg-background" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="md:hidden text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={line.quantity}
                          onChange={(e) =>
                            handleQuantityChange(line.id, Number(e.target.value) || 1)
                          }
                          min="1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="md:hidden text-xs">Total</Label>
                        <Input
                          value={`₹${line.total.toFixed(2)}`}
                          readOnly
                          className="font-bold bg-background"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeProductLine(line.id)}
                          disabled={productLines.length === 1}
                          className="w-full md:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Product Button */}
                  <Button
                    onClick={addProductLine}
                    variant="outline"
                    size="sm"
                    className="border-2 border-dashed border-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {/* Download PDF Button */}
                <div className="mt-8">
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={productLines.length === 0}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SPS SPORTS WEAR - Near HP Petrol Bunk (Erode Main Road)</p>
          <p>Nathakadaiyur, Kangayam (Po), Tiruppur (Dt) – 638108</p>
          <p>Phone: 9698786494</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
