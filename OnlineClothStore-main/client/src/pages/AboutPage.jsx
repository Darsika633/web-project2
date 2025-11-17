import React from "react";
import FeaturesSection from "../components/FeaturesSection";

const brands = [
  "https://mollee-html-ten.vercel.app/assets/img/svg/brand_1.svg",
  "https://mollee-html-ten.vercel.app/assets/img/svg/brand_2.svg",
  "https://mollee-html-ten.vercel.app/assets/img/svg/brand_3.svg",
  "https://mollee-html-ten.vercel.app/assets/img/svg/brand_4.svg",
  "https://mollee-html-ten.vercel.app/assets/img/svg/brand_5.svg",
];

export default function AboutPage() {
  return (
    <div className="font-raleway bg-white text-[#444]">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 pt-12 pb-8 relative">
        <div className="flex-1 z-10">
          <h1 className="text-[70px] font-josefin font-normal leading-none mb-8">About</h1>
          <div className="flex items-center mb-2">
            <span className="h-5 w-1 bg-black mr-2"></span>
            <span className="text-lg">Home</span>
            <span className="mx-2 text-[#e7bcbc]">About</span>
          </div>
          <div className="border-b border-black w-full mt-2"></div>
        </div>
        <div className="flex-1 flex justify-end">
          <img
            src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&w=800&q=80"
            alt="About Hero"
            className="w-[500px] h-[350px] object-cover rounded-lg shadow-lg"
          />
        </div>
        {/* Dotted BG */}
        <div className="absolute left-0 top-0 w-64 h-64 opacity-20 pointer-events-none select-none hidden md:block">
          <svg width="100%" height="100%" viewBox="0 0 260 260">
            {Array.from({ length: 13 }).map((_, y) =>
              Array.from({ length: 13 }).map((_, x) => (
                <circle key={x + '-' + y} cx={20 * x} cy={20 * y} r="1.5" fill="#bbb" />
              ))
            )}
          </svg>
        </div>
      </section>

      {/* All About Company Section - Redesigned Layout */}
      <section className="px-6 md:px-20 py-12">
        <h2 className="about-company__title text-[40px] font-josefin font-normal mb-5 capitalize">All About Company</h2>
        <p className="about-company__text text-[20px] leading-[34px] max-w-[475px] mb-12">
          Official representative of the world-famous clothing brand Mollee in Europe and the world.
        </p>
        <div className="grid md:grid-cols-2 gap-12 relative">
          {/* Left Column */}
          <div className="flex flex-col gap-16 relative">
            {/* The Beginning Of Our Journey */}
            <div className="relative pl-12">
              <span className="about-section__year absolute left-[-60px] bottom-[-10px] text-[14px] font-medium rotate-[-90deg] whitespace-nowrap flex items-center">
                <span className="inline-block w-5 h-0.5 bg-black mr-2 align-middle"></span>2010
              </span>
              <h3 className="about-section__title text-[24px] font-josefin mb-2 capitalize">The Beginning Of Our Journey</h3>
              <p className="text-[16px] leading-[27px] max-w-[400px]">
                In 2010, our company celebrated its 10th anniversary - these are the years of acquired experience of trading around the world. Join us among our clients! You can buy only original things from us. We offer products of your favorite brands - clothes, shoes, accessories, textiles and much more – quality products for every taste and age from Europe.
              </p>
            </div>
            {/* 5649+ Satisfied clients with dotted bg and overlay */}
            <div className="relative flex flex-col items-center justify-center py-8">
              <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                <svg width="100%" height="100%" viewBox="0 0 260 120">
                  {Array.from({ length: 13 }).map((_, y) =>
                    Array.from({ length: 6 }).map((_, x) => (
                      <circle key={x + '-' + y} cx={40 * x} cy={20 * y} r="1.5" fill="#bbb" />
                    ))
                  )}
                </svg>
              </div>
              {/* White overlay behind text, then text above overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-95 rounded-2xl px-14 py-8 w-[300px] h-[120px] flex flex-col items-center justify-center"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="text-[56px] font-josefin font-normal mb-1">5649<span className="text-[40px] align-top">+</span></div>
                <div className="text-[22px]">Satisfied clients</div>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-16 relative">
            {/* 2587+ Products for you with dotted bg and overlay */}
            <div className="relative flex flex-col items-center justify-center py-8">
              <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                <svg width="100%" height="100%" viewBox="0 0 260 120">
                  {Array.from({ length: 13 }).map((_, y) =>
                    Array.from({ length: 6 }).map((_, x) => (
                      <circle key={x + '-' + y} cx={40 * x} cy={20 * y} r="1.5" fill="#bbb" />
                    ))
                  )}
                </svg>
              </div>
              {/* White overlay behind text, then text above overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-95 rounded-2xl px-14 py-8 w-[300px] h-[120px] flex flex-col items-center justify-center"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="text-[56px] font-josefin font-normal mb-1">2587<span className="text-[40px] align-top">+</span></div>
                <div className="text-[22px]">Products for you</div>
              </div>
            </div>
            {/* Who Are We Now? */}
            <div className="relative pl-12">
              <span className="about-section__year absolute left-[-60px] bottom-[-10px] text-[14px] font-medium rotate-[-90deg] whitespace-nowrap flex items-center">
                <span className="inline-block w-5 h-0.5 bg-black mr-2 align-middle"></span>2020
              </span>
              <h3 className="about-section__title text-[24px] font-josefin mb-2 capitalize">Who Are We Now?</h3>
              <p className="text-[16px] leading-[27px] max-w-[400px]">
                We now have a team of more than 1,000 skilled workers and about 167 clothing brands that cooperate with us. Ordering in our store is saving time and effort to find what you need; assistance of experienced consultants in choosing a model. Our specialists will help you specify your European size, tell you about fabrics and materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deal of the Week Section */}
      <section className="px-6 md:px-20 py-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <img
            src="https://mollee-html-ten.vercel.app/assets/img/deal-of-the-week-inner.jpg"
            alt="Multi-Brand Store"
            className="w-full max-w-[500px] h-[350px] object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="flex-1 max-w-xl">
          <span className="category-subtitle text-[14px] uppercase tracking-widest text-[#444] mb-2 block">Deal of the week</span>
          <h3 className="inner-deal__title text-[48px] md:text-[70px] font-josefin font-normal mb-4 capitalize leading-tight">Multi-Brand <br />Store Of Clothes</h3>
          <p className="inner-deal__text text-[16px] leading-[27px] max-w-[500px] mb-6">
            We follow fashion trends and have been working for you for more than 20 years. A selection of the best, interesting, and most importantly, boring outfits for different occasions.
          </p>
          <button className="bg-black text-white px-8 py-3 font-raleway text-lg font-medium transition hover:bg-[#222]">Shop Now</button>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Newsletter Section */}
      <section className="px-6 md:px-20 py-12 grid md:grid-cols-2 gap-12 items-center relative">
        <div>
          <h2 className="newsletter__title text-[32px] font-josefin font-normal mb-4 capitalize">Newsletter</h2>
          <p className="text-lg mb-8">Be the first to hear about deals, offers and upcoming collections.</p>
          <form className="flex gap-4 max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border-b border-gray-400 bg-transparent py-2 px-2 text-lg outline-none focus:border-black transition"
            />
            <button type="submit" className="bg-black text-white px-8 py-2 text-lg font-raleway font-medium transition hover:bg-[#222] shadow-md">Subscribe</button>
          </form>
        </div>
        <div className="flex justify-end">
          <img
            src="https://mollee-html-ten.vercel.app/assets/img/banner-newsletter.jpg"
            alt="Newsletter Banner"
            className="w-full max-w-[400px] h-[220px] object-cover rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Brands Section */}
      <section className="px-6 md:px-20 py-12 flex flex-wrap justify-center items-center gap-10 bg-white">
        {brands.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Brand ${i + 1}`}
            className="brands__logo max-w-[184px] max-h-[116px] object-contain"
            draggable="false"
          />
        ))}
      </section>
    </div>
  );
}
