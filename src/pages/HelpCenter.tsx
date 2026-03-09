import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, CreditCard, Download, Shield, UserCog, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const topics = [
  {
    icon: BookOpen,
    title: "Browsing & Purchasing",
    description: "How to find, preview, and buy PDFs",
    links: [
      { label: "How do I browse PDFs?", answer: "Visit our Browse page to explore all available PDFs. You can filter by category, search by title, and sort by price or rating." },
      { label: "Can I preview before buying?", answer: "Yes! Every PDF has free preview pages. Click on any product to see the preview section at the bottom of the details page." },
      { label: "How do I purchase a PDF?", answer: "Click 'Buy Now' on any PDF, choose bKash or Nagad, send money to the given number, and submit your transaction ID." },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods and transaction help",
    links: [
      { label: "What payment methods are accepted?", answer: "We accept bKash and Nagad mobile payments. Send money to the number shown on the payment page." },
      { label: "How long does approval take?", answer: "Orders are typically reviewed within 1-2 hours during business hours. You'll be notified once approved." },
      { label: "My transaction ID was rejected?", answer: "Double-check the transaction ID from your bKash/Nagad app. If the issue persists, contact us with your payment receipt." },
    ],
  },
  {
    icon: Download,
    title: "Downloads",
    description: "Downloading and accessing your PDFs",
    links: [
      { label: "Where are my purchased PDFs?", answer: "Go to 'My Library' from the navigation menu. All approved purchases will be available for download there." },
      { label: "Can I re-download a PDF?", answer: "Yes! Once approved, your PDFs are available for unlimited downloads from your Library." },
      { label: "Download not working?", answer: "Try refreshing the page or clearing your browser cache. If the problem continues, contact our support." },
    ],
  },
  {
    icon: UserCog,
    title: "Account",
    description: "Account settings and management",
    links: [
      { label: "How do I create an account?", answer: "Click 'Sign Up' in the top navigation. Enter your name, email, and password to create your account." },
      { label: "Forgot my password?", answer: "Click 'Forgot Password' on the login page. We'll send a reset link to your email." },
      { label: "How do I update my profile?", answer: "Log in and navigate to your profile settings to update your name and other details." },
    ],
  },
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredTopics = topics.map(topic => ({
    ...topic,
    links: topic.links.filter(l =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(t => t.links.length > 0 || !search);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <Badge variant="secondary" className="mb-4"><HelpCircle className="mr-1 h-3 w-3" /> Support</Badge>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Help Center</h1>
        <p className="mt-3 text-muted-foreground">Find answers to common questions or reach out to our team</p>
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for help..." className="pl-10" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl grid gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <topic.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div>{topic.title}</div>
                  <p className="text-sm font-normal text-muted-foreground">{topic.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topic.links.map((link) => (
                <div key={link.label} className="rounded-lg border border-border/50">
                  <button
                    onClick={() => setExpandedItem(expandedItem === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between p-3 text-left text-sm font-medium hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    {link.label}
                    <span className="text-muted-foreground">{expandedItem === link.label ? "−" : "+"}</span>
                  </button>
                  {expandedItem === link.label && (
                    <div className="px-3 pb-3 text-sm text-muted-foreground">{link.answer}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto max-w-3xl mt-10 text-center">
        <Card className="bg-accent/30">
          <CardContent className="py-8">
            <h3 className="font-display text-lg font-semibold">Still need help?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our support team is here to assist you</p>
            <Link to="/contact">
              <button className="mt-4 rounded-lg gradient-bg px-6 py-2 text-sm font-medium text-primary-foreground">Contact Us</button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
