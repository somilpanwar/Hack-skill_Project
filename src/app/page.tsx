"use client"
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
import { Hash, Video, Info } from "lucide-react";

const features = [
  {
    icon: <Hash size={32} />,
    title: "Hashtags",
    description:
      "Use trending and relevant hashtags to boost the visibility of your products and artwork, making it easier for customers to discover you.",
  },
  {
    icon: <Video size={32} />,
    title: "AI Powered Video",
    description:
      "Create and share engaging AI-generated videos to showcase your shop or art, attracting more attention and increasing engagement.",
  },
  {
    icon: <Info size={32} />,
    title: "Detailed Descriptions",
    description:
      "Provide rich, informative descriptions for your listings to help customers understand your offerings and make confident purchases.",
  },
];

const Home = () => {
  return (
    <>
      <Navbar />
  <main className="min-h-[80vh] bg-gradient-to-b from-white to-indigo-50">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-600 mb-4 drop-shadow">
            Empowering Local Shopkeepers & Artists
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">
            Discover, support, and shop from your neighborhood&apos;s best shops and artists. We help local businesses and creators thrive by connecting them with the community.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/shops" className="px-6 py-3 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-orange-400 hover:text-white transition-colors">
              Explore Shops
            </a>
            <a href="/artists" className="px-6 py-3 rounded border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-700 hover:text-white transition-colors shadow">
              Discover Artists
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-indigo-600">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;