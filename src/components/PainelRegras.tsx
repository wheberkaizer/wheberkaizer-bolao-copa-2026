import React from 'react';
import { Target, Sparkles, BookOpen, Clock, Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function PainelRegras() {
  const rules = [
    {
      points: '5',
      label: 'Pontos',
      title: 'Placar Exato',
      description: 'Você adivinhou exatamente a quantidade de gols de ambas as seleções. (Ex: Palpite 2-1 | Resultado 2-1).',
      color: 'from-cup-gold to-[#F5D77F]',
      badge: 'bg-cup-gold/10 text-cup-lightgold border-cup-gold/20',
    },
    {
      points: '3',
      label: 'Pontos',
      title: 'Vencedor e Saldo',
      description: 'Você acertou o vencedor ou empate, e o saldo exato de gols do jogo. (Ex: Palpite 1-0 | Resultado 2-1, ou Palpite 1-1 | Resultado 2-2).',
      color: 'from-emerald-400 to-[#86E3CE]',
      badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    },
    {
      points: '1',
      label: 'Ponto',
      title: 'Vencedor Simples',
      description: 'Você acertou apenas quem venceu ou indicou empate seco, mas errou o placar e saldo. (Ex: Palpite 2-0 | Resultado 3-1).',
      color: 'from-slate-400 to-gray-500',
      badge: 'bg-slate-400/10 text-slate-350 border-slate-450',
    },
  ];

  return (
    <div className="w-full">
      {/* Rules Banner */}
      <div className="mb-6 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-cup-gold/5 rounded-full blur-2xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-cup-gold/10 text-cup-lightgold border border-cup-gold/20 uppercase tracking-widest mb-3">
          <BookOpen size={12} /> Regulamento de Apostas Amadoras
        </span>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Como funciona a pontuação do Bolão?
        </h2>
        <p className="text-gray-300 text-xs max-w-2xl mt-1.5 leading-relaxed">
          Nossa liga amadora é baseada puramente em acertos analíticos de futebol. Não há dinheiro envolvido, apenas prestígio técnico! Seu objetivo é somar a maior quantidade de pontos até a grande final em New Jersey.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rules.map((rule, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Points highlight circle top right */}
            <div className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br ${rule.color} text-pitch-dark font-black text-xl flex flex-col items-center justify-center leading-none shadow-lg shadow-black/30`}>
              <span>{rule.points}</span>
              <span className="text-[7px] uppercase font-bold tracking-tighter">{rule.label}</span>
            </div>

            <div className="mb-8">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${rule.badge} mb-3`}>
                Categoria {rule.points}
              </span>
              <h3 className="text-base font-extrabold text-white uppercase tracking-tight block">
                {rule.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed mt-2">
                {rule.description}
              </p>
            </div>

            <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono border-t border-white/5 pt-3">
              Copa do mundo fifa 2026
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Game features */}
      <div className="mt-6 rounded-2xl bg-white/5 p-4 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
        <div className="flex items-start gap-2.5">
          <Clock size={16} className="text-cup-lightgold shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-bold mb-0.5">Sem Limite de Tempo</h4>
            <p className="text-[11px] text-gray-400">Modifique seus palpites a qualquer momento antes dos jogos oficiais começarem.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Users size={16} className="text-cup-gold shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-bold mb-0.5">Competidores do Bolão</h4>
            <p className="text-[11px] text-gray-400">Os outros competidores e amigos do bolão disputam ativamente cada posição da tabela geral.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Trophy size={16} className="text-cup-lightgold shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-bold mb-0.5">Hexa da Tecnologia</h4>
            <p className="text-[11px] text-gray-400">Desenvolvido com design responsivo fluido pronto para celulares, tablets e desktops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
