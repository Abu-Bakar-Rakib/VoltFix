import React from 'react';

interface TakaIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TakaIcon: React.FC<TakaIconProps> = ({ className = 'w-4 h-4', size }) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-xl'
      : size === 'md'
      ? 'text-base'
      : 'text-sm';

  return (
    <span
      className={`inline-flex items-center justify-center font-black font-heading leading-none select-none ${sizeClasses} ${className}`}
      aria-label="Bangladeshi Taka (৳)"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      ৳
    </span>
  );
};

export default TakaIcon;
