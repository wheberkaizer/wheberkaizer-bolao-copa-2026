import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrofeuSVG } from './TrofeuSVG';
import { Trophy, Shield, User } from 'lucide-react';

interface TelaCadastroProps {
  onEnter: (name: string) => void;
  key?: string;
}

export function TelaCadastro({ onEnter }: TelaCadastroProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userName.trim();
    if (!trimmed) {
      setError('Por favor, informe seu nome ou apelido!');
      return;
    }
    if (trimmed.length < 2) {
      setError('Seu nome deve ter pelo menos 2 caracteres.');
      return;
    }
    onEnter(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[85vh] py-8 px-4 z-10 text-center"
    >
      {/* Decorative Top header */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cup-gold/10 text-cup-gold border border-cup-gold/20 uppercase tracking-widest animate-pulse">
          <Trophy size={12} /> Copas Mundiais Amadoras
        </span>
      </div>

      {/* Stylized World Cup Trophy */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6 relative"
      >
        <TrofeuSVG size={140} />
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 uppercase drop-shadow">
        Bolão do Hexa <span className="text-transparent bg-clip-text bg-gradient-to-r from-cup-gold via-[#F2D06B] to-cup-lightgold">2026</span>
      </h1>
      
      <p className="text-gray-300/90 text-sm max-w-sm mb-8 leading-relaxed">
        Junte-se à maior comunidade amadora! Dê seus palpites, acumule pontos e conquiste a liderança sem risco ou apostas reais.
      </p>

      {/* Main Registration Card */}
      <div className="w-full max-w-md bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative corner borders in Gold */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cup-gold opacity-60 rounded-tl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cup-gold opacity-60 rounded-br-sm pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label htmlFor="nickname" className="block text-cup-lightgold text-xs font-semibold uppercase tracking-wider mb-2">
              Digite seu nome/apelido para entrar no campo
            </label>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cup-gold">
                <User size={18} />
              </span>
              <input
                id="nickname"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setError('');
                }}
                placeholder="Exemplo: Canarinho_10"
                maxLength={20}
                className="w-full pl-10 pr-4 py-3 bg-pitch-dark/40 border-2 border-emerald-800/40 focus:border-cup-gold rounded-xl text-white placeholder-gray-400/80 outline-none transition-all duration-300 font-medium"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs mt-1.5 font-medium ml-1">
                ⚠️ {error}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-cup-gold via-cup-lightgold to-cup-gold text-pitch-dark font-black uppercase tracking-widest rounded-xl hover:from-cup-lightgold hover:to-white shadow-md shadow-cup-gold/25 border-b-4 border-amber-600 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Shield size={16} className="fill-pitch-dark" />
            <span>Entrar no Bolão</span>
          </motion.button>
        </form>

        {/* Info badges inside card */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
          <div className="flex flex-col items-center">
            <span className="text-cup-gold font-bold">100%</span>
            <span>Recreativo</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-cup-gold font-bold">16+</span>
            <span>Confrontos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-cup-gold font-bold">8</span>
            <span>Grupos (A-H)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
