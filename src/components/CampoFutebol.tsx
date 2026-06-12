import React from 'react';

export function CampoFutebol() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
      {/* Grass Strips (simula faixas escuras e claras do gramado cortado) */}
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 w-full ${
              idx % 2 === 0 ? 'bg-emerald-950/20' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Football Field Markings (Linhas de marcação de campo em Branco suave) */}
      <div className="absolute inset-4 border-2 border-white/30 rounded-sm">
        {/* Midfield line (Linha de meio campo) */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2" />
        
        {/* Center circle (Círculo central) */}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Penalty Area Top (Área superior) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 border-b-2 border-x-2 border-white/30">
          {/* Goal area */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-12 border-b-2 border-x-2 border-white/20" />
          {/* Penalty spot */}
          <div className="absolute bottom-6 left-1/2 w-2 h-2 bg-white/30 rounded-full -translate-x-1/2" />
          {/* Penalty arc */}
          <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-24 h-12 border-t-2 border-white/20 rounded-t-full" />
        </div>

        {/* Penalty Area Bottom (Área inferior) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-32 border-t-2 border-x-2 border-white/30">
          {/* Goal area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-12 border-t-2 border-x-2 border-white/20" />
          {/* Penalty spot */}
          <div className="absolute top-6 left-1/2 w-2 h-2 bg-white/30 rounded-full -translate-x-1/2" />
          {/* Penalty arc */}
          <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-24 h-12 border-b-2 border-white/20 rounded-b-full" />
        </div>

        {/* Corner arcs (Escanteios) */}
        <div className="absolute top-0 left-0 w-6 h-6 border-r-2 border-b-2 border-white/20 rounded-br-full" />
        <div className="absolute top-0 right-0 w-6 h-6 border-l-2 border-b-2 border-white/20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-r-2 border-t-2 border-white/20 rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-l-2 border-t-2 border-white/20 rounded-tl-full" />
      </div>
    </div>
  );
}
