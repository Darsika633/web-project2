import React from "react";
import { Button } from "../ui/button";
const BannerSection = () => {
  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-4">
        {/* Mobile Layout - Stack vertically with image on top */}
        <div className="flex flex-col lg:hidden">
          {/* Mobile Image */}
          <div className="relative w-full h-[400px] mb-8">
            <img
              src="https://mollee-html-ten.vercel.app/assets/img/deal-of-the-week.jpg"
              alt="Woman in white knit sweater and black pants"
              className="w-full h-full object-cover rounded-none"
            />
          </div>
          {/* Mobile Content */}
          <div className="text-center space-y-6 px-4">
            <div className="space-y-4">
              <p className="text-sm font-raleway text-gray-600 uppercase tracking-[0.2em] font-normal">
                <span className="font-bold text-gray-800">DEAL</span>{" "}
                <span className="font-normal text-gray-400">OF THE WEEK</span>
              </p>
              <h1 className="text-4xl sm:text-5xl font-josefin-sans font-normal leading-tight text-black">
                Stay Warm
                <br />
                And Trendy
              </h1>
              <p className="text-lg text-gray-600 font-raleway">
                The countdown is finished!
              </p>
            </div>
            <a href="/product">
              <button className="bg-black text-white px-10 py-4 font-raleway text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl border-2 border-black hover:border-gray-800 rounded-none relative overflow-hidden group mx-auto">
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </a>
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden lg:flex flex-row items-center gap-0 min-h-[700px]">
          {/* Desktop Content - Left Side */}
          <div className="flex items-center justify-center w-full lg:w-1/2 pl-8 lg:pl-16">
            <div className="space-y-6 max-w-md">
              <div className="space-y-4">
                <p className="text-sm font-raleway text-gray-600 uppercase tracking-[0.2em] font-normal">
                  <span className="font-bold text-gray-800">DEAL</span>{" "}
                  <span className="font-normal text-gray-400">OF THE WEEK</span>
                </p>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-josefin-sans font-normal leading-tight text-black">
                  Stay Warm
                  <br />
                  And Trendy
                </h1>
                <p className="text-lg text-gray-600 font-raleway">
                  The countdown is finished!
                </p>
              </div>
              <a href="/product">
                <button className="bg-black text-white px-10 py-4 font-raleway text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl border-2 border-black hover:border-gray-800 rounded-none relative overflow-hidden group">
                  <span className="relative z-10">Shop Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </a>
            </div>
          </div>
          {/* Vertical Separator */}
          <div className="h-[400px] w-px bg-gray-200 mx-8" />
          {/* Desktop Image - Right Side */}
          <div className="relative flex items-center justify-center w-full lg:w-1/2 min-h-[600px] lg:min-h-[700px]">
            <img
              src="https://mollee-html-ten.vercel.app/assets/img/deal-of-the-week.jpg"
              alt="Woman in white knit sweater and black pants"
              className="w-full h-auto object-cover rounded-none"
              style={{ maxHeight: "700px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
