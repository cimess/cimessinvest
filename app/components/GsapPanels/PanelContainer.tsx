import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PanelContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Get all panels safely
    const panels = gsap.utils.toArray(".gsap-panel") as HTMLElement[];
    if (panels.length === 0) return;

    // 2. Pop the last one so it doesn't fade out at the very end
    panels.pop();

    panels.forEach((panel) => {
      // Much simpler! Just trigger when the user naturally scrolls to the bottom of the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "bottom bottom", // When bottom of panel hits bottom of screen
          end: "bottom top",      // Keep pinned until the next section completely covers it
          pinSpacing: false,
          pin: true,
          scrub: true
        }
      });
      
      // Animate the scale and fade out effect
      tl.fromTo(panel, 
        { scale: 1, opacity: 1 }, 
        { scale: 0.7, opacity: 0.5, duration: 0.9 }
      ).to(panel, { opacity: 0, duration: 0.1 });
    });

    return () => {
      // Cleanup GSAP when component unmounts
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);


  return <div ref={containerRef} className="w-full relative overflow-x-hidden bg-black">{children}</div>;
};

export default PanelContainer;
