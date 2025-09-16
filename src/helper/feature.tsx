import { 
  Upload, 
  FileText, 
  BarChart3, 
  Video, 
  Share2,
  Search,
  Eye
} from "lucide-react";

// Interface for feature items with role-based display
export interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  role: string;
  url: string;
}

const features: Feature[] = [
  // Seller Features
  {
    icon: <Upload size={32} />,
    title: "Upload the Photos",
    description:
      "Easily upload and manage your product photos with our intuitive interface. Support for multiple formats and batch uploads.",
    role: "Seller",
    url: "/feature/upload-photos"
  },
  {
    icon: <FileText size={32} />,
    title: "Auto Generation of Description and Hashtags",
    description:
      "AI-powered description and hashtag generation for your listings, or write your own custom descriptions to perfectly showcase your products.",
    role: "Seller",
    url: "/feature/auto-description"
  },
  {
    icon: <BarChart3 size={32} />,
    title: "Analytics Dashboard",
    description:
      "Comprehensive analytics dashboard to track your sales performance, customer engagement, and business insights in real-time.",
    role: "Seller",
    url: "/feature/analytics-dashboard"
  },
  {
    icon: <Video size={32} />,
    title: "Reels Generation (AI Generated)",
    description:
      "Create engaging AI-generated reels and short videos automatically from your product photos to boost visibility and engagement.",
    role: "Seller",
    url: "/feature/reels-generation"
  },
  {
    icon: <Share2 size={32} />,
    title: "Social Exports",
    description:
      "Export your content directly to various social media platforms with optimized formats for each platform to maximize reach.",
    role: "Seller",
    url: "/feature/social-exports"
  },
  // User feature
  {
    icon: <Eye size={32} />,
    title: "Explore the Products",
    description:
      "Browse and discover amazing products from various sellers with an intuitive and engaging product exploration experience.",
    role: "User",
    url: "/feature/explore-products"
  },
  {
    icon: <Search size={32} />,
    title: "Search Any Niche or Items",
    description:
      "Powerful search functionality to find specific products, categories, or niches with advanced filters and smart suggestions.",
    role: "User",
    url: "/feature/search-products"
  },
  {
    icon: <Share2 size={32} />,
    title: "Share Product with Different Social Media Apps",
    description:
      "Share your favorite products directly to various social media platforms to show friends and get recommendations.",
    role: "User",
    url: "/feature/share-products"
  }
];

export default features