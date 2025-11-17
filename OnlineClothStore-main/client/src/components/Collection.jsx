import React from 'react';
const collections = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
    subtitle: "NEW ACCESSORIES",
    title: "Fashion For This Summer",
    description: "Discover the latest trends in summer fashion accessories",
    tag: "New",
    link: "/product"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=center&auto=format&q=80",
    subtitle: "MEN COLLECTION",
    title: "New Autumn Arrivals 2020",
    description: "Sophisticated styles for the modern gentleman",
    tag: "Hot",
    link: "/product"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    subtitle: "WOMEN COLLECTION",
    title: "Trendy Look For Every Day",
    description: "Elegant pieces for your everyday wardrobe",
    tag: "Trendy",
    link: "/product"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop&crop=center&auto=format&q=80",
    subtitle: "SEASON SALE",
    title: "Season Sale",
    description: "Exclusive offers on premium fashion items",
    tag: "Sale",
    link: "/product"
  }
];

const Collection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">
            Modern Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Shop the latest, hottest, and most exclusive fashion trends in a modern, card-based layout.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {collections.map((item) => (
            <div key={item.id} className="relative group rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg overflow-hidden hover:shadow-gray-300 transition-shadow duration-500">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-3xl group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className={`absolute top-4 left-4 px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse ${
                item.tag === "New" ? "bg-pink-500 text-white" :
                item.tag === "Hot" ? "bg-red-500 text-white" :
                item.tag === "Trendy" ? "bg-blue-500 text-white" :
                "bg-yellow-400 text-black"
              }`}>
                {item.tag}
              </div>
              {/* Overlay only visible on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto">
                <span className="inline-block text-sm font-medium text-gray-500 uppercase tracking-[0.3em] border-b border-gray-200 pb-2 mb-2">
                  {item.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 mb-4">{item.description}</p>
                <a
                  href={item.link}
                  className="inline-flex items-center px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl shadow hover:bg-gray-800 transition-colors"
                >
                  Shop Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-24 lg:mt-32">
          <a href="/product">
            <button className="group relative overflow-hidden bg-gray-900 text-white px-12 py-4 text-base font-semibold tracking-widest uppercase rounded-xl shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-black hover:shadow-2xl hover:-translate-y-1">
              <span className="relative z-10 flex items-center gap-3">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white group-hover:text-gray-300 transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' /></svg>
                View All Collections
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Collection;