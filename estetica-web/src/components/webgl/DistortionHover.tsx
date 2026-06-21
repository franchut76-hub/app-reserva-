"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface DistortionHoverProps {
  image1: string;
  image2: string;
  displacementImage: string;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D disp;
uniform float dispFactor;
uniform float effectFactor;
uniform vec2 resolution;
uniform vec2 imageResolution;

void main() {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec4 dispMap = texture2D(disp, uv);
  vec2 distortedPosition1 = vec2(uv.x + dispFactor * (dispMap.r * effectFactor), uv.y);
  vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (dispMap.r * effectFactor), uv.y);

  vec4 _texture1 = texture2D(texture1, distortedPosition1);
  vec4 _texture2 = texture2D(texture2, distortedPosition2);

  gl_FragColor = mix(_texture1, _texture2, dispFactor);
}
`;

export default function DistortionHover({
  image1,
  image2,
  displacementImage,
}: DistortionHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const parent = containerRef.current;
    let parentWidth = parent.offsetWidth;
    let parentHeight = parent.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      parentWidth / -2,
      parentWidth / 2,
      parentHeight / 2,
      parentHeight / -2,
      1,
      1000
    );
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 0.0);
    renderer.setSize(parentWidth, parentHeight);
    parent.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";

    const texture1 = loader.load(image1, (tex) => {
      if (material) {
        material.uniforms.imageResolution.value.set(tex.image.width, tex.image.height);
      }
    });
    const texture2 = loader.load(image2);
    const disp = loader.load(displacementImage);

    disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

    // A geometry that fits the container exactly
    const geometry = new THREE.PlaneGeometry(parentWidth, parentHeight, 1, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        effectFactor: { value: 1.2 },
        dispFactor: { value: 0.0 },
        texture1: { value: texture1 },
        texture2: { value: texture2 },
        disp: { value: disp },
        resolution: { value: new THREE.Vector2(parentWidth, parentHeight) },
        imageResolution: { value: new THREE.Vector2(1920, 1080) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      opacity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Mouse interactions
    const handleMouseEnter = () => {
      gsap.to(material.uniforms.dispFactor, {
        duration: 1,
        value: 1,
        ease: "expo.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(material.uniforms.dispFactor, {
        duration: 1,
        value: 0,
        ease: "expo.out",
      });
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!parent) return;
      parentWidth = parent.offsetWidth;
      parentHeight = parent.offsetHeight;

      renderer.setSize(parentWidth, parentHeight);
      if (material) {
        material.uniforms.resolution.value.set(parentWidth, parentHeight);
      }

      camera.left = parentWidth / -2;
      camera.right = parentWidth / 2;
      camera.top = parentHeight / 2;
      camera.bottom = parentHeight / -2;
      camera.updateProjectionMatrix();

      // Also update geometry to fill screen again
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(parentWidth, parentHeight, 1, 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      
      parent.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture1.dispose();
      texture2.dispose();
      disp.dispose();
    };
  }, [image1, image2, displacementImage]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    ></div>
  );
}
