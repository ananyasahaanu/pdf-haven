import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, Download, Library as LibraryIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Library() {
  const { isAuthenticated, user } = useAuth();

  const { data: purchaseRequests = [], refetch } = useQuery({
    queryKey: ["my-purchase-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!user,
  });

  // Fetch product cover images from uploaded_pdfs
  const productIds = [...new Set(purchaseRequests.map(r => r.product_id))];
  const { data: pdfDetails = [] } = useQuery({
    queryKey: ["library-pdf-details", productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from("uploaded_pdfs")
        .select("id, cover_url, pdf_url")
        .in("id", productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
  });

  const getPdfDetail = (productId: string) => pdfDetails.find(p => p.id === productId);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("purchase-status")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "purchase_requests", filter: `user_id=eq.${user.id}` }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const approvedRequests = purchaseRequests.filter((r) => r.status === "approved");
  const pendingRequests = purchaseRequests.filter((r) => r.status === "pending");
  const rejectedRequests = purchaseRequests.filter((r) => r.status === "rejected");

  const handleDownload = (productId: string) => {
    const detail = getPdfDetail(productId);
    if (detail?.pdf_url) {
      window.open(detail.pdf_url, "_blank");
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold"><LibraryIcon className="mr-2 inline h-7 w-7" /> আমার লাইব্রেরি</h1>
        <p className="mt-1 text-muted-foreground">আপনার কেনা PDF গুলো — যেকোনো সময় ডাউনলোড করুন</p>
      </div>

      {approvedRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-success" /> ডাউনলোড করুন</h2>
          <div className="grid gap-4">
            {approvedRequests.map((req) => {
              const detail = getPdfDetail(req.product_id);
              return (
                <Card key={req.id} className="hover-lift">
                  <CardContent className="flex items-center gap-4 p-4">
                    <img src={detail?.cover_url || "/placeholder.svg"} alt={req.product_title} className="h-24 w-16 rounded-lg object-cover shadow-md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold truncate">{req.product_title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className="text-xs bg-success text-success-foreground border-0">✅ অনুমোদিত</Badge>
                        <span className="text-xs text-muted-foreground">৳{Number(req.product_price).toFixed(0)}</span>
                      </div>
                    </div>
                    <Button className="shrink-0 gradient-bg text-primary-foreground border-0" onClick={() => handleDownload(req.product_id)}>
                      <Download className="mr-2 h-4 w-4" /> ডাউনলোড
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /> পেন্ডিং রিকোয়েস্ট</h2>
          <div className="grid gap-4">
            {pendingRequests.map((req) => {
              const detail = getPdfDetail(req.product_id);
              return (
                <Card key={req.id} className="opacity-80">
                  <CardContent className="flex items-center gap-4 p-4">
                    <img src={detail?.cover_url || "/placeholder.svg"} alt={req.product_title} className="h-24 w-16 rounded-lg object-cover shadow-md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold truncate">{req.product_title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">⏳ যাচাই হচ্ছে</Badge>
                        <span className="text-xs text-muted-foreground">৳{Number(req.product_price).toFixed(0)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">অ্যাডমিন আপনার পেমেন্ট যাচাই করছে।</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {rejectedRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><XCircle className="h-5 w-5 text-destructive" /> প্রত্যাখ্যাত</h2>
          <div className="grid gap-4">
            {rejectedRequests.map((req) => {
              const detail = getPdfDetail(req.product_id);
              return (
                <Card key={req.id} className="opacity-60">
                  <CardContent className="flex items-center gap-4 p-4">
                    <img src={detail?.cover_url || "/placeholder.svg"} alt={req.product_title} className="h-24 w-16 rounded-lg object-cover shadow-md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold truncate">{req.product_title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">❌ প্রত্যাখ্যাত</Badge>
                        <span className="text-xs text-muted-foreground">৳{Number(req.product_price).toFixed(0)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {purchaseRequests.length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-xl font-semibold">আপনার লাইব্রেরি খালি</h2>
          <p className="mt-2 text-muted-foreground">আজই আপনার কালেকশন তৈরি শুরু করুন</p>
          <Link to="/browse"><Button className="mt-6 gradient-bg text-primary-foreground border-0">PDF দেখুন</Button></Link>
        </div>
      )}
    </div>
  );
}
