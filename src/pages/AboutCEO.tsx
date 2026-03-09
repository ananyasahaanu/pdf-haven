import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Globe, BookOpen, Heart, Lightbulb, Target } from "lucide-react";

export default function AboutCEO() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4"><User className="mr-1 h-3 w-3" /> About</Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">About Our CEO</h1>
          <p className="mt-3 text-muted-foreground">Meet the visionary behind PDFStore</p>
        </div>

        {/* CEO Profile */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full gradient-bg text-primary-foreground">
              <span className="font-display text-4xl font-bold">BS</span>
            </div>
            <h2 className="font-display text-2xl font-bold">Brazil Singh</h2>
            <p className="text-primary font-medium mt-1">Founder & CEO, PDFStore</p>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
              A passionate entrepreneur and digital education advocate, Brazil Singh founded PDFStore with a vision to make premium educational content accessible to everyone across Bangladesh and beyond.
            </p>
          </CardContent>
        </Card>

        {/* Story & Vision */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" /> The Story
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Brazil Singh's journey began with a simple observation — quality educational resources were either too expensive or too hard to find for students and professionals in Bangladesh. Growing up with a deep love for learning, Brazil experienced firsthand the challenges of accessing premium study materials. This personal struggle became the driving force behind PDFStore.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                In 2026, Brazil launched PDFStore to bridge this gap, creating a platform where expert authors could share their knowledge through affordable, high-quality PDFs, and learners could access them with just a few clicks using familiar payment methods like bKash and Nagad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" /> Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                "I believe that education should have no barriers. My vision for PDFStore is to become the leading digital education platform in South Asia, empowering millions of learners with curated, expert-authored content at prices everyone can afford."
              </p>
              <p className="text-muted-foreground mt-3 italic">— Brazil Singh</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary" /> Philosophy
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Brazil believes in three core principles: <strong>Accessibility</strong> — making knowledge available to everyone regardless of their economic background; <strong>Quality</strong> — ensuring every PDF on the platform meets rigorous standards; and <strong>Trust</strong> — building a transparent relationship with customers through honest business practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" /> Beyond Business
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Outside of PDFStore, Brazil is deeply involved in community education initiatives. He regularly mentors young entrepreneurs and advocates for digital literacy programs across Bangladesh. His passion for technology and education continues to shape the future of PDFStore.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-primary" /> Global Ambition
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                While PDFStore started in Bangladesh, Brazil's ambition is global. Plans are underway to expand the platform to serve learners across South Asia, the Middle East, and beyond, bringing premium educational content to millions more students and professionals worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
