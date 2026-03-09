import { useState, useRef } from "react";
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
import { BookOpen, Edit, FileText, Loader2, Package, Plus, ShoppingBag, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export default function Admin() {
  const { isAdmin, isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [pages, setPages] = useState("");
  const [uploading, setUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Fetch uploaded PDFs
  const { data: uploadedPdfs = [] } = useQuery({
    queryKey: ["admin-pdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"uploaded_pdfs">[];
    },
    enabled: isAuthenticated && isAdmin,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (pdf: Tables<"uploaded_pdfs">) => {
      // Delete files from storage
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
      const { error } = await supabase
        .from("uploaded_pdfs")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pdfs"] });
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setPrice(""); setCategory(""); setPages("");
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

      // Upload PDF
      const pdfPath = `${user.id}/${timestamp}_${pdfFile.name}`;
      const { error: pdfError } = await supabase.storage.from("pdfs").upload(pdfPath, pdfFile);
      if (pdfError) throw pdfError;
      const { data: pdfUrlData } = supabase.storage.from("pdfs").getPublicUrl(pdfPath);

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (coverFile) {
        const coverPath = `${user.id}/${timestamp}_${coverFile.name}`;
        const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, coverFile);
        if (coverError) throw coverError;
        const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      // Insert record
      const { error: insertError } = await supabase.from("uploaded_pdfs").insert({
        title,
        description: description || null,
        price: parseFloat(price) || 0,
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

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage products and uploads</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground border-0">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Upload New PDF</DialogTitle>
            </DialogHeader>
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
                  <Label>Price ($) *</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Programming" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pages</Label>
                <Input type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {coverFile ? coverFile.name : "Click to upload cover image"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF File *</Label>
                <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {pdfFile ? pdfFile.name : "Click to upload PDF file"}
                  </span>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-bg text-primary-foreground border-0" disabled={uploading}>
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Add Product"}
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
              <div className="text-2xl font-bold font-display">{uploadedPdfs.length}</div>
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
              <div className="text-2xl font-bold font-display">{uploadedPdfs.filter(p => p.is_published).length}</div>
              <div className="text-sm text-muted-foreground">Published</div>
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
                ${uploadedPdfs.reduce((acc, o) => acc + Number(o.price), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Uploaded PDFs</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedPdfs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No PDFs uploaded yet. Click "Add Product" to upload your first PDF.
                    </TableCell>
                  </TableRow>
                ) : (
                  uploadedPdfs.map((pdf) => (
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
                      <TableCell className="font-medium">${Number(pdf.price).toFixed(2)}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteMutation.mutate(pdf)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
