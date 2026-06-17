import React, { useRef, useState } from 'react';
import { Match, Bet, Team } from '../types';
import { Calendar, MapPin, Check, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { getTeamFlagUrl } from '../data/worldCupData';

export function TeamFlag({ team, className = "w-6 h-6 md:w-7 md:h-7" }: { team: Team; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const flagUrl = getTeamFlagUrl(team);

  if (!flagUrl || hasError) {
    return <span className="text-2xl select-none leading-none shrink-0" title={team.name}>{team.flag || '⚽'}</span>;
  }

  return (
    <img
      src={flagUrl}
      alt={team.name}
      title={team.name}
      onError={() => setHasError(true)}
      className={`${className} object-contain rounded shadow-sm border border-white/10 shrink-0 bg-white/5`}
      referrerPolicy="no-referrer"
    />
  );
}

interface PainelJogosProps {
  matches: Match[];
  userBets: { [matchId: string]: Bet };
  onSaveBet: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  onSaveAllBets?: () => void;
  activePhase: string;
  setActivePhase: (phase: string) => void;
  activeGroupTab: string;
  setActiveGroupTab: (group: string) => void;
  currentUser: string | null;
}

export function PainelJogos({
  matches,
  userBets,
  onSaveBet,
  onSaveAllBets,
  activePhase,
  setActivePhase,
  activeGroupTab,
  setActiveGroupTab,
  currentUser,
}: PainelJogosProps) {
  const groupsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const groupScrollRef = useRef<HTMLDivElement>(null);

  // Filter matches based on selected phase and group
  const filteredMatches = matches.filter((match) => {
    if (activePhase === 'group') {
      return match.phase === 'group' && match.group === activeGroupTab;
    }
    return match.phase === activePhase;
  });

  const getPointsScored = (match: Match) => {
    const bet = userBets[match.id];
    if (!bet || bet.scoreA === null || bet.scoreB === null || match.scoreA === null || match.scoreB === null || match.scoreA === undefined || match.scoreB === undefined) {
      return null;
    }

    if (bet.scoreA === match.scoreA && bet.scoreB === match.scoreB) {
      return { p: 5, label: 'Placar Exato (+5)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }

    const betResult = Math.sign(bet.scoreA - bet.scoreB);
    const matchResult = Math.sign(match.scoreA - match.scoreB);

    if (betResult === matchResult) {
      const betDiff = bet.scoreA - bet.scoreB;
      const matchDiff = match.scoreA - match.scoreB;
      if (betDiff === matchDiff) {
        return { p: 3, label: 'Saldo de Gols (+3)', color: 'bg-cup-gold/20 text-cup-gold border-cup-gold/30' };
      } else {
        return { p: 1, label: 'Vencedor (+1)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
      }
    }

    return { p: 0, label: 'Não Pontuou (0)', color: 'bg-black/20 text-white/40 border-transparent' };
  };

  const handleInputChange = (matchId: string, team: 'A' | 'B', value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    const curBet = userBets[matchId] || { matchId, scoreA: null, scoreB: null };
    
    if (team === 'A') {
      onSaveBet(matchId, num, curBet.scoreB);
    } else {
      onSaveBet(matchId, curBet.scoreA, num);
    }
  };

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'group': return 'Fase de Grupos';
      case 'round16_avos': return '16 avos de Final'; // Round of 32
      case 'round16': return 'Oitavas de Final';
      case 'quarter': return 'Quartas de Final';
      case 'semi': return 'Semifinais';
      case 'final': return 'A Grande Final';
      default: return phase;
    }
  };

  return (
    <div className="w-full">
      {/* 1. MAIN PHASE TABS */}
      <div className="flex flex-wrap items-center justify-start gap-1 pb-2 border-b border-white/5 mb-4 select-none overflow-x-auto scrollbar-thin">
        {[
          { key: 'group', label: 'Grupos (A-L)' },
          { key: 'round16_avos', label: '16 avos (32 Seleções)' },
          { key: 'round16', label: 'Oitavas' },
          { key: 'quarter', label: 'Quartas' },
          { key: 'semi', label: 'Semifinais' },
          { key: 'final', label: 'Grande Final' },
        ].map((tab) => {
          const isSelected = activePhase === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActivePhase(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark shadow-lg shadow-cup-gold/15 font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. GROUP SELECTOR SUBMENU (ONLY ON GROUP STAGE STATUS, WITH COMPACT HORIZONTAL SCROLL) */}
      {activePhase === 'group' && (
        <div className="relative mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-pitch-dark to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-pitch-dark to-transparent pointer-events-none z-10" />
          
          <div
            ref={groupScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-4 scrollbar-none snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {groupsList.map((g) => {
              const isSelected = activeGroupTab === g;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroupTab(g)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 snap-center shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark shadow-md shadow-cup-gold/15 font-black ring-2 ring-cup-lightgold'
                      : 'bg-white/10 text-cup-lightgold/80 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  Grupo {g}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LIST OF CARDS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>⚽ {getPhaseName(activePhase)}</span>
          {activePhase === 'group' && (
            <span className="text-xs font-mono font-bold text-cup-gold bg-cup-gold/10 px-3 py-1 rounded-full border border-cup-gold/20">
              Grupo {activeGroupTab}
            </span>
          )}
        </h2>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          {onSaveAllBets && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSaveAllBets}
              className="px-5 py-2.5 bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark hover:from-white hover:to-white hover:text-pitch-dark font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-cup-gold/10 border border-cup-gold/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Save size={13} className="stroke-[2.5]" />
              <span>Salvar Palpites</span>
            </motion.button>
          )}
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="bg-white/10 rounded-2xl border border-white/15 p-12 text-center text-gray-350 flex flex-col items-center justify-center backdrop-blur-md">
          <span className="text-3xl mb-2">⏱️</span>
          <p className="font-medium text-white/95">Aguardando definição dos classificados</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Assim que as seleções participantes forem definidas, os jogos de mata-mata aparecerão aqui para seus palpites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => {
            const bet = userBets[match.id] || { matchId: match.id, scoreA: null, scoreB: null };
            
            // Checking if the actual simulated scores are active
            const matchPlayed = match.scoreA !== null && match.scoreB !== null;

            // Trava de segurança para palpites de usuários comuns: se o jogo já aconteceu ou começou, bloqueia a edição de palpite
            const matchDateTimeStr = `${match.date}T${match.time || '00:00'}:00`;
            const matchDateTime = new Date(matchDateTimeStr);
            const now = new Date();
            const isMatchPast = matchDateTime.getTime() <= now.getTime();
            const isBettingLocked = matchPlayed || isMatchPast;

            const pointsPayload = getPointsScored(match);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between shadow-md ${
                  matchPlayed
                    ? pointsPayload?.p === 5
                      ? 'border-emerald-400 ring-2 ring-emerald-500/25 shadow-emerald-950/25'
                      : pointsPayload?.p === 3
                      ? 'border-cup-gold ring-2 ring-cup-gold/25'
                      : pointsPayload?.p === 1
                      ? 'border-slate-350'
                      : 'border-white/5 opacity-80'
                    : 'border-white/10 hover:border-cup-gold/40'
                }`}
              >
                {/* Header: Date, Stadium, Field marker */}
                <div className="flex items-center justify-between text-[11px] text-gray-300 border-b border-white/5 pb-2.5 mb-3.5 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-cup-lightgold" />
                    <span>
                      {match.date.split('-').reverse().join('/')} às {match.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 max-w-[50%] truncate text-right">
                    <MapPin size={11} className="text-cup-gold shrink-0" />
                    <span className="truncate" title={match.stadium}>
                      {match.city}
                    </span>
                  </div>
                </div>

                {/* Match Row: Flag - Team A - Betting Controls - Team B - Flag */}
                <div className="flex items-center justify-between gap-2 my-2 py-1">
                  {/* Team A Info */}
                  <div className="flex items-center gap-2.5 w-[35%]">
                    <TeamFlag team={match.teamA} />
                    <div className="flex flex-col truncate">
                      <span className="text-white font-bold text-sm truncate leading-tight">
                        {match.teamA.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                        {match.teamA.code}
                      </span>
                    </div>
                  </div>

                  {/* Input Score Fields (THE CLIMAX OF THE COMPONENT) */}
                  <div className="flex items-center justify-center gap-1.5 w-[30%]">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={bet.scoreA ?? ''}
                      onChange={(e) => handleInputChange(match.id, 'A', e.target.value)}
                      disabled={isBettingLocked}
                      className="w-10 h-10 md:w-11 md:h-11 bg-pitch-dark/40 text-white font-bold text-base md:text-lg text-center rounded-xl border border-emerald-800/40 focus:border-cup-gold outline-none transition-all placeholder-emerald-900 focus:bg-pitch-dark/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="?"
                    />
                    
                    <span className="text-gray-400 font-bold text-sm tracking-wider font-mono">X</span>

                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={bet.scoreB ?? ''}
                      onChange={(e) => handleInputChange(match.id, 'B', e.target.value)}
                      disabled={isBettingLocked}
                      className="w-10 h-10 md:w-11 md:h-11 bg-pitch-dark/40 text-white font-bold text-base md:text-lg text-center rounded-xl border border-emerald-800/40 focus:border-cup-gold outline-none transition-all placeholder-emerald-900 focus:bg-pitch-dark/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="?"
                    />
                  </div>

                  {/* Team B Info */}
                  <div className="flex items-center justify-end gap-2 w-[35%] text-right">
                    <div className="flex flex-col truncate">
                      <span className="text-white font-bold text-sm truncate leading-tight">
                        {match.teamB.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                        {match.teamB.code}
                      </span>
                    </div>
                    <TeamFlag team={match.teamB} />
                  </div>
                </div>

                {/* Footer status / calculation results */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                  {/* Saved / Not Bet status indicator */}
                  <div className="flex items-center gap-1.5">
                    {bet.scoreA !== null && bet.scoreB !== null ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-cup-lightgold font-semibold bg-cup-gold/10 px-2 py-0.5 rounded-full border border-cup-gold/20">
                        <Check size={11} className="stroke-[3]" /> Palpite Salvo
                      </span>
                    ) : isMatchPast ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-wider text-[9px]">
                        🔒 Encerrado / Passado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-cup-gold bg-cup-gold/10 px-2 py-0.5 rounded-full border border-cup-gold/15 animate-pulse">
                        Aguardando Palpite
                      </span>
                    )}
                  </div>

                  {/* REAL TIME SCORE IN GREEN/GOLD BAND IF GAME ALREADY SIMULATED */}
                  {matchPlayed ? (
                    <div className="flex items-center gap-2">
                      <div className="text-[11px] bg-black/30 px-2 py-1 rounded border border-white/5 flex items-center gap-1.5 font-mono">
                        <span className="text-cup-gold uppercase font-bold text-[9px]">Oficial</span>
                        <span className="text-white font-extrabold">{match.scoreA} - {match.scoreB}</span>
                      </div>
                      {pointsPayload && (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${pointsPayload.color}`}>
                          {pointsPayload.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/40 italic">Resultado pendente</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
