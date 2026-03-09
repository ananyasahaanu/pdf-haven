import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><Cookie className="mr-1 h-3 w-3" /> Legal</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Cookie Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="space-y-6">
          {[
            { title: "What Are Cookies?", content: "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your experience." },
            { title: "How We Use Cookies", content: "PDFStore uses cookies for: maintaining your login session (essential), remembering your theme preference (dark/light mode), and basic analytics to improve our service." },
            { title: "Types of Cookies We Use", content: "Essential Cookies: Required for the website to function properly, including authentication and session management. These cannot be disabled.\n\nPreference Cookies: Store your settings like theme preference. These enhance your experience but are not strictly necessary.\n\nAnalytics Cookies: Help us understand how visitors use our site so we can improve it." },
            { title: "Third-Party Cookies", content: "We minimize the use of third-party cookies. Our payment partners (bKash, Nagad) may use their own cookies when processing payments on their platforms." },
            { title: "Managing Cookies", content: "You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using certain features of PDFStore, such as staying logged in." },
            { title: "Contact", content: "For questions about our Cookie Policy, contact us at bsrittik@gmail.com." },
          ].map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
