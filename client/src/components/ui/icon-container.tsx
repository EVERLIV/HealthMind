import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconContainerProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral" | "soft-primary" | "soft-success" | "soft-info" | "soft-warning" | "soft-danger" | "soft-neutral";
  className?: string;
}

/**
 * Единый компонент для стилизации иконок по всему проекту
 * Обеспечивает консистентность форм, размеров и цветов
 * 
 * Встроенная защита от переполнения:
 * - flex-shrink-0: иконка не сжимается
 * - overflow-hidden: контент не выходит за границы
 * - max-scale ограничение для hover эффектов
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
    // Контрастные варианты (белый текст на цветном фоне)
    primary: "bg-medical-blue text-white border border-medical-blue/20 shadow-sm",
    secondary: "bg-trust-green text-white border border-trust-green/20 shadow-sm", 
    success: "bg-emerald-500 text-white border border-emerald-600/20 shadow-sm",
    warning: "bg-amber-500 text-white border border-amber-600/20 shadow-sm",
    danger: "bg-red-500 text-white border border-red-600/20 shadow-sm",
    info: "bg-blue-500 text-white border border-blue-600/20 shadow-sm",
    neutral: "bg-gray-500 text-white border border-gray-600/20 shadow-sm",
    
    // Мягкие варианты (цветной текст на светлом фоне)
    "soft-primary": "bg-medical-blue/10 text-medical-blue border border-medical-blue/20",
    "soft-success": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "soft-info": "bg-blue-50 text-blue-700 border border-blue-200",
    "soft-warning": "bg-amber-50 text-amber-700 border border-amber-200",
    "soft-danger": "bg-red-50 text-red-700 border border-red-200",
    "soft-neutral": "bg-gray-50 text-gray-700 border border-gray-200",
  };

  return (
    <div className={cn(
      // Базовые стили
      "rounded-2xl flex items-center justify-center shadow-sm",
      // Защита от переполнения
      "flex-shrink-0 overflow-hidden",
      // Ограничение hover эффектов для безопасности
      "hover:scale-[1.05] max-w-full max-h-full",
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