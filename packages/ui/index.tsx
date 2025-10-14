/**
 * 🎨 UI PACKAGE - Sistema de Diseño Unificado
 * 
 * Componentes compartidos con el design system épico
 */

import React from 'react';
import { motion } from 'framer-motion';

// Design System Colors
export const COLORS = {
  // Theme Principal
  bg: {
    primary: '#0A0C10',      // Carbón profundo
    secondary: '#1a1d29',    // Gris oscuro
    glass: 'rgba(255,255,255,0.05)', // Glassmorphism
  },
  
  // Colores Principales
  cyan: '#00FFE7',           // Cian brillante
  magenta: '#B84DFF',         // Magenta/púrpura
  accent: '#9AF7EE',         // Acento cian suave
  gold: '#FFD700',           // Oro (modo NEXUS)
  red: '#FF1744',            // Rojo épico (Super Saiyan)
  
  // UI States
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF1744',
  info: '#00B0FF',
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    muted: '#808080',
    accent: '#00FFE7'
  }
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    display: "'Inter', -apple-system, sans-serif",
    code: "'JetBrains Mono', 'Fira Code', monospace",
    japanese: "'Noto Sans JP', sans-serif"
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
} as const;

// Animation presets
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }
} as const;

// Glassmorphism utility
export const glassStyle = {
  backdropFilter: 'blur(20px)',
  background: COLORS.bg.glass,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px'
};

// Glow effects
export const glowStyles = {
  cyan: {
    boxShadow: '0 0 20px rgba(0,255,231,0.5)',
    border: '1px solid rgba(0,255,231,0.3)'
  },
  gold: {
    boxShadow: '0 0 30px rgba(255,215,0,0.8)',
    border: '1px solid rgba(255,215,0,0.5)'
  },
  red: {
    boxShadow: '0 0 40px rgba(255,23,68,0.9)',
    border: '1px solid rgba(255,23,68,0.6)'
  },
  magenta: {
    boxShadow: '0 0 25px rgba(184,77,255,0.6)',
    border: '1px solid rgba(184,77,255,0.4)'
  }
};

// Base Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: 'cyan' | 'gold' | 'red' | 'magenta';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  glow,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const glowStyle = glow ? glowStyles[glow] : {};
  
  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={glowStyle}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
};

// Glass Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'gold' | 'red' | 'magenta';
  hover?: boolean;
}

export const GlassCard: React.FC<CardProps> = ({
  children,
  className = '',
  glow,
  hover = true
}) => {
  const glowStyle = glow ? glowStyles[glow] : {};
  
  return (
    <motion.div
      className={`p-6 ${className}`}
      style={{ ...glassStyle, ...glowStyle }}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  glow?: 'cyan' | 'gold' | 'red' | 'magenta';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  glow,
  className = '',
  ...props
}) => {
  const glowStyle = glow ? glowStyles[glow] : {};
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors ${className}`}
        style={glowStyle}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glow?: 'cyan' | 'gold' | 'red' | 'magenta';
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  glow,
  className = '',
  ...props
}) => {
  const glowStyle = glow ? glowStyles[glow] : {};
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none ${className}`}
        style={glowStyle}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

// Loading Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'gold' | 'red' | 'magenta' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'cyan'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const colorClasses = {
    cyan: 'border-cyan-500',
    gold: 'border-yellow-500',
    red: 'border-red-500',
    magenta: 'border-purple-500',
    white: 'border-white'
  };
  
  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Page Container Component
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 ${className}`}>
      {children}
    </div>
  );
};

// Section Component
interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  className = ''
}) => {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

// Grid Component
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Export all components and utilities
export {
  COLORS,
  TYPOGRAPHY,
  ANIMATIONS,
  glassStyle,
  glowStyles
};
