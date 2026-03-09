import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><RotateCcw className="mr-1 h-3 w-3" /> Policy</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Refund Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" /> Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Since our products are digital PDFs that are delivered instantly after approval, refunds are handled on a case-by-case basis. We want every customer to be satisfied with their purchase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" /> Eligible for Refund
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Duplicate payment for the same PDF</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> PDF file is corrupted or unreadable</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Content significantly different from the description</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" /> Payment was charged but order was never approved</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Not Eligible for Refund
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> Change of mind after downloading the PDF</li>
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> Failure to read the product description before purchase</li>
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> Issues caused by incompatible PDF reader software</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" /> How to Request a Refund
              </h2>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Contact us within 7 days of purchase at <a href="mailto:bsrittik@gmail.com" className="text-primary hover:underline">bsrittik@gmail.com</a></li>
                <li>Include your transaction ID and the PDF title</li>
                <li>Describe the issue you're experiencing</li>
                <li>We'll review your request within 48 hours</li>
                <li>If approved, refund will be sent to your bKash/Nagad account within 3-5 business days</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
