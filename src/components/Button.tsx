
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  to?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  to,
  children,
  ...props
}) => {
  const baseStyles = cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      // Variant styles
      "bg-primary text-primary-foreground shadow hover:opacity-90": variant === 'default' || variant === 'primary',
      "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
      "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground": variant === 'outline',
      "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
      "text-primary underline-offset-4 hover:underline": variant === 'link',
      
      // Size styles
      "h-9 px-4 py-2": size === 'default',
      "h-8 rounded-md px-3 text-xs": size === 'sm',
      "h-11 rounded-md px-8": size === 'lg',
      "h-9 w-9": size === 'icon',
    },
    className
  );
  
  // If 'to' prop is provided, render a Link component instead of a button
  if (to) {
    return (
      <Link to={to} className={baseStyles}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={baseStyles} {...props}>
      {children}
    </button>
  );
};

export default Button;
