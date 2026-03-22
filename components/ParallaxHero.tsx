"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxHeroProps {
  src: string;
  srcDesktop?: string;
  alt: string;
  objectPosition?: string;
}

export default function ParallaxHero({ src, srcDesktop, alt, objectPosition = "object-top" }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!containerRef.current || !imageRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Only apply parallax while container is visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      imageRef.current.style.transform = `translateY(${-rect.top * 0.25}px)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[67vw] md:h-[65vh] overflow-hidden">
      {/* scale-110 gives extra image room so parallax movement never shows gaps */}
      <div ref={imageRef} className="absolute inset-0 scale-110">
        {srcDesktop ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              priority
              className={`object-cover ${objectPosition} md:hidden`}
              quality={90}
              sizes="100vw"
            />
            <Image
              src={srcDesktop}
              alt={alt}
              fill
              priority
              className={`object-cover ${objectPosition} hidden md:block`}
              quality={90}
              sizes="100vw"
            />
          </>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className={`object-cover ${objectPosition}`}
            quality={90}
            sizes="100vw"
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
