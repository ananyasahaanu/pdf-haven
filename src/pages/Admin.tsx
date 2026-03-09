import { useState, useRef, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, CheckCircle, Edit, FileText, Loader2, Package, Plus, Search, ShoppingBag, Trash2, Upload, XCircle, Clock, Users, Shield, UserMinus, Save, Settings, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables as DbTables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";

export default function Admin() {
  const { isAdmin, isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<DbTables<"uploaded_pdfs"> | null>(null);

  // Search states
  const [pdfSearch, setPdfSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Form state (add)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("");
  const [pages, setPages] = useState("");
  const [uploading, setUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPages, setEditPages] = useState("");
  const [editIsBestseller, setEditIsBestseller] = useState(false);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const editCoverInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  // Fetch uploaded PDFs
  const { data: uploadedPdfs = [] } = useQuery({
    queryKey: ["admin-pdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbTables<"uploaded_pdfs">[];
    },
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch purchase requests
  const { data: purchaseRequests = [] } = useQuery({
    queryKey: ["admin-purchase-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && isAdmin,
  });

  // Filtered lists
  const filteredPdfs = useMemo(() => {
    if (!pdfSearch.trim()) return uploadedPdfs;
    const q = pdfSearch.toLowerCase();
    return uploadedPdfs.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  }, [uploadedPdfs, pdfSearch]);

  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return purchaseRequests;
    const q = orderSearch.toLowerCase();
    return purchaseRequests.filter(r =>
      r.customer_name.toLowerCase().includes(q) ||
      r.customer_mobile.includes(q) ||
      r.product_title.toLowerCase().includes(q) ||
      r.transaction_id.toLowerCase().includes(q)
    );
  }, [purchaseRequests, orderSearch]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (pdf: DbTables<"uploaded_pdfs">) => {
      const pdfPath = pdf.pdf_url.split("/").pop();
      const coverPath = pdf.cover_url?.split("/").pop();
      if (pdfPath) await supabase.storage.from("pdfs").remove([`${pdf.user_id}/${pdfPath}`]);
      if (coverPath) await supabase.storage.from("covers").remove([`${pdf.user_id}/${coverPath}`]);
      const { error } = await supabase.from("uploaded_pdfs").delete().eq("id", pdf.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pdfs"] });
      toast({ title: "Deleted", description: "PDF has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    },
  });

  // Toggle publish
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("uploaded_pdfs").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pdfs"] });
    },
  });

  // Approve/Reject purchase request
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("purchase_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchase-requests"] });
      toast({
        title: variables.status === "approved" ? "অনুমোদিত!" : "প্রত্যাখ্যাত",
        description: variables.status === "approved"
          ? "কাস্টমার এখন ডাউনলোড করতে পারবে।"
          : "রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে।",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "আপডেট করতে সমস্যা হয়েছে।", variant: "destructive" });
    },
  });

  // Fetch all admins
  const { data: adminUsers = [], refetch: refetchAdmins } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role")
        .eq("role", "admin");
      if (error) throw error;
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email");
      return data.map((role) => {
        const profile = profiles?.find((p) => p.id === role.user_id);
        return { ...role, name: profile?.name || "Unknown", email: profile?.email || "Unknown" };
      });
    },
    enabled: isAuthenticated && isAdmin,
  });

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", newAdminEmail.trim())
        .single();
      if (profileError || !profile) {
        toast({ title: "ইউজার পাওয়া যায়নি", description: "এই ইমেইল দিয়ে কোনো ইউজার নিবন্ধিত নেই।", variant: "destructive" });
        return;
      }
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: "admin" });
      if (insertError) {
        if (insertError.code === "23505") {
          toast({ title: "ইতিমধ্যে অ্যাডমিন", variant: "destructive" });
        } else throw insertError;
        return;
      }
      toast({ title: "অ্যাডমিন যোগ হয়েছে!", description: `${newAdminEmail} কে অ্যাডমিন করা হয়েছে।` });
      setNewAdminEmail("");
      refetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (roleId: string, email: string) => {
    if (email === user?.email) {
      toast({ title: "নিজেকে রিমুভ করা যাবে না", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
      toast({ title: "অ্যাডমিন রিমুভ হয়েছে" });
      refetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // CEO Photo
  const ceoPhotoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCeoPhoto, setUploadingCeoPhoto] = useState(false);

  const { data: ceoPhotoUrl, refetch: refetchCeoPhoto } = useQuery({
    queryKey: ["ceo-photo-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "ceo_photo_url").single();
      return data?.value || null;
    },
    enabled: isAuthenticated && isAdmin,
  });

  const handleCeoPhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingCeoPhoto(true);
    try {
      const path = `ceo/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("covers").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);

      // Upsert site_settings
      const { data: existing } = await supabase.from("site_settings").select("key").eq("key", "ceo_photo_url").single();
      if (existing) {
        const { error } = await supabase.from("site_settings").update({ value: urlData.publicUrl }).eq("key", "ceo_photo_url");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert({ key: "ceo_photo_url", value: urlData.publicUrl });
        if (error) throw error;
      }

      toast({ title: "CEO photo updated!", description: "The About page will now show the new photo." });
      refetchCeoPhoto();
      queryClient.invalidateQueries({ queryKey: ["ceo-photo"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingCeoPhoto(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setPrice(""); setOriginalPrice(""); setCategory(""); setPages("");
    setPdfFile(null); setCoverFile(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !user) {
      toast({ title: "PDF file required", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const timestamp = Date.now();
      const pdfPath = `${user.id}/${timestamp}_${pdfFile.name}`;
      const { error: pdfError } = await supabase.storage.from("pdfs").upload(pdfPath, pdfFile);
      if (pdfError) throw pdfError;
      const { data: pdfUrlData } = supabase.storage.from("pdfs").getPublicUrl(pdfPath);

      let coverUrl: string | null = null;
      if (coverFile) {
        const coverPath = `${user.id}/${timestamp}_${coverFile.name}`;
        const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("uploaded_pdfs").insert({
        title,
        description: description || null,
        price: parseFloat(price) || 0,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category: category || "Other",
        pages: parseInt(pages) || null,
        pdf_url: pdfUrlData.publicUrl,
        cover_url: coverUrl,
        user_id: user.id,
        is_published: true,
      });
      if (insertError) throw insertError;

      toast({ title: "PDF uploaded!", description: "New PDF has been added to the store." });
      queryClient.invalidateQueries({ queryKey: ["admin-pdfs"] });
      resetForm();
      setAddDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (pdf: DbTables<"uploaded_pdfs">) => {
    setEditingPdf(pdf);
    setEditTitle(pdf.title);
    setEditDescription(pdf.description || "");
    setEditPrice(String(pdf.price));
    setEditOriginalPrice(pdf.original_price ? String(pdf.original_price) : "");
    setEditCategory(pdf.category);
    setEditPages(pdf.pages ? String(pdf.pages) : "");
    setEditIsBestseller(pdf.is_bestseller);
    setEditIsFeatured(pdf.is_featured);
    setEditCoverFile(null);
    setEditDialogOpen(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingPdf || !user) return;
    setSaving(true);
    try {
      let coverUrl = editingPdf.cover_url;
      if (editCoverFile) {
        const timestamp = Date.now();
        const coverPath = `${user.id}/${timestamp}_${editCoverFile.name}`;
        const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, editCoverFile);
        if (coverError) throw coverError;
        const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      const { error } = await supabase.from("uploaded_pdfs").update({
        title: editTitle,
        description: editDescription || null,
        price: parseFloat(editPrice) || 0,
        original_price: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
        category: editCategory || "Other",
        pages: parseInt(editPages) || null,
        is_bestseller: editIsBestseller,
        is_featured: editIsFeatured,
        cover_url: coverUrl,
      }).eq("id", editingPdf.id);
      if (error) throw error;

      toast({ title: "Updated!", description: "PDF details have been saved." });
      queryClient.invalidateQueries({ queryKey: ["admin-pdfs"] });
      setEditDialogOpen(false);
      setEditingPdf(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const pendingRequests = purchaseRequests.filter((r) => r.status === "pending");

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage products and orders</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground border-0">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-display">Upload New PDF</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PDF Title" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the PDF..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (৳) *</Label>
                    <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Original Price (৳)</Label>
                    <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="49.99" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Programming" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pages</Label>
                    <Input type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  <div onClick={() => coverInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "Click to upload cover image"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>PDF File *</Label>
                  <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                  <div onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{pdfFile ? pdfFile.name : "Click to upload PDF file"}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg text-primary-foreground border-0" disabled={uploading}>
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Add Product"}
                </Button>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent"><Package className="h-6 w-6 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold font-display">{uploadedPdfs.length}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent"><ShoppingBag className="h-6 w-6 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold font-display">{uploadedPdfs.filter(p => p.is_published).length}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent"><Clock className="h-6 w-6 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold font-display">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent"><BookOpen className="h-6 w-6 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold font-display">
                ৳{purchaseRequests.filter(r => r.status === "approved").reduce((acc, o) => acc + Number(o.product_price), 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">
            অর্ডার রিকোয়েস্ট
            {pendingRequests.length > 0 && <Badge variant="destructive" className="ml-2 text-xs">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="products">Uploaded PDFs</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" /> ইউজার ম্যানেজমেন্ট</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4" /> Settings</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders..." className="pl-10" />
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কাস্টমার</TableHead>
                  <TableHead>প্রোডাক্ট</TableHead>
                  <TableHead>পেমেন্ট</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {orderSearch ? "কোনো ম্যাচ পাওয়া যায়নি।" : "কোনো অর্ডার রিকোয়েস্ট নেই।"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{req.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{req.customer_mobile}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm truncate max-w-[150px]">{req.product_title}</div>
                          <div className="text-xs text-muted-foreground">৳{Number(req.product_price).toFixed(0)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {req.payment_method === "bkash" ? "bKash" : "Nagad"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{req.transaction_id}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "outline"} className="text-xs">
                          {req.status === "pending" ? "⏳ পেন্ডিং" : req.status === "approved" ? "✅ অনুমোদিত" : "❌ প্রত্যাখ্যাত"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" onClick={() => updateRequestMutation.mutate({ id: req.id, status: "approved" })}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateRequestMutation.mutate({ id: req.id, status: "rejected" })}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={pdfSearch} onChange={(e) => setPdfSearch(e.target.value)} placeholder="Search PDFs..." className="pl-10" />
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPdfs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {pdfSearch ? "No PDFs match your search." : "No PDFs uploaded yet. Click \"Add Product\" to upload your first PDF."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPdfs.map((pdf) => (
                    <TableRow key={pdf.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {pdf.cover_url ? (
                            <img src={pdf.cover_url} alt={pdf.title} className="h-12 w-8 rounded object-cover" />
                          ) : (
                            <div className="h-12 w-8 rounded bg-accent flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm">{pdf.title}</div>
                            <div className="text-xs text-muted-foreground">{pdf.pages ? `${pdf.pages} pages` : "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{pdf.category}</Badge></TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">৳{Number(pdf.price).toFixed(0)}</div>
                          {pdf.original_price && <div className="text-xs text-muted-foreground line-through">৳{Number(pdf.original_price).toFixed(0)}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {pdf.is_bestseller && <Badge variant="secondary" className="text-xs">🔥 Best</Badge>}
                          {pdf.is_featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pdf.is_published ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => togglePublishMutation.mutate({ id: pdf.id, is_published: !pdf.is_published })}
                        >
                          {pdf.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(pdf)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(pdf)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" /> অ্যাডমিন ম্যানেজমেন্ট
              </h3>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="ইমেইল দিয়ে অ্যাডমিন যোগ করুন..."
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                />
                <Button onClick={handleAddAdmin} disabled={addingAdmin || !newAdminEmail.trim()}>
                  {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  যোগ করুন
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>ইমেইল</TableHead>
                    <TableHead>রোল</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কোনো অ্যাডমিন নেই।</TableCell>
                    </TableRow>
                  ) : (
                    adminUsers.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                        <TableCell><Badge variant="default" className="text-xs"><Shield className="h-3 w-3 mr-1" /> Admin</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                            disabled={admin.email === user?.email}
                            title={admin.email === user?.email ? "নিজেকে রিমুভ করা যাবে না" : "অ্যাডমিন রিমুভ করুন"}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" /> CEO Photo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a photo for the CEO. This will be displayed on the About CEO page.
              </p>
              <div className="flex items-center gap-6">
                {ceoPhotoUrl ? (
                  <img src={ceoPhotoUrl} alt="CEO" className="h-24 w-24 rounded-full object-cover shadow-md border-4 border-primary/20" />
                ) : (
                  <div className="h-24 w-24 rounded-full gradient-bg flex items-center justify-center text-primary-foreground">
                    <span className="font-display text-3xl font-bold">BS</span>
                  </div>
                )}
                <div>
                  <input
                    ref={ceoPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCeoPhotoUpload(file);
                    }}
                  />
                  <Button
                    onClick={() => ceoPhotoInputRef.current?.click()}
                    disabled={uploadingCeoPhoto}
                    className="gradient-bg text-primary-foreground border-0"
                  >
                    {uploadingCeoPhoto ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> {ceoPhotoUrl ? "Change Photo" : "Upload Photo"}</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingPdf(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-display">Edit PDF</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 mt-4">
              {editingPdf?.cover_url && (
                <div className="flex justify-center">
                  <img src={editCoverFile ? URL.createObjectURL(editCoverFile) : editingPdf.cover_url} alt="Cover" className="h-32 w-24 rounded-lg object-cover shadow-md" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (৳)</Label>
                  <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (৳)</Label>
                  <Input type="number" step="0.01" value={editOriginalPrice} onChange={(e) => setEditOriginalPrice(e.target.value)} placeholder="Leave empty for no discount" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pages</Label>
                  <Input type="number" value={editPages} onChange={(e) => setEditPages(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-sm font-medium">Bestseller</Label>
                  <p className="text-xs text-muted-foreground">Show bestseller badge</p>
                </div>
                <Switch checked={editIsBestseller} onCheckedChange={setEditIsBestseller} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show in featured section</p>
                </div>
                <Switch checked={editIsFeatured} onCheckedChange={setEditIsFeatured} />
              </div>
              <div className="space-y-2">
                <Label>Change Cover Image</Label>
                <input ref={editCoverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)} />
                <div onClick={() => editCoverInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{editCoverFile ? editCoverFile.name : "Click to upload new cover"}</span>
                </div>
              </div>
              <Button className="w-full gradient-bg text-primary-foreground border-0" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
