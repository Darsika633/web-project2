import React from "react";
export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-white ">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Free Shipping */}
          <div className="text-center">
            <div className="mb-6">
              <img
                src="https://mollee-html-ten.vercel.app/assets/img/svg/advantages-icon_1.svg"
                alt="Free Shipping"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3
              className="advantage__title"
              style={{
                padding: "0 0 14px",
                font: "400 24px / 28px 'Josefin Sans', sans-serif",
                textTransform: "capitalize",
                color: "#000",
              }}
            >
              Free Shipping
            </h3>
            <div className="w-16 h-px bg-black mx-auto mb-4"></div>
            <p
              style={{
                font: "16px / 27px Raleway, sans-serif",
                color: "#444",
              }}
            >
              Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit
            </p>
          </div>

          {/* 24/7 Customer Service */}
          <div className="text-center">
            <div className="mb-6">
              <img
                src="https://mollee-html-ten.vercel.app/assets/img/svg/advantages-icon_2.svg"
                alt="24/7 Customer Service"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3
              className="advantage__title"
              style={{
                padding: "0 0 14px",
                font: "400 24px / 28px 'Josefin Sans', sans-serif",
                textTransform: "capitalize",
                color: "#000",
              }}
            >
              24/7 Customer Service
            </h3>
            <div className="w-16 h-px bg-black mx-auto mb-4"></div>
            <p
              style={{
                font: "16px / 27px Raleway, sans-serif",
                color: "#444",
              }}
            >
              Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit
            </p>
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center">
            <div className="mb-6">
              <img
                src="https://mollee-html-ten.vercel.app/assets/img/svg/advantages-icon_3.svg"
                alt="Money Back Guarantee"
                className="w-12 h-12 mx-auto"
              />
            </div>
            <h3
              className="advantage__title"
              style={{
                padding: "0 0 14px",
                font: "400 24px / 28px 'Josefin Sans', sans-serif",
                textTransform: "capitalize",
                color: "#000",
              }}
            >
              Money Back Guarantee
            </h3>
            <div className="w-16 h-px bg-black mx-auto mb-4"></div>
            <p
              style={{
                font: "16px / 27px Raleway, sans-serif",
                color: "#444",
              }}
            >
              Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
