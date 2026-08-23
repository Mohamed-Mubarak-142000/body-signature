"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { imageZoom, revealMask } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}

export function RevealImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  objectPosition = "object-center",
}: RevealImageProps) {
  // The reveal animation clips this element itself, so the IntersectionObserver
  // watches this plain, unclipped wrapper instead of the animated node below —
  // otherwise the clip-path makes the element self-report zero visible area
  // and it can never be detected as "in view".
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sentinelRef}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        className="absolute inset-0"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={revealMask}
      >
        <motion.div
          className="relative h-full w-full"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={imageZoom}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn("object-cover", objectPosition)}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
