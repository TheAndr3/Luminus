'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PageLoadingWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageLoadingWrapper: React.FC<PageLoadingWrapperProps> = ({ 
  children, 
  className = "flex items-center justify-center h-full" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.includes('#') && !link.target) {
        const currentUrl = window.location.origin + pathname;
        if (link.href !== currentUrl) {
          setIsLoading(true);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoadingWrapper; 