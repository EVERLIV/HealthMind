import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconContainerProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

/**
 * Единый компонент для стилизации иконок по всему проекту
 * Обеспечивает консистентность форм, размеров и цветов
 */
export function IconContainer({ 
  children, 
  size = "md", 
  variant = "neutral", 
  className 
}: IconContainerProps) {
  const sizeClasses = {
    xs: "w-6 h-6 p-1", // иконка 4x4
    sm: "w-8 h-8 p-2", // иконка 4x4 
    md: "w-10 h-10 p-2", // иконка 6x6
    lg: "w-12 h-12 p-3", // иконка 6x6
    xl: "w-16 h-16 p-4", // иконка 8x8
  };

  const variantClasses = {
    primary: "bg-medical-blue/15 text-medical-blue border border-medical-blue/20",
    secondary: "bg-trust-green/15 text-trust-green border border-trust-green/20", 
    success: "bg-emerald-100 text-emerald-600 border border-emerald-200",
    warning: "bg-amber-100 text-amber-600 border border-amber-200",
    danger: "bg-red-100 text-red-600 border border-red-200",
    info: "bg-blue-100 text-blue-600 border border-blue-200",
    neutral: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <div className={cn(
      "rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Стандартные размеры иконок для использования внутри IconContainer
 */
export const iconSizes = {
  xs: "w-3 h-3", // для размера xs контейнера
  sm: "w-4 h-4", // для размера sm контейнера  
  md: "w-5 h-5", // для размера md контейнера
  lg: "w-6 h-6", // для размера lg контейнера
  xl: "w-8 h-8", // для размера xl контейнера
} as const;