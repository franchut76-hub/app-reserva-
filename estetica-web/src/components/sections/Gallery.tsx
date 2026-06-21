"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Gallery() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".gallery-img").forEach((img) => {
      gsap.to(img, {
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        y: 100,
        ease: "none",
      });
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-20 px-4 md:px-8 bg-brand-nude">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 justify-center items-center">
        <div className="w-full md:w-1/2 h-[60vh] overflow-hidden rounded-sm">
          <img
            src="/images/img1.png"
            alt="Gallery 1"
            className="gallery-img w-full h-[120%] object-cover -translate-y-10"
          />
        </div>
        <div className="w-full md:w-1/3 h-[40vh] md:mt-32 overflow-hidden rounded-sm">
          <img
            src="/images/img2.png"
            alt="Gallery 2"
            className="gallery-img w-full h-[120%] object-cover -translate-y-10"
          />
        </div>
      </div>
    </section>
  );
}
