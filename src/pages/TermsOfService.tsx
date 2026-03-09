import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><FileText className="mr-1 h-3 w-3" /> Legal</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="space-y-6">
          {[
            { title: "1. Acceptance of Terms", content: "By accessing and using PDFStore, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service." },
            { title: "2. Description of Service", content: "PDFStore is a digital marketplace for educational PDF documents. We provide a platform for users to purchase, download, and access premium digital content." },
            { title: "3. User Accounts", content: "You must create an account to purchase PDFs. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration." },
            { title: "4. Purchases and Payments", content: "All purchases are made through bKash or Nagad mobile payment services. Orders are subject to admin approval after payment verification. Prices are listed in Bangladeshi Taka (BDT)." },
            { title: "5. Digital Content License", content: "Upon successful purchase and approval, you are granted a personal, non-transferable, non-exclusive license to download and use the PDF for personal educational purposes. You may not redistribute, resell, or share purchased PDFs." },
            { title: "6. Intellectual Property", content: "All content on PDFStore, including PDFs, images, text, and logos, is protected by copyright and intellectual property laws. Unauthorized reproduction or distribution is strictly prohibited." },
            { title: "7. Prohibited Conduct", content: "You agree not to: share your account credentials, redistribute purchased content, attempt to hack or disrupt the service, use automated tools to access the platform, or engage in any fraudulent activity." },
            { title: "8. Limitation of Liability", content: "PDFStore is provided 'as is'. We do not guarantee uninterrupted access to the service. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
            { title: "9. Termination", content: "We reserve the right to suspend or terminate your account if you violate these terms. Upon termination, your access to purchased content may be revoked." },
            { title: "10. Changes to Terms", content: "We may update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the updated terms." },
            { title: "11. Contact", content: "For questions about these Terms, contact us at bsrittik@gmail.com." },
          ].map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
