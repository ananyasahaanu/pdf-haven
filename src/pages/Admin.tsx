import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Edit, Package, Plus, ShoppingBag, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockOrders = [
  { id: "ORD001", user: "user@demo.com", product: "Mastering Python Programming", amount: 29.99, date: "2024-03-15", method: "bKash" },
  { id: "ORD002", user: "john@example.com", product: "UI/UX Design Fundamentals", amount: 24.99, date: "2024-03-14", method: "Card" },
  { id: "ORD003", user: "sarah@example.com", product: "Machine Learning Essentials", amount: 49.99, date: "2024-03-13", method: "Nagad" },
  { id: "ORD004", user: "user@demo.com", product: "Digital Marketing Mastery", amount: 34.99, date: "2024-03-12", method: "bKash" },
];

export default function Admin() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Product added!", description: "New PDF has been added to the store." });
    setAddDialogOpen(false);
  };

  const handleDelete = (title: string) => {
    toast({ title: "Product deleted", description: `"${title}" has been removed.`, variant: "destructive" });
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage products and orders</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground border-0">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Add New PDF</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="PDF Title" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the PDF..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" step="0.01" placeholder="29.99" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input placeholder="Programming" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input placeholder="Author name" required />
                </div>
                <div className="space-y-2">
                  <Label>Preview Pages</Label>
                  <Input type="number" placeholder="5" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drag to upload cover</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF File</Label>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drag to upload PDF</span>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-bg text-primary-foreground border-0">
                Add Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Package className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{products.length}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <ShoppingBag className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{mockOrders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <BookOpen className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">
                ${mockOrders.reduce((acc, o) => acc + o.amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.coverImage}
                          alt={product.title}
                          className="h-12 w-8 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium text-sm">{product.title}</div>
                          <div className="text-xs text-muted-foreground">{product.author}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
                    <TableCell className="font-medium">${product.price}</TableCell>
                    <TableCell>{product.pages}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(product.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>{order.user}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                    <TableCell><Badge variant="outline">{order.method}</Badge></TableCell>
                    <TableCell className="font-medium">${order.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
