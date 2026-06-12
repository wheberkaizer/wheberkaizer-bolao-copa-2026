import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match, Bet, Participant } from './types';
import {
  generateGroupMatches,
  generateKnockoutMatches,
  MOCK_PARTICIPANTS_NAMES,
  calculateBetScore,
} from './data/worldCupData';

// Subcomponents
import { CampoFutebol } from './components/CampoFutebol';
import { TrofeuSVG } from './components/TrofeuSVG';
import { TelaCadastro } from './components/TelaCadastro';
import { PainelJogos } from './components/PainelJogos';
import { TabelaRanking } from './components/TabelaRanking';
import { PainelRegras } from './components/PainelRegras';
import { PainelAdmin } from './components/PainelAdmin';

// Icons
import { Trophy, Users, Shield, BookOpen, LogOut, UserCheck } from 'lucide-react';

export default function App() {
  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jogos' | 'ranking' | 'regras'>('jogos');

  // Match and betting databases
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserBets, setCurrentUserBets] = useState<{ [matchId: string]: Bet }>({});

  // Submenus and UI selections
  const [activePhase, setActivePhase] = useState<string>('group');
  const [activeGroupTab, setActiveGroupTab] = useState<string>('A');

  // Admin secret panel
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Toast / Status notification alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save confirmation modal
  const [saveModal, setSaveModal] = useState<{
    show: boolean;
    status: 'success' | 'warning';
    title: string;
    message: string;
    participantName?: string;
    completedCount?: number;
    incompleteCount?: number;
  }>({
    show: false,
    status: 'success',
    title: '',
    message: '',
  });

  // Initialize App Databases & restore from LocalStorage
  useEffect(() => {
    // 1. Restore User Profile
    const savedUser = localStorage.getItem('bolao_2026_user_name');
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    // 2. Load Matches (Group + Knockouts)
    const storedMatches = localStorage.getItem('bolao_2026_matches');
    let loadedMatches: Match[] = [];
    let needsMigration = false;
    if (storedMatches) {
      try {
        loadedMatches = JSON.parse(storedMatches);
        const groupMatchesCount = loadedMatches.filter((m) => m.phase === 'group').length;
        const isOfficialData = loadedMatches.some((m) => m.id === '1' && m.teamA.code === 'MEX');
        if (groupMatchesCount !== 72 || !isOfficialData) {
          needsMigration = true;
          loadedMatches = [...generateGroupMatches(), ...generateKnockoutMatches()];
          localStorage.setItem('bolao_2026_matches', JSON.stringify(loadedMatches));
        }
      } catch (e) {
        loadedMatches = [...generateGroupMatches(), ...generateKnockoutMatches()];
      }
    } else {
      loadedMatches = [...generateGroupMatches(), ...generateKnockoutMatches()];
    }
    setMatches(loadedMatches);

    // 3. Load Current User Bets (with support for user-specific key)
    const specificBetsKey = savedUser ? `bolao_2026_user_bets_${savedUser}` : 'bolao_2026_user_bets';
    const storedUserBets = localStorage.getItem(specificBetsKey) || localStorage.getItem('bolao_2026_user_bets');
    let loadedUserBets: { [matchId: string]: Bet } = {};
    if (storedUserBets) {
      try {
        loadedUserBets = JSON.parse(storedUserBets);
      } catch (e) {
        loadedUserBets = {};
      }
    }
    setCurrentUserBets(loadedUserBets);

    // 4. Load Participants & their uniform random bets
    const storedParticipants = localStorage.getItem('bolao_2026_participants');
    if (storedParticipants && !needsMigration) {
      try {
        setParticipants(JSON.parse(storedParticipants));
      } catch (e) {
        initParticipants(savedUser || 'Competidor Solitário', loadedMatches, loadedUserBets);
      }
    } else {
      initParticipants(savedUser || 'Novo Campo', loadedMatches, loadedUserBets);
    }
  }, []);

  // Initialization helper to create simulated contenders with fixed guesses so the ranking calculation behaves with total realism
  const initParticipants = (
    currentName: string,
    allMatches: Match[],
    userBets: { [matchId: string]: Bet }
  ) => {
    const list: Participant[] = [];

    // Current user participant item
    const userPart: Participant = {
      id: 'current_user',
      name: currentName,
      isCurrentUser: true,
      bets: userBets,
      score: 0,
    };
    list.push(userPart);

    // Generate 10 competitors
    MOCK_PARTICIPANTS_NAMES.forEach((name, idx) => {
      const pBets: { [matchId: string]: Bet } = {};
      
      allMatches.forEach((m) => {
        // Generate a logical, realistic random guess for the bot (more likely to be low scoring results like 2-1 or 1-1)
        const randSeed = Math.random();
        let scoreA = 1;
        let scoreB = 1;

        if (randSeed < 0.25) {
          scoreA = 2; scoreB = 1;
        } else if (randSeed < 0.45) {
          scoreA = 1; scoreB = 0;
        } else if (randSeed < 0.60) {
          scoreA = 0; scoreB = 1;
        } else if (randSeed < 0.75) {
          scoreA = 1; scoreB = 2;
        } else if (randSeed < 0.90) {
          scoreA = 2; scoreB = 2;
        } else {
          scoreA = 0; scoreB = 0;
        }

        pBets[m.id] = { matchId: m.id, scoreA, scoreB };
      });

      list.push({
        id: `mock_p_${idx}`,
        name,
        isCurrentUser: false,
        bets: pBets,
        score: 0,
      });
    });

    // Compute their initial scores
    recalculateAllScores(list, allMatches);
  };

  // Compute all player scores relative to existing simulated results
  const recalculateAllScores = (participantList: Participant[], currentMatches: Match[]) => {
    const updated = participantList.map((participant) => {
      let totalPts = 0;
      
      currentMatches.forEach((match) => {
        // If match has simulated results
        if (match.scoreA !== null && match.scoreB !== null && match.scoreA !== undefined && match.scoreB !== undefined) {
          const betObj = participant.bets[match.id];
          if (betObj) {
            totalPts += calculateBetScore(betObj.scoreA, betObj.scoreB, match.scoreA, match.scoreB);
          }
        }
      });

      return {
        ...participant,
        score: totalPts,
      };
    });

    setParticipants(updated);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updated));
  };

  // Login handler
  const handleUserLogin = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem('bolao_2026_user_name', name);

    // Retrieve specific user bets if they exist in localStorage
    const savedSpecificBets = localStorage.getItem(`bolao_2026_user_bets_${name}`);
    let loadedBets = currentUserBets;
    if (savedSpecificBets) {
      try {
        loadedBets = JSON.parse(savedSpecificBets);
        setCurrentUserBets(loadedBets);
      } catch (e) {
        console.error("Erro ao carregar palpites anteriores", e);
      }
    }

    // Update current user item name in participants list
    let updatedParts = [...participants];
    const userIdx = updatedParts.findIndex((p) => p.isCurrentUser);
    
    if (userIdx >= 0) {
      updatedParts[userIdx].name = name;
      updatedParts[userIdx].bets = loadedBets;
    } else {
      // Re-initialize completely
      initParticipants(name, matches, loadedBets);
      return;
    }

    setParticipants(updatedParts);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updatedParts));
    recalculateAllScores(updatedParts, matches);
    triggerToast(`⚽ Bem-vindo ao campo, ${name}!`);
  };

  // User predicts score of a game
  const handleSaveBet = (matchId: string, scoreA: number | null, scoreB: number | null) => {
    const updatedBets = {
      ...currentUserBets,
      [matchId]: {
        matchId,
        scoreA,
        scoreB,
      },
    };

    setCurrentUserBets(updatedBets);
    localStorage.setItem('bolao_2026_user_bets', JSON.stringify(updatedBets));
    if (currentUser) {
      localStorage.setItem(`bolao_2026_user_bets_${currentUser}`, JSON.stringify(updatedBets));
    }

    // Inject updated bets into current user's participant slot
    const updatedParts = participants.map((p) => {
      if (p.isCurrentUser) {
        return {
          ...p,
          bets: updatedBets,
        };
      }
      return p;
    });

    setParticipants(updatedParts);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updatedParts));

    // Recompute current user score immediately
    recalculateAllScores(updatedParts, matches);
  };

  // Explicit confirmation click for "Salvar Palpites"
  const handleSaveAllBets = () => {
    if (!currentUser) return;

    const betsArray = Object.values(currentUserBets) as Bet[];
    
    // Strict validation check: identify bets with incomplete information (only one score entered)
    const incompleteBetsList = betsArray.filter((bet) => {
      const hasA = bet.scoreA !== null && bet.scoreA !== undefined && (bet.scoreA as any) !== '';
      const hasB = bet.scoreB !== null && bet.scoreB !== undefined && (bet.scoreB as any) !== '';
      return (hasA && !hasB) || (!hasA && hasB);
    });

    const completedBetsList = betsArray.filter((bet) => {
      const hasA = bet.scoreA !== null && bet.scoreA !== undefined && (bet.scoreA as any) !== '';
      const hasB = bet.scoreB !== null && bet.scoreB !== undefined && (bet.scoreB as any) !== '';
      return hasA && hasB;
    });

    if (incompleteBetsList.length > 0) {
      setSaveModal({
        show: true,
        status: 'warning',
        title: 'Palpites Incompletos Encontrados',
        message: `Atenção: Você inseriu o placar de apenas um dos lados em ${incompleteBetsList.length} jogo(s). Para evitar perdas de dados e garantir que suas previsões contem pontos, por favor termine de preencher esses confrontos por completo!`,
        participantName: currentUser,
        completedCount: completedBetsList.length,
        incompleteCount: incompleteBetsList.length,
      });
      return;
    }

    // Force strict conversion/clearing of empty values and string-to-number checks
    const cleanedBets: { [matchId: string]: Bet } = {};
    Object.keys(currentUserBets).forEach((matchId) => {
      const b = currentUserBets[matchId];
      if (b.scoreA !== null && b.scoreB !== null && (b.scoreA as any) !== '' && (b.scoreB as any) !== '') {
        cleanedBets[matchId] = {
          matchId,
          scoreA: typeof b.scoreA === 'string' ? parseInt(b.scoreA, 10) : b.scoreA,
          scoreB: typeof b.scoreB === 'string' ? parseInt(b.scoreB, 10) : b.scoreB,
        };
      }
    });

    // Save strictly to local storage
    const serializedBets = JSON.stringify(cleanedBets);
    localStorage.setItem('bolao_2026_user_bets', serializedBets);
    localStorage.setItem(`bolao_2026_user_bets_${currentUser}`, serializedBets);

    const updatedParts = participants.map((p) => {
      if (p.isCurrentUser) {
        return {
          ...p,
          bets: cleanedBets,
        };
      }
      return p;
    });

    setParticipants(updatedParts);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updatedParts));
    recalculateAllScores(updatedParts, matches);

    // Save and open elegant result confirmation modal
    setSaveModal({
      show: true,
      status: 'success',
      title: 'Palpites Salvos com Sucesso!',
      message: `Palpites salvos com sucesso para o participante ${currentUser}!`,
      participantName: currentUser,
      completedCount: Object.keys(cleanedBets).length,
      incompleteCount: 0,
    });

    triggerToast(`💾 Palpites de ${currentUser} foram gravados com sucesso!`);
  };

  // Admin saves official outcome
  const handleSaveOfficialScores = (updatedScores: { [matchId: string]: { scoreA: number | null; scoreB: number | null } }) => {
    const updatedMatches = matches.map((m) => {
      const edited = updatedScores[m.id];
      if (edited) {
        return {
          ...m,
          scoreA: edited.scoreA,
          scoreB: edited.scoreB,
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    localStorage.setItem('bolao_2026_matches', JSON.stringify(updatedMatches));

    // Force score recalculations for everyone
    recalculateAllScores(participants, updatedMatches);
    triggerToast('🏆 Resultados oficiais salvos! O ranking geral foi atualizado em tempo real.');
  };

  const handleCreateMatch = (newMatch: Match) => {
    const updated = [...matches, newMatch];
    setMatches(updated);
    localStorage.setItem('bolao_2026_matches', JSON.stringify(updated));
    recalculateAllScores(participants, updated);
    triggerToast(`⚽ Jogo de Mata-Mata criado: ${newMatch.teamA.name} x ${newMatch.teamB.name}!`);
  };

  const handleDeleteMatch = (matchId: string) => {
    const updated = matches.filter((m) => m.id.toString() !== matchId);
    setMatches(updated);
    localStorage.setItem('bolao_2026_matches', JSON.stringify(updated));
    recalculateAllScores(participants, updated);
    triggerToast('🗑️ Jogo customizado removido do bolão.');
  };

  // Reset entire tournament results
  const handleResetSimulation = () => {
    const freshMatches = [...generateGroupMatches(), ...generateKnockoutMatches()];
    setMatches(freshMatches);
    localStorage.setItem('bolao_2026_matches', JSON.stringify(freshMatches));

    // Just preserve user bets, wipe match actual scores
    const updatedParts = participants.map((p) => ({
      ...p,
      score: 0,
    }));
    setParticipants(updatedParts);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updatedParts));
    
    // Recalculate
    recalculateAllScores(updatedParts, freshMatches);
    triggerToast('🔄 Torneio reiniciado! Todos os placares oficiais foram apagados.');
  };

  // Logout / Reset entire user profile
  const handleLogout = () => {
    localStorage.removeItem('bolao_2026_user_name');
    localStorage.removeItem('bolao_2026_user_bets');
    localStorage.removeItem('bolao_2026_matches');
    localStorage.removeItem('bolao_2026_participants');
    
    setCurrentUser(null);
    setCurrentUserBets({});
    
    // Regenerate fresh database
    const freshM = [...generateGroupMatches(), ...generateKnockoutMatches()];
    setMatches(freshM);
    
    // Reset tabs
    setActiveTab('jogos');
    setActivePhase('group');
    setActiveGroupTab('A');

    // Trigger full fresh mock participants structure
    initParticipants('Novo Campo', freshM, {});
    triggerToast('🚪 Perfil desconectado. Comece novamente!');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div
      className="relative min-h-screen text-white font-sans overflow-x-hidden selection:bg-cup-gold selection:text-pitch-dark"
      style={{ background: 'radial-gradient(circle at center, #1B5E20 0%, #0A3D1E 100%)' }}
    >
      {/* 1. Subtle grass lines background */}
      <CampoFutebol />

      {/* 2. Top Banner Ambient Decorative Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
        
        {/* TOAST NOTIFIER */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A3D1E] border-2 border-cup-gold text-cup-lightgold px-6 py-3 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-2.5 max-w-sm"
            >
              <span className="text-base">🏆</span>
              <span className="text-xs font-bold leading-tight uppercase tracking-wide text-white">
                {toastMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODERN EXTRA SECURE SAVE VERIFICATION MODAL */}
        <AnimatePresence>
          {saveModal.show && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-[#093517] border-[3px] border-cup-gold rounded-3xl p-6 shadow-2xl relative max-w-md w-full overflow-hidden text-center"
              >
                {/* Decorative glowing background mesh */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cup-gold/15 to-transparent pointer-events-none" />

                {saveModal.status === 'success' ? (
                  <>
                    <div className="w-16 h-16 bg-cup-gold/25 mx-auto rounded-full flex items-center justify-center border-2 border-cup-gold shadow-lg shadow-cup-gold/10 mb-4 text-3xl">
                      🏆
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-cup-gold uppercase tracking-tight font-sans">
                      {saveModal.title}
                    </h3>
                    
                    {/* Explicitly written text based on the user's instructions */}
                    <div className="my-4 text-sm text-white/95 leading-relaxed font-sans">
                      <p className="bg-black/30 py-3 px-4 rounded-2xl border border-white/5 font-semibold">
                        🏆 Palpites salvos com sucesso para o participante <span className="text-cup-gold font-extrabold">{saveModal.participantName}</span>!
                      </p>
                      <p className="mt-3 text-xs text-gray-350 px-2">
                        {saveModal.message} Todos os dados de placar foram seguros e armazenados no seu navegador de forma definitiva. Nenhum palpite foi perdido!
                      </p>
                    </div>

                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center text-xs font-mono mb-4 text-cup-lightgold">
                      ⚽ <span className="font-bold">{saveModal.completedCount}</span> Palpites Ativos & Validados!
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSaveModal(prev => ({ ...prev, show: false }))}
                      className="w-full py-3 bg-gradient-to-r from-cup-gold to-cup-lightgold text-pitch-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md hover:from-white hover:to-white hover:text-pitch-dark"
                    >
                      Ok, Excelente!
                    </motion.button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-amber-500/25 mx-auto rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg mb-4 text-3xl">
                      ⚠️
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-tight font-sans">
                      {saveModal.title}
                    </h3>

                    <p className="my-4 text-sm text-white/90 leading-relaxed px-1 font-sans">
                      {saveModal.message}
                    </p>

                    <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5 mb-5 font-mono text-xs">
                      <div className="text-center border-r border-white/5 last:border-0">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wide">Completos</span>
                        <strong className="text-emerald-400 font-extrabold text-sm">{saveModal.completedCount}</strong>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wide">Incompletos</span>
                        <strong className="text-amber-400 font-extrabold text-sm">{saveModal.incompleteCount}</strong>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSaveModal(prev => ({ ...prev, show: false }))}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-pitch-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md hover:from-white hover:to-white hover:text-pitch-dark"
                    >
                      Entendi, vou completar!
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CONDITION 1: RECREATIONAL NOT SIGNED IN YET */}
        <AnimatePresence mode="wait">
          {!currentUser ? (
            <TelaCadastro key="login" onEnter={handleUserLogin} />
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-6 md:py-8 flex-1"
            >
              {/* TOP BRAND NAVIGATION MENU BAR */}
              <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 border border-white/10 p-4 rounded-2xl shadow-xl mb-6 backdrop-blur-md">
                
                {/* Brand Logo with miniaturized Gold Trophy */}
                <div className="flex items-center gap-3 select-none">
                  <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 shadow-inner">
                    <TrofeuSVG size={36} />
                  </div>
                  <div>
                    <h1 className="text-base font-black tracking-tight leading-none uppercase italic text-white">
                      BOLÃO <span className="text-cup-gold">FIFA 2026</span>
                    </h1>
                    <p className="text-[10px] text-cup-lightgold uppercase tracking-widest font-bold">
                      Bolão Amador Estilo Premium
                    </p>
                  </div>
                </div>

                {/* Navigation Hub */}
                <nav className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5">
                  {[
                    { key: 'jogos', label: 'Jogos & Palpites', icon: Trophy },
                    { key: 'ranking', label: 'Ranking', icon: Users },
                    { key: 'regras', label: 'Regras', icon: BookOpen },
                  ].map((tab) => {
                    const isSel = activeTab === tab.key;
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSel
                            ? 'bg-cup-gold text-pitch-dark shadow-xl font-bold'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <IconComp size={13} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Profile Card & LogOut */}
                <div className="flex items-center gap-3.5 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cup-gold/10 text-cup-gold font-bold border border-cup-gold/20 flex items-center justify-center text-xs">
                      {currentUser ? currentUser[0].toUpperCase() : 'C'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-cup-gold uppercase font-bold tracking-widest leading-none">Participante</span>
                      <span className="text-xs font-bold text-white max-w-[110px] truncate">
                        {currentUser}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 bg-black/20 hover:bg-red-500/15 text-white/60 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                    title="Desconectar perfil"
                  >
                    <LogOut size={13} />
                    <span>Sair</span>
                  </button>
                </div>
              </header>

              {/* SUBTLY TIMED FADE-IN TRANSITIONS FOR ACTIVE VIEWS */}
              <main className="mt-4">
                {activeTab === 'jogos' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PainelJogos
                      matches={matches}
                      userBets={currentUserBets}
                      onSaveBet={handleSaveBet}
                      onSaveAllBets={handleSaveAllBets}
                      activePhase={activePhase}
                      setActivePhase={setActivePhase}
                      activeGroupTab={activeGroupTab}
                      setActiveGroupTab={setActiveGroupTab}
                    />
                  </motion.div>
                )}

                {activeTab === 'ranking' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabelaRanking
                      participants={participants}
                      currentUser={currentUser}
                    />
                  </motion.div>
                )}

                {activeTab === 'regras' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PainelRegras />
                  </motion.div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GLOBAL FOOTER */}
        <footer className="text-center py-6 mt-12 border-t border-white/5 text-[10px] text-gray-500 max-w-lg mx-auto relative z-10 select-none flex flex-col items-center gap-3">
          <div>
            <p className="uppercase tracking-widest font-mono">
              ⚽ Copa do Mundo FIFA 2026 - Bolão Amador
            </p>
            <p className="mt-1 leading-relaxed text-gray-600">
              Protótipo 100% recreativo desenvolvido com fins didáticos e demonstrativos. Sem dinheiro real, transações ou fins lucrativos.
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-cup-gold/10 hover:text-cup-gold text-gray-500 rounded-lg text-[10px] font-mono tracking-wider uppercase border border-white/5 hover:border-cup-gold/25 transition-all cursor-pointer"
            >
              🛠️ Abrir Painel Admin
            </button>
          )}
        </footer>

        {/* ADMIN MODAL COMPONENT */}
        <AnimatePresence>
          {isAdminOpen && (
            <PainelAdmin
              isOpen={isAdminOpen}
              onClose={() => setIsAdminOpen(false)}
              matches={matches}
              onSaveOfficialScores={handleSaveOfficialScores}
              onCreateMatch={handleCreateMatch}
              onDeleteMatch={handleDeleteMatch}
              onResetTournament={handleResetSimulation}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
