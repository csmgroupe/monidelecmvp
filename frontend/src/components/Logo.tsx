import React from 'react';

export function Logo({ 
  className = "h-8", 
  variant = "default",
  collapsed = false 
}: { 
  className?: string; 
  variant?: "default" | "sidebar";
  collapsed?: boolean;
}) {
  return (
    <div className={`flex items-center ${className} ${variant === "sidebar" ? "justify-center" : ""}`}>
      <img
        src="/logo.svg"
        alt="LogoMonIDELEC.svg"
        className={`h-full transition-all duration-300 ${
          variant === "sidebar" 
            ? collapsed 
              ? "w-8" 
              : "w-full" 
            : ""
        }`}
        style={{ objectFit: 'contain', maxHeight: variant === "sidebar" ? "48px" : "32px" }}
      />
    </div>
  );
}