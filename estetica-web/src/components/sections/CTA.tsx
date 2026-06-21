"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

export default function CTA() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".cta-content", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-32 px-4 bg-brand-dark text-white text-center">
      <div className="max-w-3xl mx-auto cta-content flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-serif mb-8">Comienza tu viaje</h2>
        <p className="text-lg md:text-xl text-white/70 font-light mb-12">
          Reserva tu cita hoy y déjanos cuidar de ti con la atención que mereces.
        </p>
        <Link
          href="/reservar"
          className="inline-block bg-brand-accent text-white px-10 py-5 rounded-full text-base font-medium tracking-widest uppercase hover:bg-white hover:text-brand-accent transition-colors duration-500"
        >
          Reserva tu cita
        </Link>
      </div>
    </section>
  );
}
