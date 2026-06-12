import React, { useState, useEffect } from 'react';
import { Match, Team } from '../types';
import { X, Save, AlertCircle, RefreshCw, Trash2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamFlag } from './PainelJogos';

interface PainelAdminProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onSaveOfficialScores: (updatedScores: { [matchId: string]: { scoreA: number | null, scoreB: number | null } }) => void;
  onCreateMatch: (newMatch: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  onResetTournament?: () => void;
}

function getEmojiFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '⚽';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '⚽';
  }
}

export function PainelAdmin({ isOpen, onClose, matches, onSaveOfficialScores, onCreateMatch, onDeleteMatch, onResetTournament }: PainelAdminProps) {
  // Temporary state for the editor
  const [editedScores, setEditedScores] = useState<{ [matchId: string]: { scoreA: string; scoreB: string } }>({});

  // New match form state
  const [phase, setPhase] = useState<'round16_avos' | 'round16' | 'quarter' | 'semi' | 'final'>('round16');
  const [teamAName, setTeamAName] = useState('');
  const [teamACode, setTeamACode] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamBCode, setTeamBCode] = useState('');
  const [gameDate, setGameDate] = useState('2026-06-29');
  const [gameTime, setGameTime] = useState('16:00');
  const [stadium, setStadium] = useState('MetLife Stadium');
  const [city, setCity] = useState('Nova York, EUA');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with matches whenever matches or isOpen change
  useEffect(() => {
    if (isOpen) {
      const initial: { [matchId: string]: { scoreA: string; scoreB: string } } = {};
      matches.forEach((m) => {
        initial[m.id] = {
          scoreA: m.scoreA !== null && m.scoreA !== undefined ? m.scoreA.toString() : '',
          scoreB: m.scoreB !== null && m.scoreB !== undefined ? m.scoreB.toString() : '',
        };
      });
      setEditedScores(initial);
    }
  }, [isOpen, matches]);

  const handleScoreChange = (matchId: string, team: 'A' | 'B', value: string) => {
    setEditedScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team === 'A' ? 'scoreA' : 'scoreB']: value,
      },
    }));
  };

  const handleSave = () => {
    const payload: { [matchId: string]: { scoreA: number | null; scoreB: number | null } } = {};
    matches.forEach((m) => {
      const row = editedScores[m.id];
      const sA = row?.scoreA === '' ? null : parseInt(row?.scoreA, 10);
      const sB = row?.scoreB === '' ? null : parseInt(row?.scoreB, 10);
      
      // If only one is set, we treat as null (both must be set to count as a complete played match)
      if (sA !== null && sB !== null && !isNaN(sA) && !isNaN(sB)) {
        payload[m.id] = { scoreA: sA, scoreB: sB };
      } else {
        payload[m.id] = { scoreA: null, scoreB: null };
      }
    });

    onSaveOfficialScores(payload);
    onClose();
  };

  const handleCreateMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAName.trim() || !teamBName.trim()) {
      setErrorMsg('Por favor, preencha o nome de ambas as seleções!');
      return;
    }
    setErrorMsg('');

    const formattedCodeA = (teamACode.trim() || teamAName.trim().substring(0, 2)).toUpperCase();
    const formattedCodeB = (teamBCode.trim() || teamBName.trim().substring(0, 2)).toUpperCase();

    const newMatch: Match = {
      id: `K-CUSTOM-${Date.now()}`,
      phase,
      teamA: {
        id: teamAName.trim().toLowerCase().replace(/\s+/g, '-'),
        name: teamAName.trim(),
        flag: getEmojiFlag(formattedCodeA),
        code: formattedCodeA.length === 2 ? `${formattedCodeA}` : formattedCodeA,
        codigo: formattedCodeA.substring(0, 2),
      },
      teamB: {
        id: teamBName.trim().toLowerCase().replace(/\s+/g, '-'),
        name: teamBName.trim(),
        flag: getEmojiFlag(formattedCodeB),
        code: formattedCodeB.length === 2 ? `${formattedCodeB}` : formattedCodeB,
        codigo: formattedCodeB.substring(0, 2),
      },
      date: gameDate,
      time: gameTime,
      stadium: stadium.trim(),
      city: city.trim(),
      scoreA: null,
      scoreB: null,
    };

    onCreateMatch(newMatch);

    // Reset fields except stadium / city
    setTeamAName('');
    setTeamACode('');
    setTeamBName('');
    setTeamBCode('');
  };

  const handleClearAll = () => {
    const cleared: { [matchId: string]: { scoreA: string; scoreB: string } } = {};
    matches.forEach((m) => {
      cleared[m.id] = { scoreA: '', scoreB: '' };
    });
    setEditedScores(cleared);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl bg-[#092c16] border-2 border-cup-gold/30 rounded-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]"
      >
        {/* Pitch line header accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cup-gold via-cup-lightgold to-cup-gold" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛠️</span>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                Painel Admin <span className="text-xs text-cup-gold bg-cup-gold/10 border border-cup-gold/20 px-2 py-0.5 rounded-full">Secret Mode</span>
              </h2>
              <p className="text-gray-300 text-xs mt-0.5">
                Crie confrontos mata-mata e atualize diretamente os placares oficiais para recalcular os pontos geral.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Match list */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6 max-h-[calc(90vh-160px)]">
          {/* Left Column: Create Knockout Phase Match */}
          <div className="w-full lg:w-80 bg-black/30 rounded-2xl p-4 border border-white/5 space-y-4 shrink-0 self-start">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-xs font-black uppercase text-cup-lightgold tracking-wider flex items-center gap-1.5">
                <PlusCircle size={15} />
                Gerenciar Fases Finais
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Libere um confronto mata-mata para liberar os palpites na aba correspondente do bolão.
              </p>
            </div>

            <form onSubmit={handleCreateMatchSubmit} className="space-y-3">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[11px] text-red-400 flex items-center gap-1.5 leading-tight">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-350 uppercase tracking-wider mb-1">
                  Fase do Mata-Mata
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full rounded-lg bg-black/40 border border-white/10 text-white font-bold text-[11px] p-2 focus:border-cup-gold outline-none cursor-pointer"
                >
                  <option value="round16_avos">16-avos de Final</option>
                  <option value="round16">Oitavas de Final</option>
                  <option value="quarter">Quartas de Final</option>
                  <option value="semi">Semifinais</option>
                  <option value="final">A Grande Final</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Seleção A (Nome)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Brasil"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white text-[11px] p-2 focus:border-cup-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5" title="Código de 2 letras">
                    Código Bandeira A
                  </label>
                  <input
                    type="text"
                    placeholder="ex: BR"
                    maxLength={2}
                    value={teamACode}
                    onChange={(e) => setTeamACode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center text-[11px] p-2 focus:border-cup-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Seleção B (Nome)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Espanha"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white text-[11px] p-2 focus:border-cup-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5" title="Código de 2 letras">
                    Código Bandeira B
                  </label>
                  <input
                    type="text"
                    placeholder="ex: ES"
                    maxLength={2}
                    value={teamBCode}
                    onChange={(e) => setTeamBCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white font-mono text-center text-[11px] p-2 focus:border-cup-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Data do Jogo
                  </label>
                  <input
                    type="date"
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[10px] p-1.5 focus:border-cup-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Horário (UTC)
                  </label>
                  <input
                    type="text"
                    placeholder="16:00"
                    value={gameTime}
                    onChange={(e) => setGameTime(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white text-[11px] p-2 focus:border-cup-gold outline-none text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Estádio
                  </label>
                  <input
                    type="text"
                    value={stadium}
                    onChange={(e) => setStadium(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white text-[11px] p-2 focus:border-cup-gold outline-none max-w-full truncate"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg bg-black/40 border border-white/10 text-white text-[11px] p-2 focus:border-cup-gold outline-none max-w-full truncate"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark hover:from-white hover:to-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-cup-lightgold/25"
              >
                <PlusCircle size={13} />
                Criar Jogo Mata-Mata
              </button>
            </form>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 text-[10px] text-gray-400 leading-relaxed space-y-1">
              <p className="font-bold text-cup-lightgold">🇧🇷 Dica de Bandeiras:</p>
              <p>
                As bandeiras são geradas a partir de códigos ISO de 2 letras (ex: BR, MX, CA, FR, IT, ES, PT, AR). O app gerará o link da flagsapi.com dinamicamente!
              </p>
            </div>
          </div>

          {/* Right Column: Edit Scores and List of all current matches */}
          <div className="flex-grow flex flex-col space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-cup-lightgold">
                <AlertCircle size={14} className="shrink-0 text-cup-gold" />
                <span>Coloque placar oficial em ambos os campos para calcular as pontuações do bolão.</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1.5 bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Limpar campos de edição abaixo"
                >
                  <RefreshCw size={11} />
                  Limpar Campos
                </button>
                {onResetTournament && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetTournament();
                    }}
                    className="px-2.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="Zerar todos os resultados oficiais lançados"
                  >
                    <Trash2 size={11} />
                    Zerar Resultados Oficiais
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1">
              {matches.map((m) => {
                const row = editedScores[m.id] || { scoreA: '', scoreB: '' };
                const isFilled = row.scoreA !== '' && row.scoreB !== '';
                const isCustomKnockout = m.id.toString().startsWith('K-CUSTOM-');

                return (
                  <div
                    key={m.id}
                    className={`bg-black/25 rounded-xl p-2.5 border flex items-center justify-between gap-2.5 transition-all ${
                      isFilled ? 'border-cup-gold/30 bg-cup-gold/5' : 'border-white/5'
                    }`}
                  >
                    {/* Left Column: Match ID & Phase */}
                    <div className="flex flex-col items-start min-w-[70px] max-w-[90px] shrink-0">
                      <span className="text-[8px] font-mono text-gray-450 font-bold bg-white/5 px-1.5 py-0.5 rounded-full truncate max-w-full">
                        {isCustomKnockout ? 'Mata-Mata' : `Jogo #${m.id}`}
                      </span>
                      <span className="text-[8px] uppercase font-mono tracking-wider text-cup-lightgold/80 mt-1 font-bold truncate max-w-full">
                        {m.phase === 'group' ? `Grupo ${m.group}` : m.phase === 'round16_avos' ? '32-Avos' : m.phase === 'round16' ? 'Oitavas' : m.phase === 'quarter' ? 'Quartas' : m.phase === 'semi' ? 'Semifinal' : 'Final'}
                      </span>
                    </div>

                    {/* Center Grid: Teams & Score Editors */}
                    <div className="flex-1 flex items-center justify-between gap-1.5 min-w-0">
                      {/* Team A name & Flag */}
                      <div className="flex items-center gap-1.5 w-[38%] justify-end text-right min-w-0">
                        <span className="text-[11px] font-bold text-white truncate leading-none" title={m.teamA.name}>
                          {m.teamA.name}
                        </span>
                        <TeamFlag team={m.teamA} className="w-5 h-5" />
                      </div>

                      {/* Inputs */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          placeholder="-"
                          value={row.scoreA}
                          onChange={(e) => handleScoreChange(m.id, 'A', e.target.value)}
                          className="w-7 h-7 rounded-md bg-black/40 border border-white/10 text-white font-bold text-center text-[11px] focus:border-cup-gold outline-none"
                        />
                        <span className="text-gray-500 font-bold text-[8px]">X</span>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          placeholder="-"
                          value={row.scoreB}
                          onChange={(e) => handleScoreChange(m.id, 'B', e.target.value)}
                          className="w-7 h-7 rounded-md bg-black/40 border border-white/10 text-white font-bold text-center text-[11px] focus:border-cup-gold outline-none"
                        />
                      </div>

                      {/* Team B Flag & name */}
                      <div className="flex items-center gap-1.5 w-[38%] text-left min-w-0">
                        <TeamFlag team={m.teamB} className="w-5 h-5" />
                        <span className="text-[11px] font-bold text-white truncate leading-none" title={m.teamB.name}>
                          {m.teamB.name}
                        </span>
                      </div>
                    </div>

                    {/* Delete button (only for matches created via admin panel to keep group stages fully intact) */}
                    {isCustomKnockout && onDeleteMatch && (
                      <button
                        type="button"
                        onClick={() => onDeleteMatch(m.id.toString())}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all cursor-pointer shrink-0"
                        title="Deletar este confronto"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer actions */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark hover:from-cup-lightgold hover:to-white text-xs font-extrabold rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-cup-gold/20 cursor-pointer"
          >
            <Save size={14} className="stroke-[2.5]" />
            Salvar Resultados Oficiais
          </button>
        </div>
      </motion.div>
    </div>
  );
}
