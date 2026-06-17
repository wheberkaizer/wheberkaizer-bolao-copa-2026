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

  // Sync API States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const MOCK_API_MATCHES = [
    { home: 'MEX', away: 'RSA', homeScore: 2, awayScore: 1 },
    { home: 'KOR', away: 'CZE', homeScore: 1, awayScore: 1 },
    { home: 'CZE', away: 'RSA', homeScore: 0, awayScore: 2 },
    { home: 'MEX', away: 'KOR', homeScore: 2, awayScore: 0 },
    { home: 'CZE', away: 'MEX', homeScore: 0, awayScore: 3 },
    { home: 'RSA', away: 'KOR', homeScore: 1, awayScore: 2 },
    { home: 'CAN', away: 'BIH', homeScore: 3, awayScore: 1 },
    { home: 'QAT', away: 'SUI', homeScore: 0, awayScore: 2 },
    { home: 'BRA', away: 'MAR', homeScore: 4, awayScore: 1 },
    { home: 'USA', away: 'PAR', homeScore: 2, awayScore: 1 },
  ];

  const syncResultsFromAPI = async (isSimulation = false) => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatusMessage('');

    try {
      let apiMatches: Array<{ homeCode: string; awayCode: string; homeScore: number; awayScore: number }> = [];

      if (isSimulation) {
        MOCK_API_MATCHES.forEach(mock => {
          apiMatches.push({
            homeCode: mock.home,
            awayCode: mock.away,
            homeScore: mock.homeScore,
            awayScore: mock.awayScore
          });
        });
        await new Promise(resolve => setTimeout(resolve, 1200)); // Delay para simular rede
      } else {
        const rapidApiKey = (import.meta as any).env?.VITE_RAPIDAPI_KEY;
        const footballDataKey = (import.meta as any).env?.VITE_FOOTBALL_DATA_API_KEY;

        if (footballDataKey) {
          // Fetch via football-data.org (Direct API)
          const resp = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
            headers: {
              'X-Auth-Token': footballDataKey
            }
          });
          if (!resp.ok) {
            throw new Error(`Erro na API football-data.org: Código ${resp.status}`);
          }
          const data = await resp.json();
          if (data && data.matches) {
            data.matches.forEach((m: any) => {
              if (m.status === 'FINISHED' && m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null) {
                apiMatches.push({
                  homeCode: m.homeTeam?.tla || '',
                  awayCode: m.awayTeam?.tla || '',
                  homeScore: Number(m.score.fullTime.home),
                  awayScore: Number(m.score.fullTime.away)
                });
              }
            });
          }
        } else if (rapidApiKey) {
          // Fetch via API-Football (RapidAPI)
          const resp = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?league=1&season=2026', {
            headers: {
              'x-rapidapi-key': rapidApiKey,
              'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
          });
          if (!resp.ok) {
            throw new Error(`Erro na API-Football (RapidAPI): Código ${resp.status}`);
          }
          const data = await resp.json();
          if (data && data.response) {
            data.response.forEach((item: any) => {
              const status = item.fixture?.status?.short;
              const hasGoals = item.goals?.home !== null && item.goals?.away !== null;
              if ((status === 'FT' || status === 'FINISHED' || status === 'AET' || status === 'PEN') && hasGoals) {
                apiMatches.push({
                  homeCode: item.teams?.home?.code || '',
                  awayCode: item.teams?.away?.code || '',
                  homeScore: Number(item.goals.home),
                  awayScore: Number(item.goals.away)
                });
              }
            });
          }
        } else {
          throw new Error('Nenhuma chave de API configurada em .env ou ambiente para puxar dados reais!');
        }
      }

      if (apiMatches.length === 0) {
        setSyncStatusMessage('Nenhum jogo finalizado encontrado na API para a Copa de 2026 até o momento.');
        setIsSyncing(false);
        return;
      }

      // Cruzamento de dados com nossa lista de matches local
      let updatedCount = 0;
      const scoresToUpdate = { ...editedScores };

      apiMatches.forEach(apiM => {
        const homeCode = apiM.homeCode.toUpperCase();
        const awayCode = apiM.awayCode.toUpperCase();

        const matchToUpdate = matches.find(m => {
          const mCodeA = m.teamA.code?.toUpperCase();
          const mCodeB = m.teamB.code?.toUpperCase();
          return (mCodeA === homeCode && mCodeB === awayCode) || (mCodeA === awayCode && mCodeB === homeCode);
        });

        if (matchToUpdate) {
          const isReversed = matchToUpdate.teamA.code?.toUpperCase() === awayCode;
          const scoreAStr = isReversed ? apiM.awayScore.toString() : apiM.homeScore.toString();
          const scoreBStr = isReversed ? apiM.homeScore.toString() : apiM.awayScore.toString();

          scoresToUpdate[matchToUpdate.id] = {
            scoreA: scoreAStr,
            scoreB: scoreBStr
          };
          updatedCount++;
        }
      });

      setEditedScores(scoresToUpdate);
      setSyncStatusMessage(`Sucesso! ${updatedCount} resultados da Copa do Mundo foram sincronizados e preenchidos no formulário. Clique em "Salvar Resultados Oficiais" no final da tela para consolidar no banco de dados.`);
    } catch (err: any) {
      setSyncError(err.message || 'Ocorreu um erro inesperado ao sincronizar com a API.');
    } finally {
      setIsSyncing(false);
    }
  };

  // New match form state
  const [phase, setPhase] = useState<'group' | 'round16_avos' | 'round16' | 'quarter' | 'semi' | 'final'>('group');
  const [teamAName, setTeamAName] = useState('');
  const [teamACode, setTeamACode] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamBCode, setTeamBCode] = useState('');
  const [gameDate, setGameDate] = useState('2026-06-29');
  const [gameTime, setGameTime] = useState('16:00');
  const [stadium, setStadium] = useState('MetLife Stadium');
  const [city, setCity] = useState('Nova York, EUA');
  const [errorMsg, setErrorMsg] = useState('');

  // Phase filter state for managing scores
  const [filterPhase, setFilterPhase] = useState<string>('group');

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
      group: phase === 'group' ? 'A' : undefined,
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

  const filteredMatchesForList = matches.filter((m) => {
    if (filterPhase === 'all') return true;
    return m.phase === filterPhase;
  });

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
                  Fase do Jogo / Mata-Mata
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full rounded-lg bg-black/40 border border-white/10 text-white font-bold text-[11px] p-2 focus:border-cup-gold outline-none cursor-pointer"
                >
                  <option value="group">Fase de Grupos</option>
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
            {/* Filter Phase Selector & Global Actions Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-xs font-black uppercase text-cup-lightgold tracking-wider flex items-center gap-1.5 shrink-0">
                  <span>Visualizar Fase:</span>
                </label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="rounded-xl bg-[#092c16] border border-cup-gold/30 text-white font-bold text-xs px-3.5 py-1.5 focus:border-cup-gold outline-none cursor-pointer min-w-[155px] transition-all"
                >
                  <option value="group">Fase de Grupos ⚽</option>
                  <option value="round16_avos">16-avos de Final 🏆</option>
                  <option value="round16">Oitavas de Final 🏆</option>
                  <option value="quarter">Quartas de Final 🏆</option>
                  <option value="semi">Semifinais 🏆</option>
                  <option value="final">A Grande Final ⭐</option>
                  <option value="all">Ver Todas as Fases 🌐</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end shrink-0">
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

            {/* Warning badge */}
            <div className="flex items-center gap-2 text-[10px] text-cup-lightgold/80 bg-white/5 p-2 rounded-xl border border-white/5 shrink-0">
              <AlertCircle size={13} className="shrink-0 text-cup-gold" />
              <span>Digite o placar de ambos os campos para atualizar as pontuações oficiais e clique em "Salvar Resultados Oficiais" abaixo.</span>
            </div>

            {/* API Integration Panel */}
            <div className="bg-black/30 border border-cup-gold/25 rounded-2xl p-4 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-cup-gold tracking-wider">
                      Sincronização Automática (API Copa 2026)
                    </h4>
                    <p className="text-[10px] text-gray-300">
                      Busca e preenche automaticamente os resultados das partidas concluídas.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => syncResultsFromAPI(false)}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow hover:from-white hover:to-white flex items-center gap-1.5 disabled:opacity-55 cursor-pointer"
                  >
                    <RefreshCw size={11} className={`${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Resultados (API)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => syncResultsFromAPI(true)}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-55 cursor-pointer"
                  >
                    Simular (Teste 🧪)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigHelp(!showConfigHelp)}
                    className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-all text-[10px] font-bold cursor-pointer"
                  >
                    {showConfigHelp ? 'Fechar Ajuda 📖' : 'Como Configurar? 📖'}
                  </button>
                </div>
              </div>

              {/* Status and feedback warnings */}
              {syncStatusMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-[10.5px] text-emerald-300 flex items-start gap-1.5 leading-snug">
                  <span className="mt-0.5 shrink-0">✅</span>
                  <span>{syncStatusMessage}</span>
                </div>
              )}

              {syncError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-[10.5px] text-red-400 flex items-start gap-1.5 leading-snug">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <div className="space-y-1">
                    <p className="font-bold">Chave Não Configurada Localmente:</p>
                    <p className="text-gray-300 text-[10px]">{syncError}</p>
                    <p className="text-[9.5px] text-gray-400">
                      Nenhuma chave foi encontrada nas variáveis de ambiente. Recomendamos a você usar o botão <span className="text-[#dba823] hover:underline cursor-pointer font-bold" onClick={() => syncResultsFromAPI(true)}>Simular (Teste 🧪)</span> para conferir a automação em ação agora mesmo!
                    </p>
                  </div>
                </div>
              )}

              {/* API Setup Instructions block */}
              <AnimatePresence>
                {showConfigHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-black/50 rounded-xl border border-white/5 p-3.5 space-y-2.5 text-[10px] text-gray-300 leading-relaxed"
                  >
                    <p className="font-black text-xs text-cup-gold uppercase tracking-wider">
                      Guia para Configuração da API de Esportes
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="font-bold text-white">🏆 Opção 1: Football-Data.org (Serviço Mais Prático e Recomendado):</p>
                        <ol className="list-decimal pl-4.5 space-y-1 text-gray-300">
                          <li>Acesse o site <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="text-cup-gold hover:underline font-bold">football-data.org</a> e clique para criar uma conta gratuita.</li>
                          <li>Guarde o token enviado imediatamente ao seu email pessoal.</li>
                          <li>Adicione essa chave no arquivo <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[9.5px]">.env</code> local ou no Netlify com o nome de variável: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[9.5px]">VITE_FOOTBALL_DATA_API_KEY=sua_chave_aqui</code></li>
                        </ol>
                      </div>
                      <div className="pt-1.5 border-t border-white/5">
                        <p className="font-bold text-white">⚽ Opção 2: API-Football via RapidAPI:</p>
                        <ol className="list-decimal pl-4.5 space-y-1 text-gray-300">
                          <li>Crie uma conta gratuita em <a href="https://rapidapi.com/" target="_blank" rel="noopener noreferrer" className="text-cup-gold hover:underline font-bold">RapidAPI</a> e assine o plano free da <a href="https://rapidapi.com/api-sports/api/api-football" target="_blank" rel="noopener noreferrer" className="text-cup-gold hover:underline font-bold">API-Football</a>.</li>
                          <li>Copie a chave de cabeçalho <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[9.5px]">x-rapidapi-key</code> de qualquer playground de teste.</li>
                          <li>Configure no seu ambiente com o nome de variável: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[9.5px]">VITE_RAPIDAPI_KEY=sua_chave_aqui</code></li>
                        </ol>
                      </div>
                      <div className="pt-2 border-t border-white/5 text-[9.5px] text-gray-400">
                        🔒 <strong className="text-white">Segurança & Netlify:</strong> No painel administrativo do Netlify, selecione seu projeto e vá em <code className="text-white font-mono text-[9px]">Site configuration &gt; Environment variables</code>. Salve como uma variável comum. O prefixo <code className="text-white font-mono text-[9.5px]">VITE_</code> é obrigatório para que o código de front-end do React+Vite consiga ler as chaves durante o empacotamento.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1">
              {filteredMatchesForList.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-gray-450 bg-black/15 rounded-2xl border border-dashed border-white/10">
                  <span className="text-3xl mb-2">⚽</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-cup-lightgold/80">Nenhum confronto nesta fase</p>
                  <p className="text-[10px] mt-1 text-gray-400">Use o editor à esquerda para iniciar e liberar novos jogos.</p>
                </div>
              ) : (
                filteredMatchesForList.map((m) => {
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
              }))}
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
