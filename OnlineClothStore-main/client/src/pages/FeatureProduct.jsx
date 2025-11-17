import React from "react";
import ProductCard from "../ui/ProductCard";
import { useState } from "react";
import { Button } from "../ui/button";
const FeatureProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
  const url = import.meta.env.VITE_API_BASE_URL + "/api/products";
        const response = await fetch(url);
        const data = await response.json();
        const apiProducts = data?.data?.products || [];
        setProducts(apiProducts);
        // Collect unique categories from ALL products
        const cats = [
          ...new Set(
            apiProducts.flatMap((p) => {
              if (Array.isArray(p.category)) {
                return p.category.map((cat) =>
                  cat && typeof cat === "object" && cat.name ? cat.name : cat
                );
              }
              if (
                p.category &&
                typeof p.category === "object" &&
                !Array.isArray(p.category) &&
                p.category.name
              ) {
                return [p.category.name];
              }
              if (typeof p.category === "string") return [p.category];
              return [];
            })
          ),
        ].filter((cat) => typeof cat === "string");
        setCategories(["All", ...cats]);
      } catch {
        setProducts([]);
        setCategories(["All"]);
      }
    };
    fetchProducts();
  }, []);

  // Filter by selected category
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => {
          if (Array.isArray(p.category)) {
            return p.category.some((cat) =>
              cat && typeof cat === "object" && cat.name
                ? cat.name === activeCategory
                : cat === activeCategory
            );
          }
          if (
            p.category &&
            typeof p.category === "object" &&
            !Array.isArray(p.category) &&
            p.category.name
          ) {
            return p.category.name === activeCategory;
          }
          if (typeof p.category === "string")
            return p.category === activeCategory;
          return false;
        });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <p className="uppercase mb-2 sm:mb-3 font-raleway tracking-[0.2em] text-xs sm:text-sm text-[#444444]">
          <span className="font-semibold">NEW </span>COLLECTIONS
        </p>
        <h2 className="mb-4 sm:mb-6 font-josefin-sans text-3xl sm:text-4xl md:text-5xl lg:text-[40px] lg:leading-[1] font-normal capitalize text-gray-900 leading-tight pb-3 sm:pb-5">
          Featured Products
        </h2>
      </div>

      <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16">
        <nav className="flex flex-wrap justify-center gap-1 sm:space-x-1 bg-gray-100 rounded-full p-1 max-w-full overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
                category === activeCategory
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {filteredProducts.map((product, index) => {
          // Use main image if available
          let mainImage = Array.isArray(product.images)
            ? product.images.find((img) => img.isMain) || product.images[0]
            : undefined;
          // Use sale price if available, else regular
          let price =
            Array.isArray(product.variants) && product.variants[0]?.price
              ? product.variants[0].price.sale ??
                product.variants[0].price.regular
              : product.price ?? 0;
          // Total quantity from all variants
          let totalQuantity = Array.isArray(product.variants)
            ? product.variants.reduce(
                (sum, v) => sum + (v.stockQuantity || 0),
                0
              )
            : product.totalStock ?? 0;
          let badge = product.isFeatured
            ? "FEATURED"
            : typeof product.discountPercentage === "number" &&
              product.discountPercentage > 0
            ? "SALE"
            : undefined;
          return (
            <div
              key={product._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard
                product={{
                  ...product,
                  name: product.name,
                  image: mainImage?.url,
                  price,
                  totalQuantity,
                  badge,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8 sm:mt-10 lg:mt-12">
        <a href="/product">
          <Button
            className="bg-black text-white px-8 sm:px-10 lg:px-12 py-3 sm:py-4 text-xs sm:text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl border-2 border-black hover:border-gray-800 rounded-none relative overflow-hidden group w-full sm:w-auto max-w-xs"
            size="md"
          >
            <span className="relative z-10">See All Products</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </a>
      </div>
    </div>
  );
};

export default FeatureProduct;
