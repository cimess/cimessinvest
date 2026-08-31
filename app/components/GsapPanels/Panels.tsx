import React from 'react';

type Props = {
  children: React.ReactNode;
  bgClass?: string; // Optional background color
};

const Panel: React.FC<Props> = ({ children, bgClass = "bg-white" }) => {
  return (
    <section className={`gsap-panel w-full relative ${bgClass}`}>
      {/* 
        FIX: Changed to flex-col and justify-start so multiple images 
        and descriptions can stack naturally on top of each other! 
      */}
      <div className="gsap-panel-inner w-full min-h-screen flex flex-col items-center justify-start relative">
        {children}
      </div>
    </section>
  );
};

export default Panel;
