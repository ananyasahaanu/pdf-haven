import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CouponInputProps {
  onApply: (discountPercent: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
}

export function CouponInput({ onApply, onRemove, appliedCode, appliedDiscount }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: "Invalid coupon", description: "This coupon code doesn't exist or is inactive.", variant: "destructive" });
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "Coupon expired", variant: "destructive" });
        return;
      }
      if (data.max_uses && data.used_count >= data.max_uses) {
        toast({ title: "Coupon fully used", variant: "destructive" });
        return;
      }

      onApply(data.discount_percent, data.code);
      toast({ title: `${data.discount_percent}% discount applied!` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <Tag className="h-4 w-4 text-primary" />
        <Badge variant="secondary">{appliedCode}</Badge>
        <span className="text-sm text-primary font-medium">{appliedDiscount}% off</span>
        <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Coupon code"
        className="flex-1"
      />
      <Button variant="outline" onClick={handleApply} disabled={checking || !code.trim()}>
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
