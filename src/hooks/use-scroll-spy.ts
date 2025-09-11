"use client";

import { useState, useEffect } from 'react';

export function useScrollSpy(
  ids: string[],
  options: { offset?: number } = {}
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { offset = 0 } = options;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      let currentActiveId: string | null = null;
      
      // Find the last section that is above the offset line
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          if (element.offsetTop <= scrollPosition + offset) {
            currentActiveId = id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    // Initial check in case the user loads the page mid-scroll
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ids, offset]); // Re-run effect if ids or offset change

  return activeId;
}
