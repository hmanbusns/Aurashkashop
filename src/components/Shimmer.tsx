import React from 'react';

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ 
  className = "", 
  width = "100%", 
  height = "20px",
  rounded = "rounded-lg"
}) => {
  return (
    <div 
      className={`relative overflow-hidden bg-surface/50 ${rounded} ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-cream/20 to-transparent shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)]" />
    </div>
  );
};

export const ProductShimmer = () => (
  <div className="flex flex-col gap-3">
    <Shimmer height="180px" rounded="rounded-[24px]" />
    <div className="px-1 space-y-2">
      <Shimmer width="80%" height="14px" />
      <Shimmer width="40%" height="16px" />
    </div>
  </div>
);

export const CategoryShimmer = () => (
  <div className="flex flex-col items-center gap-2">
    <Shimmer width="40px" height="40px" rounded="rounded-full" />
    <Shimmer width="30px" height="8px" />
  </div>
);

export const PageShimmer = () => (
  <div className="min-h-screen bg-background p-4 space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Shimmer width="32px" height="32px" />
        <Shimmer width="100px" height="20px" />
      </div>
      <Shimmer width="40px" height="40px" rounded="rounded-full" />
    </div>
    <Shimmer height="180px" rounded="rounded-[32px]" />
    <div className="flex gap-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <CategoryShimmer key={i} />
      ))}
    </div>
    <div className="space-y-4">
      <Shimmer width="150px" height="24px" />
      <div className="flex gap-3 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[140px]">
            <ProductShimmer />
          </div>
        ))}
      </div>
    </div>
  </div>
);
