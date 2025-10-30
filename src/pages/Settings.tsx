import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Settings2, Package } from "lucide-react";
import { Product } from "@/data/products";
import logo from "@/assets/sps-logo.png";

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

  useEffect(() => {
    const savedProducts = localStorage.getItem("customProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
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

    toast({
      title: "Product Deleted",
      description: "Product removed successfully",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
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
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
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
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.code)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
