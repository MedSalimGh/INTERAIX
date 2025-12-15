"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
// import { PerformanceMonitor } from "@react-three/drei"; 

// Since PerformanceMonitor can be complex, we'll build a simple FPS tracker
export const AdaptiveQualityManager = ({ 
  setQuality 
}: { 
  setQuality: (quality: 'high' | 'medium' | 'low') => void 
}) => {
  const { gl } = useThree();
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);

  useFrame(() => {
    setFrameCount((prev) => prev + 1);
    
    const time = performance.now();
    if (time >= lastTime + 1000) {
      const fps = frameCount;
      setFpsHistory((prev) => {
        const newHistory = [...prev, fps];
        if (newHistory.length > 5) newHistory.shift(); // Keep last 5 seconds
        return newHistory;
      });

      // Calculate average FPS
      if (fpsHistory.length > 0) {
        const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
        
        if (avgFps < 30) {
          setQuality('low');
          gl.setPixelRatio(1); // Force 1x pixel ratio
        } else if (avgFps < 50) {
          setQuality('medium');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        } else {
          setQuality('high');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
      }

      setFrameCount(0);
      setLastTime(time);
    }
  });

  return null;
};
