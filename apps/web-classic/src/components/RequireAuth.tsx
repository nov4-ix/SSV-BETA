import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, User, Zap } from 'lucide-react';

interface RequireAuthProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  title = "Acceso Restringido",
  message = "Debes iniciar sesión para acceder a esta funcionalidad",
  showLoginButton = true
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-primary to-bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto p-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-cyan mb-4"
        >
          {title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-8 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-cyan mb-4">
            ¿Qué obtienes al registrarte?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">3 generaciones con Son1kVerse Pro</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">2 generaciones con Son1kVerse Ultra</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-cyan" />
              <span className="text-gray-300">Acceso completo a todas las herramientas</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {showLoginButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Link
              to="/login"
              className="block w-full py-3 bg-gradient-to-r from-cyan to-purple text-bg-primary font-bold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
            >
              Iniciar Sesión / Registrarse
            </Link>
            
            <Link
              to="/"
              className="block text-gray-400 hover:text-cyan transition-colors text-sm"
            >
              ← Volver al inicio
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
