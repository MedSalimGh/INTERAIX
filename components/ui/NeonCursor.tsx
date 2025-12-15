"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Particle {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  id: number;
}

export const NeonCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;

    if (!cursor || !ring) return;

    // Center initially
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      // Instant follow for dot
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });

      // Create particle trail
      if (Math.random() > 0.7) {
        const newParticle: Particle = {
          x: e.clientX,
          y: e.clientY,
          opacity: 1,
          scale: Math.random() * 0.5 + 0.5,
          id: particleIdRef.current++
        };
        
        setParticles(prev => [...prev.slice(-15), newParticle]);
      }
    };

    // Animation loop for smooth ring follow (lerp)
    const animateRing = () => {
      ringX += (mousePos.current.x - ringX) * 0.12;
      ringY += (mousePos.current.y - ringY) * 0.12;
      
      gsap.set(ring, { x: ringX, y: ringY });
      requestAnimationFrame(animateRing);
    };
    
    const rafId = requestAnimationFrame(animateRing);

    const onHoverStart = () => setIsHovering(true);
    const onHoverEnd = () => setIsHovering(false);
    
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    const interactiveElements = document.querySelectorAll("a, button, input, textarea, .cursor-hover");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", onHoverStart);
      el.addEventListener("mouseleave", onHoverEnd);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverStart);
        el.removeEventListener("mouseleave", onHoverEnd);
      });
    };
  }, []);

  // Animate particles fade out
  useEffect(() => {
    if (particles.length === 0) return;

    const timer = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({ ...p, opacity: p.opacity - 0.05, scale: p.scale * 0.95 }))
          .filter(p => p.opacity > 0)
      );
    }, 50);

    return () => clearInterval(timer);
  }, [particles.length]);

  // React to hovering state
  useEffect(() => {
    const ring = ringRef.current;
    const cursor = cursorRef.current;
    
    if (isHovering) {
      gsap.to(ring, { 
        scale: 1.8, 
        borderColor: "#00f3ff", 
        borderWidth: "3px",
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(cursor, { 
        scale: 0.5, 
        backgroundColor: "#00f3ff",
        duration: 0.3 
      });
    } else {
      gsap.to(ring, { 
        scale: 1, 
        borderColor: "rgba(0, 243, 255, 0.6)", 
        borderWidth: "2px",
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(cursor, { 
        scale: 1, 
        backgroundColor: "#00f3ff",
        duration: 0.3 
      });
    }
  }, [isHovering]);

  // React to clicking state
  useEffect(() => {
    const ring = ringRef.current;
    const cursor = cursorRef.current;
    
    if (isClicking) {
      gsap.to(ring, { scale: 0.8, duration: 0.1 });
      gsap.to(cursor, { scale: 0.8, duration: 0.1 });
    } else if (!isHovering) {
      gsap.to(ring, { scale: 1, duration: 0.2 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    }
  }, [isClicking, isHovering]);

  return (
    <>
      {/* Particle Trail */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed top-0 left-0 w-1 h-1 bg-neon-cyan rounded-full pointer-events-none z-[9997] blur-[1px]"
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px) scale(${particle.scale})`,
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Main Cursor Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-neon-cyan rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_rgba(0,243,255,0.8)]"
        style={{
          transition: "background-color 0.3s ease",
        }}
      />

      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 border-2 border-neon-cyan/60 rounded-full pointer-events-none z-[9998] box-border"
        style={{
          background: "radial-gradient(circle, rgba(0,243,255,0.1) 0%, transparent 70%)",
          boxShadow: "0 0 20px rgba(0,243,255,0.3)",
        }}
      />
    </>
  );
};
