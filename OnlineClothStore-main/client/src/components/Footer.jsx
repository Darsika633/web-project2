import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white py-8 px-4">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="max-w-sm mx-auto text-center">
          {/* MOLLEE Brand Section - Centered */}
          <div className="mb-8">
            <div className="mb-4">
              <img
                src="https://mollee-html-ten.vercel.app/assets/img/svg/logo.svg"
                alt="MOLLEE"
                className="h-6 mx-auto"
              />
            </div>
            <p className="footer-description text-center mb-6">
              TrendByte brings you the latest fashion collections and top-quality products. Join our community and stay stylish every season!
            </p>
            <div>
              <p className="footer-description text-center mb-2">Find us here:</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <span>FB</span>
                <span>—</span>
                <span>TW</span>
                <span>—</span>
                <span>INS</span>
                <span>—</span>
                <span>PT</span>
              </div>
            </div>
          </div>

          {/* Newsletter Section - Centered */}
          <div className="mb-8">
            <h3 className="footer-title-mobile text-center">Newsletter</h3>
            <p className="footer-description text-center mb-6">
              Subscribe to be the first to hear about deals, offers and upcoming collections.
            </p>
            <div className="flex border border-gray-300 max-w-xs mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none bg-white"
              />
              <button className="px-3 py-2 bg-white border-l border-gray-300 hover:bg-gray-50 transition-colors">
                <img
                  src="https://mollee-html-ten.vercel.app/assets/img/svg/send__red.svg"
                  alt="Send"
                  className="w-4 h-4"
                />
              </button>
            </div>
          </div>

          {/* About and Useful Links - Side by Side */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* About Section */}
            <div className="text-left">
              <h3 className="footer-title-mobile">About</h3>
              <nav className="space-y-1">
                <a href="#" className="footer-nav__link-mobile">
                  About us
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Collections
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Shop
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Blog
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Contact us
                </a>
              </nav>
            </div>

            {/* Useful Links Section */}
            <div className="text-left">
              <h3 className="footer-title-mobile">Useful Links</h3>
              <nav className="space-y-1">
                <a href="#" className="footer-nav__link-mobile">
                  Privacy Policy
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Terms of use
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Support
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  Shipping details
                </a>
                <a href="#" className="footer-nav__link-mobile">
                  FAQs
                </a>
              </nav>
            </div>
          </div>

          {/* Bottom Section - Mobile */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-700 mb-4 text-center">
              © All right reserved. Mollee 2021
            </p>
            <div className="text-center">
              <span className="text-sm text-gray-700 block mb-3">
                Payment methods:
              </span>
              <div className="flex justify-center space-x-2">
                <img
                  src="https://mollee-html-ten.vercel.app/assets/img/payment_1.png"
                  alt="Payment method 1"
                  className="h-5"
                />
                <img
                  src="https://mollee-html-ten.vercel.app/assets/img/payment_2.png"
                  alt="Payment method 2"
                  className="h-5"
                />
                <img
                  src="https://mollee-html-ten.vercel.app/assets/img/payment_3.png"
                  alt="Payment method 3"
                  className="h-5"
                />
                <img
                  src="https://mollee-html-ten.vercel.app/assets/img/payment_4.png"
                  alt="Payment method 4"
                  className="h-5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* MOLLEE Brand Section */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <span className="text-2xl font-bold tracking-wide text-gray-900">TrendByte</span>
              </div>
              <span className="footer-description">
                TrendByte brings you the latest fashion collections and top-quality products.<br />
                Join our community and stay stylish every season!
              </span>
              <div className="mt-6">
                <span className="footer-description">Find us here:</span>
                <div className="flex items-center space-x-2 text-base leading-7 font-raleway text-gray-700">
                  <span>FB</span>
                  <span>—</span>
                  <span>TW</span>
                  <span>—</span>
                  <span>INS</span>
                  <span>—</span>
                  <span>PT</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="md:col-span-1">
              <h3 className="footer-title">About</h3>
              <nav className="space-y-1">
                <a href="/about" className="footer-nav__link">
                  About us
                </a>
                <a href="/product" className="footer-nav__link">
                  Collections
                </a>
                <a href="/product" className="footer-nav__link">
                  Shop
                </a>
                <a href="/blog" className="footer-nav__link">
                  Blog
                </a>
                <a href="/contact" className="footer-nav__link">
                  Contact us
                </a>
              </nav>
            </div>

            {/* Useful Links Section */}
            <div className="md:col-span-1">
              <h3 className="footer-title">Useful Links</h3>
              <nav className="space-y-1">
                <a href="#" className="footer-nav__link">
                  Privacy Policy
                </a>
                <a href="#" className="footer-nav__link">
                  Terms of use
                </a>
                <a href="#" className="footer-nav__link">
                  Support
                </a>
                <a href="#" className="footer-nav__link">
                  Shipping details
                </a>
                <a href="#" className="footer-nav__link">
                  FAQs
                </a>
              </nav>
            </div>

            {/* Newsletter Section */}
            <div className="md:col-span-1">
              <h3 className="footer-title">Newsletter</h3>
              <p className="text-base leading-7 font-raleway text-gray-700 mb-6">
                Subscribe to be the first to hear about deals, offers and upcoming
                collections.
              </p>
              <div className="flex border border-gray-300">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 text-base leading-7 font-raleway text-gray-700 placeholder-gray-500 focus:outline-none bg-white"
                />
                <button className="px-4 py-3 bg-white border-l border-gray-300 hover:bg-gray-50 transition-colors">
                  <img
                    src="https://mollee-html-ten.vercel.app/assets/img/svg/send__red.svg"
                    alt="Send"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-base leading-7 font-raleway text-gray-700 mb-4 md:mb-0">
                © All right reserved. TrendByte 2021
              </p>
              <div className="flex items-center">
                <span className="text-base leading-7 font-raleway text-gray-700 mr-4">
                  Payment methods:
                </span>
                <div className="flex space-x-2">
                  <img
                    src="https://mollee-html-ten.vercel.app/assets/img/payment_1.png"
                    alt="Payment method 1"
                    className="h-6"
                  />
                  <img
                    src="https://mollee-html-ten.vercel.app/assets/img/payment_2.png"
                    alt="Payment method 2"
                    className="h-6"
                  />
                  <img
                    src="https://mollee-html-ten.vercel.app/assets/img/payment_3.png"
                    alt="Payment method 3"
                    className="h-6"
                  />
                  <img
                    src="https://mollee-html-ten.vercel.app/assets/img/payment_4.png"
                    alt="Payment method 4"
                    className="h-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
