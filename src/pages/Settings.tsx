import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Settings2, Package, Edit2, FileSpreadsheet, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import logo from "@/assets/sps-logo.png";
import * as XLSX from 'xlsx';
import { getAllBillRecords, loadBillRecords, StoredBillRecord } from "@/lib/billStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    code: "",
    description: "",
    price: "",
    category: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [billRecords, setBillRecords] = useState<StoredBillRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    const savedProducts = localStorage.getItem("customProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    // Load bill records
    loadBillRecords();
    setBillRecords(getAllBillRecords());
    
    // Listen for new bills being added
    const handleBillsUpdated = () => {
      setBillRecords(getAllBillRecords());
    };
    
    window.addEventListener('billsUpdated', handleBillsUpdated);
    
    return () => {
      window.removeEventListener('billsUpdated', handleBillsUpdated);
    };
  }, []);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.code || !newProduct.description || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (products.some((p) => p.code === newProduct.code.toUpperCase())) {
      toast({
        title: "Duplicate Code",
        description: "A product with this code already exists",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      code: newProduct.code.toUpperCase(),
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category || "Custom",
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem("customProducts", JSON.stringify(updatedProducts));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("productsUpdated"));

    toast({
      title: "Product Added",
      description: `${product.code} - ${product.description} added successfully`,
    });

    setNewProduct({ code: "", description: "", price: "", category: "" });
  };

  const handleDeleteProduct = (code: string) => {
    const updatedProducts = products.filter((p) => p.code !== code);
    setProducts(updatedProducts);
    localStorage.setItem("customProducts", JSON.stringify(updatedProducts));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("productsUpdated"));

    toast({
      title: "Product Deleted",
      description: "Product removed successfully",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map((p) =>
      p.code === editingProduct.code ? editingProduct : p
    );
    setProducts(updatedProducts);
    localStorage.setItem("customProducts", JSON.stringify(updatedProducts));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("productsUpdated"));

    toast({
      title: "Product Updated",
      description: "Product details updated successfully",
    });

    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleExportExcel = () => {
    if (billRecords.length === 0) {
      toast({
        title: "No Data",
        description: "No bill records available to export",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const excelData = billRecords.map(record => ({
      'Bill No': record.billNo,
      'Date': record.date,
      'Customer': record.customer,
      'Phone': record.phone,
      'Payment Mode': record.paymentMode,
      'Subtotal': record.subtotal.toFixed(2),
      'Discount': record.discount.toFixed(2),
      'Total': record.total.toFixed(2),
      'Items': record.items.map(item => `${item.name} (${item.qty}x${item.price})`).join(', '),
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 },  // Bill No
      { wch: 12 },  // Date
      { wch: 20 },  // Customer
      { wch: 15 },  // Phone
      { wch: 15 },  // Payment Mode
      { wch: 12 },  // Subtotal
      { wch: 12 },  // Discount
      { wch: 12 },  // Total
      { wch: 60 },  // Items
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bill Records');

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `Bill_Records_${today}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    toast({
      title: "Success!",
      description: `Excel file exported as ${filename}`,
    });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = billRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(billRecords.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={logo} alt="SPS Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">Product Configuration</p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="hover:scale-105 transition-transform"
          >
            Logout
          </Button>
        </div>

        {/* Excel Export and Bills Table */}
        <div className="mb-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  SPS Bill Records
                </CardTitle>
                <Button
                  onClick={handleExportExcel}
                  disabled={billRecords.length === 0}
                  className="bg-white text-green-600 hover:bg-gray-100 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {billRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bill records saved yet</p>
                  <p className="text-sm">Bills will appear here after PDF download</p>
                </div>
              ) : (
                <div>
                  {/* Table for larger screens */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Bill No</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Payment Mode</th>
                          <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.map((record, index) => (
                          <tr 
                            key={`${record.billNo}-${index}`}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-primary">{record.billNo}</td>
                            <td className="py-3 px-4">{record.date}</td>
                            <td className="py-3 px-4">{record.paymentMode}</td>
                            <td className="py-3 px-4 text-right font-semibold">₹{record.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards for mobile screens */}
                  <div className="md:hidden space-y-3">
                    {currentRecords.map((record, index) => (
                      <div 
                        key={`${record.billNo}-${index}`}
                        className="p-4 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-primary">{record.billNo}</span>
                          <span className="text-sm text-muted-foreground">{record.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{record.paymentMode}</span>
                          <span className="font-semibold text-lg">₹{record.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="hover:scale-105 transition-transform"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="hover:scale-105 transition-transform"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Product Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="code">Product Code *</Label>
                  <Input
                    id="code"
                    value={newProduct.code}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., TS10"
                    required
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    placeholder="e.g., T-shirt - Custom Design"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="e.g., 299.99"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="e.g., T-shirts"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary to-[hsl(210,100%,50%)] text-white">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Custom Products ({products.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom products added yet</p>
                  <p className="text-sm">Add your first product using the form</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.code}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 border border-border hover:shadow-md"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">{product.code}</span>
                          <span className="text-sm text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{product.description}</p>
                        <p className="text-lg font-semibold text-foreground mt-1">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={editDialogOpen && editingProduct?.code === product.code} onOpenChange={(open) => {
                          setEditDialogOpen(open);
                          if (!open) setEditingProduct(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                              className="hover:scale-105 transition-transform hover:bg-primary/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label htmlFor="edit-code">Product Code</Label>
                                <Input
                                  id="edit-code"
                                  value={editingProduct?.code || ""}
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                  id="edit-description"
                                  value={editingProduct?.description || ""}
                                  onChange={(e) =>
                                    setEditingProduct(
                                      editingProduct
                                        ? { ...editingProduct, description: e.target.value }
                                        : null
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-price">Price</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingProduct?.price || ""}
                                  onChange={(e) =>
                                    setEditingProduct(
                                      editingProduct
                                        ? { ...editingProduct, price: parseFloat(e.target.value) }
                                        : null
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Input
                                  id="edit-category"
                                  value={editingProduct?.category || ""}
                                  onChange={(e) =>
                                    setEditingProduct(
                                      editingProduct
                                        ? { ...editingProduct, category: e.target.value }
                                        : null
                                    )
                                  }
                                />
                              </div>
                              <Button
                                onClick={handleUpdateProduct}
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                              >
                                Update Product
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.code)}
                          className="hover:scale-105 transition-transform"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default Settings;
