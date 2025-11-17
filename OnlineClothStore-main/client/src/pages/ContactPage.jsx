import React from "react";
import { Link } from "react-router-dom";

const ralewayFont = {
  fontFamily: 'Raleway, sans-serif',
  fontSize: '16px',
  lineHeight: '27px',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white" style={ralewayFont}>
      {/* Hero Section with Breadcrumb and Right-side Banner */}
      <div className="w-full flex flex-col md:flex-row min-h-[320px] relative">
        {/* Left: Title and Breadcrumb */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 mt-4 tracking-tight" style={{letterSpacing: '0.01em'}}>Contact</h1>
          <div className="flex items-center space-x-2 text-lg mb-2">
            <Link to="/" className="text-black hover:text-orange-400 transition-colors">Home</Link>
            <span className="text-pink-400">Contact</span>
          </div>
          <div className="w-full h-px bg-black mt-2"></div>
        </div>
        {/* Right: Banner Image */}
        <div className="hidden md:block md:w-1/2 h-[320px] relative">
          <img
            src="https://images.pexels.com/photos/1181696/pexels-photo-1181696.jpeg?auto=compress&fit=crop&w=900&q=80"
            alt="Contact Banner"
            className="absolute inset-0 w-full h-full object-cover object-center rounded-bl-3xl"
          />
        </div>
      </div>
      {/* Contact Card Section */}
      <div className="w-full flex flex-col md:flex-row justify-center gap-8 mt-12 px-2 max-w-6xl mx-auto">
        {/* Contact Info and Map */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 max-w-md w-full px-8 py-10 flex flex-col gap-6 mb-8 md:mb-0">
          <div>
            <h2 className="text-2xl font-semibold text-black mb-2">Get in Touch</h2>
            <p className="text-gray-700 mb-4">We'd love to hear from you! Reach out with any questions or feedback.</p>
            <ul className="text-gray-700 space-y-1 text-base mt-2">
              <li><span className="font-semibold">Email:</span> support@clothstore.com</li>
              <li><span className="font-semibold">Phone:</span> +1 234 567 8901</li>
              <li><span className="font-semibold">Address:</span> 123 Fashion Ave, New York, NY</li>
              <li><span className="font-semibold">Customer Service:</span> Mon-Fri 9am-6pm, Sat 10am-4pm</li>
            </ul>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 mt-2">
            <iframe
              title="Store Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.00597%2C40.71278%2C-74.00597%2C40.71278&amp;layer=mapnik"
              className="w-full h-48"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 max-w-lg w-full px-8 py-10 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-black mb-2">Send Us a Message</h2>
          <form className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Your Name" className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black bg-white" required />
              <input type="email" placeholder="Your Email" className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black bg-white" required />
            </div>
            <input type="text" placeholder="Subject" className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black bg-white" required />
            <textarea placeholder="Your Message" rows={4} className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black bg-white" required />
            <button type="submit" className="w-max bg-black text-white px-8 py-2 rounded hover:bg-gray-800 transition-colors font-medium mt-2">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
