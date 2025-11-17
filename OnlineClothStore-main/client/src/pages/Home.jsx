import React from "react";
import HeroSection from "../components/HeroSection";
import FeatureProduct from "./FeatureProduct";
import BannerSection from "../components/BannerSection";
import FeaturesSection from "../components/FeaturesSection";
import TopProducts from "../components/TopProducts";
import Collections from "../components/Collection";

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Collections/>
      <FeatureProduct/>
      <BannerSection/>
      <FeaturesSection/>
      <TopProducts/>
    </div>
  );
}

export default Home;