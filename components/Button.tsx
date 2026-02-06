
import React from 'react';

// FIX: Removed unused and incorrect import of COLORS from '../types' which was causing a build error
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className, 
  ...props 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: `bg-[#002951] text-white hover:bg-[#001c38] shadow-md`,
    secondary: `bg-[#04768A] text-white hover:bg-[#035d6d] shadow-md`,
    outline: `border-2 border-[#002951] text-[#002951] hover:bg-[#002951] hover:text-white`
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading} 
      {...props}
    >
      {isLoading ? (
        <i className="fas fa-circle-notch animate-spin"></i>
      ) : (
        icon && <i className={`fas ${icon}`}></i>
      )}
      {children}
    </button>
  );
};

export default Button;
