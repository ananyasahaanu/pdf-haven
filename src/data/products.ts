export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  category: string;
  author: string;
  pages: number;
  previewPages: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviews: number;
  createdAt: string;
}

export const categories = [
  "All",
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Personal Development",
];

export const products: Product[] = [
  {
    id: "1",
    title: "Mastering Python Programming",
    description: "A comprehensive guide to Python programming from beginner to advanced. Learn Python fundamentals, data structures, algorithms, object-oriented programming, web development with Django and Flask, data analysis with Pandas, and machine learning basics. This book includes 500+ exercises and 20 real-world projects.",
    shortDescription: "Complete Python guide with 500+ exercises and 20 projects",
    price: 29.99,
    originalPrice: 49.99,
    coverImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=560&fit=crop",
    category: "Programming",
    author: "Sarah Chen",
    pages: 450,
    previewPages: 5,
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviews: 1247,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "UI/UX Design Fundamentals",
    description: "Master the art of user interface and user experience design. This comprehensive guide covers design principles, color theory, typography, wireframing, prototyping, user research, usability testing, and modern design tools like Figma and Adobe XD. Perfect for aspiring designers.",
    shortDescription: "Complete UI/UX design guide with practical examples",
    price: 24.99,
    originalPrice: 39.99,
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=560&fit=crop",
    category: "Design",
    author: "Michael Torres",
    pages: 380,
    previewPages: 4,
    isBestseller: true,
    rating: 4.8,
    reviews: 892,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    title: "Digital Marketing Mastery",
    description: "Learn modern digital marketing strategies including SEO, SEM, social media marketing, content marketing, email campaigns, analytics, and conversion optimization. Includes case studies from Fortune 500 companies and actionable templates.",
    shortDescription: "Modern marketing strategies with real-world case studies",
    price: 34.99,
    originalPrice: 54.99,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=560&fit=crop",
    category: "Marketing",
    author: "Emily Rodriguez",
    pages: 320,
    previewPages: 5,
    isFeatured: true,
    rating: 4.7,
    reviews: 654,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    title: "Data Science with R",
    description: "Comprehensive guide to data science using R programming language. Covers statistical analysis, data visualization with ggplot2, machine learning algorithms, predictive modeling, and data wrangling with tidyverse. Perfect for statisticians and analysts.",
    shortDescription: "Statistical analysis and ML with R programming",
    price: 39.99,
    originalPrice: 59.99,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=560&fit=crop",
    category: "Data Science",
    author: "Dr. James Wilson",
    pages: 520,
    previewPages: 5,
    isBestseller: true,
    rating: 4.9,
    reviews: 1102,
    createdAt: "2024-01-28",
  },
  {
    id: "5",
    title: "Business Strategy Blueprint",
    description: "Strategic frameworks and methodologies used by top consultants and executives. Learn competitive analysis, market positioning, financial modeling, growth strategies, and organizational design. Includes templates and real-world case studies.",
    shortDescription: "Strategic frameworks used by top executives",
    price: 44.99,
    originalPrice: 69.99,
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=560&fit=crop",
    category: "Business",
    author: "Robert Chang",
    pages: 400,
    previewPages: 4,
    rating: 4.6,
    reviews: 445,
    createdAt: "2024-02-05",
  },
  {
    id: "6",
    title: "JavaScript Complete Guide",
    description: "Everything you need to master JavaScript development. From basics to advanced concepts including ES6+, async programming, Node.js, React, and testing. Build 15 projects including full-stack applications.",
    shortDescription: "Master JS from basics to full-stack development",
    price: 32.99,
    originalPrice: 49.99,
    coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=560&fit=crop",
    category: "Programming",
    author: "Alex Kim",
    pages: 580,
    previewPages: 5,
    isFeatured: true,
    rating: 4.8,
    reviews: 987,
    createdAt: "2024-03-01",
  },
  {
    id: "7",
    title: "Personal Productivity System",
    description: "Transform your productivity with proven systems and techniques. Learn time management, goal setting, habit formation, focus techniques, and work-life balance strategies used by high performers.",
    shortDescription: "Proven systems for peak personal productivity",
    price: 19.99,
    originalPrice: 29.99,
    coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=560&fit=crop",
    category: "Personal Development",
    author: "Lisa Park",
    pages: 250,
    previewPages: 4,
    rating: 4.5,
    reviews: 723,
    createdAt: "2024-02-15",
  },
  {
    id: "8",
    title: "Machine Learning Essentials",
    description: "A practical introduction to machine learning algorithms and applications. Covers supervised and unsupervised learning, neural networks, deep learning, NLP, and computer vision with Python and TensorFlow.",
    shortDescription: "Practical ML with Python and TensorFlow",
    price: 49.99,
    originalPrice: 79.99,
    coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=560&fit=crop",
    category: "Data Science",
    author: "Dr. Anita Sharma",
    pages: 620,
    previewPages: 5,
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviews: 1456,
    createdAt: "2024-01-05",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.isBestseller);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.author.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
