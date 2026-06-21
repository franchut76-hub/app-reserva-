"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function About() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".about-text", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 60%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-32 px-4 md:px-8 bg-[#ebe6db] text-brand-dark flex justify-center items-center">
      <div className="max-w-4xl text-center about-text">
        <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-snug">
          "Más que un cambio de imagen,<br />una experiencia de lujo calmado."
        </h2>
        <p className="text-lg text-brand-dark/80 font-light max-w-2xl mx-auto">
          Creemos que el verdadero lujo reside en los detalles, en la atención personalizada y en el silencio que permite desconectar del mundo exterior. Nuestro salón es tu santuario.
        </p>
      </div>
    </section>
  );
}
