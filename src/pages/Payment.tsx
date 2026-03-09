import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getProductById } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, CreditCard, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PaymentMethod = "bkash" | "nagad" | "card";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseProduct, hasPurchased, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const product = getProductById(id || "");

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p>Product not found</p>
        <Button onClick={() => navigate("/browse")} className="mt-4">Browse PDFs</Button>
      </div>
    );
  }

  if (hasPurchased(product.id) && !success) {
    navigate(`/product/${product.id}`);
    return null;
  }

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000)); // Simulate payment
    purchaseProduct(product.id);
    setSuccess(true);
    setProcessing(false);
    toast({ title: "Payment successful!", description: `"${product.title}" has been added to your library.` });
  };

  if (success) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold">Payment Successful!</h2>
            <p className="mt-2 text-muted-foreground">"{product.title}" is now in your library</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button className="gradient-bg text-primary-foreground border-0" onClick={() => navigate("/library")}>
                Go to My Library
              </Button>
              <Button variant="outline" onClick={() => navigate(`/product/${product.id}`)}>
                View Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const methods: { id: PaymentMethod; name: string; icon: React.ReactNode; color: string }[] = [
    { id: "bkash", name: "bKash", icon: <Phone className="h-5 w-5" />, color: "bg-pink-500/10 text-pink-600 border-pink-200" },
    { id: "nagad", name: "Nagad", icon: <Phone className="h-5 w-5" />, color: "bg-orange-500/10 text-orange-600 border-orange-200" },
    { id: "card", name: "Card", icon: <CreditCard className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  ];

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-6">Complete Payment</h1>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Payment Form */}
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      method === m.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.color}`}>
                      {m.icon}
                    </div>
                    <span className="font-medium">{m.name}</span>
                    {method === m.id && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {method === "card" ? "Card Details" : `${method === "bkash" ? "bKash" : "Nagad"} Number`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {method === "card" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input placeholder={method === "bkash" ? "01XXXXXXXXX" : "01XXXXXXXXX"} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full gradient-bg text-primary-foreground border-0 premium-shadow"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" /> Pay ${product.price}
                </>
              )}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="h-20 w-14 rounded-md object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-sm leading-tight">{product.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{product.author}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">{product.category}</Badge>
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    {product.originalPrice ? (
                      <span className="line-through text-muted-foreground">${product.originalPrice}</span>
                    ) : (
                      <span>${product.price}</span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-success">-${(product.originalPrice - product.price).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-primary">${product.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
