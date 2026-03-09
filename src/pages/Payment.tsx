import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, Phone, Send, Loader2, Copy, Globe } from "lucide-react";
import { CouponInput } from "@/components/CouponInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PaymentMethod = "bkash" | "nagad";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerMobile, setCustomerMobile] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const { data: product, isLoading } = useProduct(id || "");
  const PAYMENT_NUMBER = "01779379894";
  const finalPrice = product ? Math.round(product.price * (1 - couponDiscount / 100)) : 0;

  if (!isAuthenticated) { navigate("/login"); return null; }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="mx-auto max-w-2xl"><Skeleton className="h-96 rounded-xl" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p>Product not found</p>
        <Button onClick={() => navigate("/browse")} className="mt-4">Browse PDFs</Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerMobile.trim() || !transactionId.trim()) {
      toast({ title: "সব তথ্য পূরণ করুন", description: "নাম, মোবাইল নম্বর এবং ট্রানজেকশন আইডি আবশ্যক।", variant: "destructive" });
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("purchase_requests").insert({
        user_id: user.id,
        product_id: product.id,
        product_title: product.title,
        product_price: finalPrice,
        customer_name: customerName.trim(),
        customer_mobile: customerMobile.trim(),
        payment_method: method,
        transaction_id: transactionId.trim(),
      });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "অর্ডার রিকোয়েস্ট পাঠানো হয়েছে!", description: "অ্যাডমিন অনুমোদন করলে আপনাকে জানানো হবে।" });
    } catch (err: any) {
      toast({ title: "সমস্যা হয়েছে", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    toast({ title: "নম্বর কপি হয়েছে!", description: PAYMENT_NUMBER });
  };

  if (success) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold">অর্ডার রিকোয়েস্ট পাঠানো হয়েছে!</h2>
            <p className="mt-2 text-muted-foreground">"{product.title}" এর জন্য আপনার রিকোয়েস্ট পেন্ডিং আছে।</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button className="gradient-bg text-primary-foreground border-0" onClick={() => navigate("/library")}>আমার লাইব্রেরি দেখুন</Button>
              <Button variant="outline" onClick={() => navigate("/browse")}>আরো PDF দেখুন</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const methods: { id: PaymentMethod; name: string; color: string }[] = [
    { id: "bkash", name: "bKash", color: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800" },
    { id: "nagad", name: "Nagad", color: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800" },
  ];

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-6">পেমেন্ট সম্পন্ন করুন</h1>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">১. পেমেন্ট মেথড বাছাই করুন</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {methods.map((m) => (
                  <button key={m.id} onClick={() => setMethod(m.id)} className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${method === m.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.color}`}><Phone className="h-5 w-5" /></div>
                    <span className="font-medium">{m.name}</span>
                    {method === m.id && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader><CardTitle className="text-lg">২. Send Money করুন</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">আপনার <strong>{method === "bkash" ? "bKash" : "Nagad"}</strong> অ্যাপ থেকে নিচের নম্বরে <strong>৳{finalPrice}</strong> Send Money করুন:</p>
                <div className="flex items-center gap-2 rounded-lg bg-background border border-border p-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-display text-xl font-bold text-primary tracking-wider">{PAYMENT_NUMBER}</span>
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={copyNumber}><Copy className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">Send Money করার পর আপনি একটি Transaction ID পাবেন। সেটি নিচে দিন।</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">৩. আপনার তথ্য দিন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>আপনার নাম *</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="আপনার পুরো নাম" /></div>
                <div className="space-y-2"><Label>মোবাইল নম্বর *</Label><Input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="01XXXXXXXXX" /></div>
                <div className="space-y-2"><Label>Transaction ID *</Label><Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="যেমন: TXN1234ABCD" /></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">কুপন কোড</Label>
                <CouponInput
                  onApply={(d, c) => { setCouponDiscount(d); setCouponCode(c); }}
                  onRemove={() => { setCouponDiscount(0); setCouponCode(null); }}
                  appliedCode={couponCode}
                  appliedDiscount={couponDiscount}
                />
              </CardContent>
            </Card>
            <Button size="lg" className="w-full gradient-bg text-primary-foreground border-0 premium-shadow" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> সাবমিট হচ্ছে...</> : <><Send className="mr-2 h-5 w-5" /> অর্ডার রিকোয়েস্ট সাবমিট করুন</>}
            </Button>

            {/* International Buyer Notice */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="flex items-start gap-3 p-4">
                <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Buying from outside Bangladesh?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you are located outside of Bangladesh and want to purchase, please{" "}
                    <a href="/contact" className="text-primary hover:underline font-medium">contact us</a>{" "}
                    or email us at{" "}
                    <a href="mailto:bsrittik@gmail.com" className="text-primary hover:underline font-medium">bsrittik@gmail.com</a>{" "}
                    for alternative payment options.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <CardHeader><CardTitle className="text-lg">অর্ডার সারাংশ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <img src={product.coverImage} alt={product.title} className="h-20 w-14 rounded-md object-cover" />
                  <div>
                    <h3 className="font-medium text-sm leading-tight">{product.title}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">{product.category}</Badge>
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  {product.originalPrice && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">মূল্য</span><span className="line-through text-muted-foreground">৳{product.originalPrice}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">ছাড়</span><span className="text-success">-৳{(product.originalPrice - product.price).toFixed(2)}</span></div>
                    </>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">কুপন ({couponCode})</span><span className="text-success">-{couponDiscount}%</span></div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 font-bold"><span>মোট</span><span className="text-primary">৳{finalPrice}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
