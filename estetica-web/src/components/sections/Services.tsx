"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Services({ services }: { services: any[] }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".service-item", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-32 px-4 md:px-8 bg-brand-nude text-brand-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Nuestros Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {services?.map((s, i) => (
            <div key={i} className="service-item border-t border-brand-dark/20 pt-8 flex flex-col h-full">
              <h3 className="text-2xl font-serif mb-4">{s.name}</h3>
              <p className="text-brand-dark/70 font-light leading-relaxed flex-1">{s.description || 'Sin descripción'}</p>
              <div className="mt-6 flex justify-between items-center text-sm font-medium">
                <span className="uppercase tracking-widest text-brand-dark/50">{s.duration_minutes} min</span>
                <span className="text-xl text-[#c6a87c]">{s.price}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
