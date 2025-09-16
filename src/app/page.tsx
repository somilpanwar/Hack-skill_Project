"use client"
import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
//import {  Video, Info, Image } from "lucide-react";
import features from "@/helper/feature";
//import { useUser } from "@clerk/nextjs";
import roleContext from "@/context/roleContext";


const Home = () => {
 // const {user , isLoaded} = useUser();
  const{role} = useContext(roleContext)
  const[Rolefeature , setRoleFeature] = useState(features.filter((feat)=>feat.role=="User"));
  useEffect(() => {
    
   
    setRoleFeature(features.filter((feat)=>feat.role == role))
    
  
  }, [role])
  
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
            {Rolefeature.map((feature, idx) => (
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