"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import DistortionHover from "../webgl/DistortionHover";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, SplitText);
}

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useGSAP(
    () => {
      if (!headlineRef.current) return;

      const split = new SplitText(headlineRef.current, { type: "lines" });

      gsap.from(split.lines, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.2,
      });

      gsap.from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        delay: 0.8,
      });
      
      gsap.from(".hero-cta", {
        y: 20,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        delay: 1,
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="relative w-full h-screen overflow-hidden bg-brand-nude text-brand-dark">
      {/* WebGL Background or Fallback */}
      <div className="absolute inset-0 z-0">
        {isDesktop ? (
          <DistortionHover
            image1="/images/img1.png"
            image2="/images/img2.png"
            displacementImage="/images/disp.png"
          />
        ) : (
          <img 
            src="/images/img1.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        )}
        {/* Overlay for readability if needed */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
        <h1
          ref={headlineRef}
          className="text-6xl md:text-8xl lg:text-9xl font-serif leading-tight tracking-tight text-white uppercase mb-6 drop-shadow-lg"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          Eleva tu<br />belleza.
        </h1>
        <p className="hero-subtitle text-lg md:text-2xl text-white/90 font-light mb-10 max-w-xl mx-auto tracking-wide drop-shadow-md">
          Experimenta el arte del cuidado capilar y estético en un espacio diseñado para tu bienestar.
        </p>
        <Link
          href="/reservar"
          className="hero-cta inline-block bg-brand-accent text-white px-8 py-4 rounded-full text-sm md:text-base font-medium tracking-widest uppercase hover:bg-white hover:text-brand-accent transition-colors duration-500 shadow-xl"
        >
          Reserva tu cita
        </Link>
      </div>
    </section>
  );
}
