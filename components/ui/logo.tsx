'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <div className="transition-all duration-300 cursor-pointer drop-shadow-lg hover:scale-105"> 
      <Image
        src="/uploads/logo.png"
        alt="SAC Logo"
        width={220}
        height={90}
        className="h-[90px] w-auto transition-all duration-300 brightness-100 hover:brightness-140"
        priority
      />
    </div>
  );
};

export default Logo;