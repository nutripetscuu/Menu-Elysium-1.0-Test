"use client";

import { useState, useEffect, useCallback } from 'react';

// Throttle function to limit scroll event frequency
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function useScrollSpy(
  ids: string[],
  options: { offset?: number; throttleMs?: number } = {}
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { offset = 200, throttleMs = 100 } = options;

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const scrollPosition = window.scrollY + offset;
    let currentActiveId: string | null = null;
    
    // Find the section that is currently most visible
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const element = document.getElementById(id);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;
        
        // Check if the element is in view
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          currentActiveId = id;
          break;
        }
        
        // If we're past the element, check if it should still be active
        if (scrollPosition >= elementTop) {
          currentActiveId = id;
        }
      }
    }

    setActiveId(currentActiveId);
  }, [ids, offset]);

  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, throttleMs);

    // Initial check
    handleScroll();

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', throttledHandleScroll);
    };
  }, [handleScroll, throttleMs]);

  return activeId;
}
