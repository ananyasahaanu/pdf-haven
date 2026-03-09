import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactUs() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const ADMIN_EMAIL = "bsrittik@gmail.com";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    setSending(true);
    // Open mailto link as fallback
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject || `Contact from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.open(mailtoLink, "_blank");
    setSending(false);
    setSent(true);
    toast({ title: "ইমেইল ক্লায়েন্ট ওপেন হয়েছে", description: "আপনার ইমেইল অ্যাপ থেকে মেসেজটি পাঠান।" });
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><Mail className="mr-1 h-3 w-3" /> Contact</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">We'd love to hear from you. Get in touch with our team.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Mail className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Email Us</h3>
                  <a href={`mailto:${ADMIN_EMAIL}`} className="text-sm text-primary hover:underline">{ADMIN_EMAIL}</a>
                  <p className="text-xs text-muted-foreground mt-1">We'll respond within 24 hours</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Phone className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Call / WhatsApp</h3>
                  <p className="text-sm text-primary">+880 1779-379894</p>
                  <p className="text-xs text-muted-foreground mt-1">Sat-Thu, 10AM - 8PM BST</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <MapPin className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Location</h3>
                  <p className="text-sm text-muted-foreground">Bangladesh</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {sent ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-success mb-4" />
                  <h2 className="font-display text-xl font-bold">Email Client Opened!</h2>
                  <p className="mt-2 text-muted-foreground">Please send the email from your email app. We'll get back to you soon.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>Send Another Message</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Your Name *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Your Email *</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more about your inquiry..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full gradient-bg text-primary-foreground border-0" disabled={sending}>
                      {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
