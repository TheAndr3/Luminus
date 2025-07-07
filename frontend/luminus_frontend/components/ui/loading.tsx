import React from 'react';

interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  isLoading, 
  children, 
  className = "flex items-center justify-center h-full" 
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Loading; 