import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><Shield className="mr-1 h-3 w-3" /> Legal</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="space-y-6">
          {[
            { title: "1. Information We Collect", content: "We collect information you provide directly: name, email address, and mobile number during account registration and purchases. We also collect transaction IDs for payment verification." },
            { title: "2. How We Use Your Information", content: "Your information is used to: process and verify purchases, provide customer support, send order status notifications, improve our services, and communicate important updates about your account." },
            { title: "3. Information Sharing", content: "We do not sell, trade, or rent your personal information to third parties. We may share information only when required by law or to protect our legal rights." },
            { title: "4. Data Security", content: "We implement industry-standard security measures to protect your personal information. All data is stored securely with encryption and access controls. However, no method of transmission over the internet is 100% secure." },
            { title: "5. Payment Information", content: "We do not store your bKash or Nagad account details. We only record transaction IDs for order verification purposes." },
            { title: "6. Cookies", content: "We use essential cookies to maintain your login session and preferences. See our Cookie Policy for more details." },
            { title: "7. Your Rights", content: "You have the right to: access your personal data, request correction of inaccurate data, request deletion of your account and associated data, and opt out of non-essential communications." },
            { title: "8. Data Retention", content: "We retain your personal data as long as your account is active or as needed to provide services. Purchase records are retained for accounting and legal compliance purposes." },
            { title: "9. Children's Privacy", content: "PDFStore is not intended for children under 13. We do not knowingly collect personal information from children." },
            { title: "10. Changes to This Policy", content: "We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification." },
            { title: "11. Contact Us", content: "For privacy-related inquiries, contact us at bsrittik@gmail.com." },
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
