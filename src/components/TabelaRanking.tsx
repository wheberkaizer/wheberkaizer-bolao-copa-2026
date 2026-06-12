import React from 'react';
import { Participant } from '../types';
import { Medal, Trophy, User, CalendarDays, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface TabelaRankingProps {
  participants: Participant[];
  currentUser: string | null;
}

export function TabelaRanking({ participants, currentUser }: TabelaRankingProps) {
  // Sort by scores descending
  const sorted = [...participants].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full">
      {/* Decorative summary headers */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 w-10 h-10 bg-cup-gold/20 rounded-lg flex items-center justify-center text-cup-gold">
            <Trophy size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Classificação Geral</h3>
            <p className="text-xs text-gray-300">Acompanhe quem está dominando as arenas em tempo real.</p>
          </div>
        </div>
        <div className="text-xs text-cup-lightgold bg-cup-gold/10 px-3 py-1.5 rounded-lg border border-cup-gold/20 flex items-center gap-1">
          <Medal size={13} />
          <span>Pontuação: 5 pts (Placar Exato) | 3 pts (Saldo) | 1 pt (Vencedor)</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl">
        <div className="p-4 bg-gradient-to-r from-[#1B5E20]/40 to-[#0A3D1E]/20 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            📊 Tabela de Liderança <span className="text-xs text-cup-gold bg-cup-gold/10 px-2 py-0.5 rounded border border-cup-gold/20">Amadora</span>
          </h2>
          <span className="text-xs text-gray-400">
            {participants.length} Participantes ativos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-xs font-bold text-cup-lightgold/85 uppercase tracking-widest">
                <th className="py-4 px-5 text-center w-16">Posição</th>
                <th className="py-4 px-4">Participante</th>
                <th className="py-4 px-4 text-center w-28">Palpites Ativos</th>
                <th className="py-4 px-5 text-right w-32">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sorted.map((participant, index) => {
                const isUser = participant.name === currentUser;
                const position = index + 1;

                // Determine rank styling
                let posBadgeClass = "bg-stone-800 text-stone-200";
                let rowBgClass = "hover:bg-white/[0.02]";
                let medalEmblem = null;

                if (position === 1) {
                  posBadgeClass = "bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark font-extrabold shadow-sm shadow-cup-gold/25";
                  rowBgClass = "bg-cup-gold/[0.03] hover:bg-cup-gold/[0.05]";
                  medalEmblem = "🥇";
                } else if (position === 2) {
                  posBadgeClass = "bg-gradient-to-r from-slate-350 to-slate-200 text-stone-955 font-extrabold";
                  rowBgClass = "bg-slate-500/[0.01] hover:bg-slate-500/[0.03]";
                  medalEmblem = "🥈";
                } else if (position === 3) {
                  posBadgeClass = "bg-gradient-to-r from-amber-700 to-amber-600 text-stone-150 font-extrabold";
                  rowBgClass = "bg-amber-700/[0.01] hover:bg-amber-700/[0.03]";
                  medalEmblem = "🥉";
                }

                if (isUser) {
                  rowBgClass = "bg-[#1B5E20]/30 border-l-4 border-l-cup-gold";
                }

                const totalBetsCount = Object.keys(participant.bets).filter(
                  (key) => participant.bets[key].scoreA !== null && participant.bets[key].scoreB !== null
                ).length;

                return (
                  <motion.tr
                    key={participant.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`transition-colors duration-200 ${rowBgClass}`}
                  >
                    {/* Position column */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center">
                        {medalEmblem ? (
                          <span className="text-xl inline-block mr-1">{medalEmblem}</span>
                        ) : (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-xs ${posBadgeClass}`}>
                            {position}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Participant column */}
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{participant.name}</span>
                        {isUser && (
                          <span className="text-[10px] bg-cup-gold text-pitch-dark px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            VOCÊ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active Bets count */}
                    <td className="py-4 px-4 text-center text-xs text-gray-400 font-mono">
                      {totalBetsCount} palpites
                    </td>

                    {/* Points column */}
                    <td className="py-4 px-5 text-right font-mono text-base font-bold text-cup-gold">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{participant.score}</span>
                        <span className="text-xs text-gray-400 font-normal font-sans">pts</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
