import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  { q: "PDFStore কী?", a: "PDFStore হলো একটি প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস যেখানে আপনি উচ্চমানের শিক্ষামূলক PDF কিনতে ও ডাউনলোড করতে পারবেন।" },
  { q: "কিভাবে PDF কিনব?", a: "যেকোনো PDF এর 'Buy Now' বাটনে ক্লিক করুন, bKash বা Nagad এ টাকা পাঠান, তারপর Transaction ID সহ ফর্ম সাবমিট করুন।" },
  { q: "পেমেন্ট কিভাবে করব?", a: "আমরা bKash এবং Nagad এর মাধ্যমে Send Money গ্রহণ করি। পেমেন্ট পেজে দেওয়া নম্বরে টাকা পাঠান।" },
  { q: "অর্ডার approve হতে কত সময় লাগে?", a: "সাধারণত ১-২ ঘণ্টার মধ্যে (ব্যবসায়িক সময়ে)। অনুমোদন হলে আপনাকে জানানো হবে।" },
  { q: "কি preview দেখা যায় কেনার আগে?", a: "হ্যাঁ! প্রতিটি PDF এর কিছু পৃষ্ঠা বিনামূল্যে preview করা যায়।" },
  { q: "একবার কেনার পর কতবার ডাউনলোড করতে পারব?", a: "যতবার ইচ্ছা! একবার approve হলে আপনার Library থেকে সীমাহীনবার ডাউনলোড করতে পারবেন।" },
  { q: "রিফান্ড পাওয়া যায়?", a: "হ্যাঁ, নির্দিষ্ট শর্তে। বিস্তারিত জানতে আমাদের Refund Policy দেখুন।" },
  { q: "বাংলাদেশের বাইরে থেকে কিভাবে কিনব?", a: "বাংলাদেশের বাইরে থেকে কিনতে চাইলে আমাদের সাথে যোগাযোগ করুন। আমরা বিকল্প পেমেন্ট ব্যবস্থা করে দেব।" },
  { q: "আমার অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেছি?", a: "লগইন পেজে 'Forgot Password' এ ক্লিক করুন। আপনার ইমেইলে রিসেট লিঙ্ক পাঠানো হবে।" },
  { q: "সমস্যা হলে কোথায় যোগাযোগ করব?", a: "bsrittik@gmail.com এ ইমেইল করুন অথবা +880 1779-379894 নম্বরে WhatsApp করুন।" },
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><HelpCircle className="mr-1 h-3 w-3" /> FAQ</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-3 text-muted-foreground">সাধারণ প্রশ্নের উত্তর খুঁজুন</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-accent/30 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                  {faq.q}
                </span>
                <span className="text-muted-foreground text-xl">{expanded === i ? "−" : "+"}</span>
              </button>
              {expanded === i && (
                <CardContent className="pt-0 pb-5 px-5">
                  <p className="text-muted-foreground pl-10">{faq.a}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground">আপনার প্রশ্নের উত্তর পাননি?</p>
          <Link to="/contact">
            <button className="mt-3 rounded-lg gradient-bg px-6 py-2 text-sm font-medium text-primary-foreground">যোগাযোগ করুন</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
