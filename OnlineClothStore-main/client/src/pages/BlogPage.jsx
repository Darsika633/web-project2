import React, { useState } from "react";
import { Link } from "react-router-dom";
// Raleway font import for this page only
const ralewayFont = {
  fontFamily: 'Raleway, sans-serif',
  fontSize: '16px',
  lineHeight: '27px',
};

export default function BlogPage() {
  const FILTERS = [
    "All",
    "Fashion",
    "NEW Collections",
    "Women Collection",
    "Men Collection",
    "Fashion Trends",
    "Lifestyle",
    "Culture"
  ];

  const allBlogPosts = [
    {
      title: "Fashion Trends In 2020: Style, Colors, Accessories",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_3.jpg",
      desc: "Explore the top fashion trends of 2020, including must-have colors and accessories for every wardrobe.",
      category: "Fashion"
    },
    {
      title: "The Most Popular Brand That People Use In USA",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_2.jpg",
      desc: "Discover the most popular clothing brands in the USA and what makes them stand out in the fashion industry.",
      category: "Fashion"
    },
    {
      title: "Updating The Wardrobe: What Clothes To Buy First",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_4.jpg",
      desc: "A guide to updating your wardrobe with essential pieces that never go out of style.",
      category: "NEW Collections"
    },
    {
      title: "The Main Clothing Trends Fall-Winter 2020",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_5.jpg",
      desc: "Stay warm and stylish with the main clothing trends for the fall-winter 2020 season.",
      category: "Fashion Trends"
    },
    {
      title: "How To Choose A Dress For A Special Occasion?",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_5.jpg",
      desc: "Tips and tricks for choosing the perfect dress for any special event or celebration.",
      category: "Women Collection"
    },
    {
      title: "Women's Fashion: How Not To Dress In 2020",
      date: "Aug 02, 2020",
      image: "https://mollee-html-ten.vercel.app/assets/img/examples/post-image_6.jpg",
      desc: "Common fashion mistakes to avoid and how to keep your style fresh and modern.",
      category: "Women Collection"
    },
    {
      title: "Men's Street Style Inspiration 2020",
      date: "Aug 03, 2020",
      image: "https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Get inspired by the latest street style looks for men this year.",
      category: "Men Collection"
    },
    {
      title: "Lifestyle Tips For Modern Women",
      date: "Aug 04, 2020",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Simple lifestyle changes to help you look and feel your best.",
      category: "Lifestyle"
    },
    {
      title: "Culture & Fashion: A Global Perspective",
      date: "Aug 05, 2020",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "How culture shapes the way we dress around the world.",
      category: "Culture"
    },
    {
      title: "Best Accessories For Every Season",
      date: "Aug 06, 2020",
      image: "https://images.pexels.com/photos/2983463/pexels-photo-2983463.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Must-have accessories to complete your look, no matter the season.",
      category: "Fashion"
    },
    {
      title: "How To Build A Capsule Wardrobe",
      date: "Aug 07, 2020",
      image: "https://images.pexels.com/photos/2983462/pexels-photo-2983462.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "A step-by-step guide to creating a timeless, versatile wardrobe.",
      category: "NEW Collections"
    },
    {
      title: "The Rise Of Sustainable Fashion",
      date: "Aug 08, 2020",
      image: "https://images.pexels.com/photos/167703/pexels-photo-167703.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Why sustainable fashion is more important than ever.",
      category: "Fashion Trends"
    },
    {
      title: "Men's Fashion: Classic vs. Modern",
      date: "Aug 09, 2020",
      image: "https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "A look at classic and modern styles for men.",
      category: "Men Collection"
    },
    {
      title: "How To Accessorize Like A Pro",
      date: "Aug 10, 2020",
      image: "https://images.pexels.com/photos/2983463/pexels-photo-2983463.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Tips for choosing and styling accessories for any outfit.",
      category: "Fashion"
    },
    {
      title: "The Best Summer Dresses 2020",
      date: "Aug 11, 2020",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Our picks for the best summer dresses this year.",
      category: "Women Collection"
    },
    {
      title: "Culture Meets Couture",
      date: "Aug 12, 2020",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "When traditional culture inspires high fashion.",
      category: "Culture"
    },
    {
      title: "Lifestyle: Minimalism In Fashion",
      date: "Aug 13, 2020",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "How minimalism is changing the way we dress.",
      category: "Lifestyle"
    },
    {
      title: "Men's Accessories: What To Wear",
      date: "Aug 14, 2020",
      image: "https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "A guide to the best accessories for men in 2020.",
      category: "Men Collection"
    },
    {
      title: "Fashion Trends: Prints & Patterns",
      date: "Aug 15, 2020",
      image: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "The prints and patterns you need to try this season.",
      category: "Fashion Trends"
    },
    {
      title: "Women's Fashion: Timeless Pieces",
      date: "Aug 16, 2020",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&fit=crop&w=600&q=80",
      desc: "Essential pieces every woman should own.",
      category: "Women Collection"
    }
  ];

  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;
  const filteredPosts = activeFilter === "All"
    ? allBlogPosts
    : allBlogPosts.filter(post => post.category === activeFilter);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  // Reset to page 1 when filter changes
  React.useEffect(() => { setCurrentPage(1); }, [activeFilter]);
  return (
    <div className="min-h-screen bg-white" style={ralewayFont}>
      {/* Hero Section with Breadcrumb and Right-side Banner */}
      <div className="w-full flex flex-col md:flex-row min-h-[320px] relative">
        {/* Left: Title and Breadcrumb */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 mt-4" style={{letterSpacing: '0.01em'}}>Blog</h1>
          <div className="flex items-center space-x-2 text-lg mb-2">
            <Link to="/" className="text-black hover:text-orange-400 transition-colors">Home</Link>
            <span className="text-pink-400">Blog</span>
          </div>
          <div className="w-full h-px bg-black mt-2"></div>
        </div>
        {/* Right: Banner Image */}
        <div className="hidden md:block md:w-1/2 h-[320px] relative">
          <img
            src="https://mollee-html-ten.vercel.app/assets/img/banner-blog.jpg"
            alt="Blog Banner"
            className="absolute inset-0 w-full h-full object-cover object-center rounded-bl-3xl"
          />
        </div>
      </div>
      {/* Filter Bar */}
      <div className="w-full flex justify-center pt-10 pb-6">
        <div className="flex flex-wrap gap-6 text-gray-500 text-base font-medium max-w-5xl w-full px-4">
          {FILTERS.map(filter => (
            <span
              key={filter}
              className={
                (activeFilter === filter
                  ? "border-b-2 border-black text-black "
                  : "hover:text-black ") +
                "pb-1 cursor-pointer"
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </span>
          ))}
        </div>
      </div>
      {/* Blog Cards Section */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl px-4 pb-20">
          {paginatedPosts.map((post, idx) => (
            <div key={idx} className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow duration-200">
              <img src={post.image} alt={post.title} className="w-full md:w-64 h-56 md:h-auto object-cover object-center" />
              <div className="flex flex-col justify-center p-8 flex-1">
                <h2 className="text-xl font-semibold text-black mb-2 group-hover:text-orange-500 transition-colors duration-200">{post.title}</h2>
                <span className="text-gray-400 text-sm mb-4">{post.date}</span>
                <button className="flex items-center text-black hover:text-orange-500 font-semibold text-base group mb-2">
                  <span className="mr-2">―</span> Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div className="w-full flex justify-center pb-12">
        <div className="flex items-center gap-4 text-lg text-gray-500 select-none">
          <span
            className={`cursor-pointer ${currentPage === 1 ? 'opacity-30 pointer-events-none' : ''}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >&#8592;</span>
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i + 1}
              className={
                (currentPage === i + 1
                  ? "border-b-2 border-black text-black "
                  : "hover:text-black ") +
                "px-2 cursor-pointer"
              }
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </span>
          ))}
          <span
            className={`cursor-pointer ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : ''}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >&#8594;</span>
        </div>
      </div>
    </div>
  );
}
