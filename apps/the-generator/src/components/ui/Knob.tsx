import React from 'react';
import { motion } from 'framer-motion';

interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'green' | 'blue' | 'purple' | 'red';
}

export const Knob: React.FC<KnobProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  size = 'medium',
  color = 'green'
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const colorClasses = {
    green: 'border-green-400 shadow-green-400/50',
    blue: 'border-blue-400 shadow-blue-400/50',
    purple: 'border-purple-400 shadow-purple-400/50',
    red: 'border-red-400 shadow-red-400/50'
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 270 - 135; // -135 to 135 degrees

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const normalizedAngle = ((angle + 135) % 360 + 360) % 360;
      const newPercentage = Math.max(0, Math.min(100, normalizedAngle / 270 * 100));
      const newValue = min + (newPercentage / 100) * (max - min);
      onChange(Math.round(newValue / step) * step);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {label && (
        <label className="text-xs text-gray-400 font-medium">{label}</label>
      )}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 ${colorClasses[color]} bg-gray-800 cursor-pointer flex items-center justify-center relative overflow-hidden`}
          onMouseDown={handleMouseDown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: `0 0 20px ${colorClasses[color].split(' ')[1].replace('border-', '').replace('-400', '-400/30')}`
          }}
        >
          {/* Indicador */}
          <div
            className="absolute w-1 h-6 bg-white rounded-full origin-bottom"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '50% 100%'
            }}
          />
          
          {/* Valor */}
          <span className="text-xs text-white font-bold z-10">
            {Math.round(value)}
          </span>
        </motion.div>
        
        {/* Marcas de escala */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map((mark) => {
            const markRotation = (mark / 100) * 270 - 135;
            return (
              <div
                key={mark}
                className="absolute w-0.5 h-2 bg-gray-500 rounded-full origin-bottom"
                style={{
                  transform: `rotate(${markRotation}deg)`,
                  transformOrigin: '50% 100%',
                  top: '50%',
                  left: '50%',
                  marginLeft: '-1px',
                  marginTop: '-8px'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
