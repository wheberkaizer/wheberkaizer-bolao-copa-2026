import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match, Bet, Participant } from './types';
import {
  generateGroupMatches,
  generateKnockoutMatches,
  calculateBetScore,
} from './data/worldCupData';
import { supabase } from './supabaseClient';

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

  // Fetch & sync all participants and official guesses in real-time with Supabase
  const syncWithSupabase = async (providedMatches?: Match[], customUserName?: string) => {
    try {
      const activeMatches = providedMatches || matches;
      const activeUser = customUserName !== undefined ? customUserName : currentUser;

      // Fetch all entries from the remote Supabase 'palpites' table
      const { data, error } = await supabase
        .from('palpites')
        .select('*');

      if (error) {
        console.warn("Aviso ao ler do Supabase, utilizando backups do LocalStorage:", error.message);
        return;
      }

      if (data && Array.isArray(data)) {
        // Organize flat list of guesses by player nickname
        const betsMapByNickname: { [nickname: string]: { [matchId: string]: Bet } } = {};
        
        data.forEach((row: any) => {
          const nick = row.nickname;
          const matchId = row.match_id;
          const scoreA = row.score_a;
          const scoreB = row.score_b;
          
          if (!nick) return;
          if (!betsMapByNickname[nick]) {
            betsMapByNickname[nick] = {};
          }
          
          betsMapByNickname[nick][matchId] = {
            matchId: matchId.toString(),
            scoreA: scoreA !== null && scoreA !== undefined ? Number(scoreA) : null,
            scoreB: scoreB !== null && scoreB !== undefined ? Number(scoreB) : null,
          };
        });

        // Map grouped results into a Participant structure
        let list: Participant[] = Object.keys(betsMapByNickname).map((nick) => {
          const isCurrentUser = activeUser ? nick.toLowerCase().trim() === activeUser.toLowerCase().trim() : false;
          return {
            id: `user_db_${nick}`,
            name: nick,
            isCurrentUser,
            bets: betsMapByNickname[nick],
            score: 0, // Will be computed dynamically below
          };
        });

        // Ensure current active user has a placeholder slot in the leader panel if they are freshly registered
        if (activeUser) {
          const exists = list.some(p => p.name.toLowerCase().trim() === activeUser.toLowerCase().trim());
          if (!exists) {
            const backupBetsKey = `bolao_2026_user_bets_${activeUser}`;
            const localUserBetsString = localStorage.getItem(backupBetsKey) || localStorage.getItem('bolao_2026_user_bets');
            let baseUserBets: { [mId: string]: Bet } = {};
            if (localUserBetsString) {
              try {
                baseUserBets = JSON.parse(localUserBetsString);
              } catch (err) {}
            }
            list.push({
              id: `user_${Date.now()}`,
              name: activeUser,
              isCurrentUser: true,
              bets: baseUserBets,
              score: 0,
            });
          } else {
            // Guarantee isCurrentUser flag and state matching
            list = list.map(p => {
              if (p.name.toLowerCase().trim() === activeUser.toLowerCase().trim()) {
                return { ...p, isCurrentUser: true };
              }
              return { ...p, isCurrentUser: false };
            });
          }

          // Merge loaded DB bets of current user with local components
          const selfPart = list.find(p => p.isCurrentUser);
          if (selfPart) {
            setCurrentUserBets(selfPart.bets);
          }
        }

        setParticipants(list);
        localStorage.setItem('bolao_2026_participants', JSON.stringify(list));
        recalculateAllScores(list, activeMatches);
      }
    } catch (err) {
      console.error("Erro na sincronização de dados do Supabase:", err);
    }
  };

  // Initialize App Databases & restore from LocalStorage with real-time cloud background fetch
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

    // 4. Load Participants & ensure they are loaded without mock data
    const storedParticipants = localStorage.getItem('bolao_2026_participants');
    let loadedParticipants: Participant[] = [];
    if (storedParticipants && !needsMigration) {
      try {
        const parsed = JSON.parse(storedParticipants);
        // Filter out any mock participants
        loadedParticipants = parsed.filter((p: any) => !p.id.startsWith('mock_p_') && p.id !== 'current_user');
      } catch (e) {
        loadedParticipants = [];
      }
    }

    // If there is a savedUser, make sure they exist in the loadedParticipants list
    if (savedUser) {
      const exists = loadedParticipants.some(p => p.name.toLowerCase().trim() === savedUser.toLowerCase().trim());
      if (!exists) {
        loadedParticipants.push({
          id: `user_${Date.now()}`,
          name: savedUser,
          isCurrentUser: true,
          bets: loadedUserBets,
          score: 0
        });
      } else {
        // Ensure they are flagged as currentUser
        loadedParticipants = loadedParticipants.map(p => {
          if (p.name.toLowerCase().trim() === savedUser.toLowerCase().trim()) {
            return { ...p, isCurrentUser: true, bets: loadedUserBets };
          }
          return { ...p, isCurrentUser: false };
        });
      }
    }

    setParticipants(loadedParticipants);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(loadedParticipants));
    recalculateAllScores(loadedParticipants, loadedMatches);

    // 5. Fire off live Supabase synchronized load
    syncWithSupabase(loadedMatches, savedUser || undefined);
  }, []);

  // Initialization helper to create participants list starting with only actual logged-in users (starts fully empty if no user)
  const initParticipants = (
    currentName: string | null,
    allMatches: Match[],
    userBets: { [matchId: string]: Bet }
  ) => {
    const list: Participant[] = [];

    if (currentName) {
      const userPart: Participant = {
        id: `user_${Date.now()}`,
        name: currentName,
        isCurrentUser: true,
        bets: userBets,
        score: 0,
      };
      list.push(userPart);
    }

    setParticipants(list);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(list));
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
  const handleUserLogin = async (name: string) => {
    setCurrentUser(name);
    localStorage.setItem('bolao_2026_user_name', name);

    let loadedBets = currentUserBets;

    try {
      // First, attempt to retrieve this specific user's guesses from Supabase
      const { data, error } = await supabase
        .from('palpites')
        .select('*')
        .eq('nickname', name);

      if (!error && data && data.length > 0) {
        const dbBets: { [mId: string]: Bet } = {};
        data.forEach((row: any) => {
          dbBets[row.match_id] = {
            matchId: row.match_id.toString(),
            scoreA: row.score_a !== null ? Number(row.score_a) : null,
            scoreB: row.score_b !== null ? Number(row.score_b) : null,
          };
        });
        loadedBets = dbBets;
        setCurrentUserBets(dbBets);
        const serialized = JSON.stringify(dbBets);
        localStorage.setItem(`bolao_2026_user_bets_${name}`, serialized);
        localStorage.setItem('bolao_2026_user_bets', serialized);
      } else {
        // Fallback to local storage if no database record exists
        const savedSpecificBets = localStorage.getItem(`bolao_2026_user_bets_${name}`);
        if (savedSpecificBets) {
          try {
            loadedBets = JSON.parse(savedSpecificBets);
            setCurrentUserBets(loadedBets);
          } catch (e) {
            console.error("Erro ao carregar palpites anteriores", e);
          }
        }
      }

      // Refresh the wider list of players from Supabase
      await syncWithSupabase(matches, name);
      triggerToast(`⚽ Bem-vindo de volta, ${name}! Seus dados foram sincronizados em tempo real.`);
    } catch (err) {
      console.warn("Erro ao buscar dados de login no Supabase, operando localmente:", err);
      // Fallback
      const savedSpecificBets = localStorage.getItem(`bolao_2026_user_bets_${name}`);
      if (savedSpecificBets) {
        try {
          loadedBets = JSON.parse(savedSpecificBets);
          setCurrentUserBets(loadedBets);
        } catch (e) {}
      }
      triggerToast(`⚽ Bem-vindo ao campo, ${name}! (Modo Offline)`);
    }
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
  const handleSaveAllBets = async () => {
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

    // Save strictly to local storage as fallback
    const serializedBets = JSON.stringify(cleanedBets);
    localStorage.setItem('bolao_2026_user_bets', serializedBets);
    localStorage.setItem(`bolao_2026_user_bets_${currentUser}`, serializedBets);

    // Prepare rows for Supabase bulk upsert
    const upsertRows = Object.keys(cleanedBets).map((matchId) => {
      const b = cleanedBets[matchId];
      return {
        nickname: currentUser,
        match_id: matchId.toString(),
        score_a: b.scoreA,
        score_b: b.scoreB,
      };
    });

    let syncSuccess = false;
    let syncErrorMsg = '';

    if (upsertRows.length > 0) {
      try {
        const { error: upsertError, status } = await supabase
          .from('palpites')
          .upsert(upsertRows, { onConflict: 'nickname,match_id' });

        const isSuccessStatus = status && status >= 200 && status < 300;
        if (isSuccessStatus || !upsertError) {
          syncSuccess = true;
        } else {
          console.error("Erro ao enviar palpites para o Supabase (Status:", status, "):", upsertError?.message);
          syncErrorMsg = upsertError?.message || `Erro com código de status: ${status}`;
        }
      } catch (err: any) {
        console.error("Erro de rede ao salvar palpites:", err);
        syncErrorMsg = err?.message || 'Falha de rede';
      }
    } else {
      // No active complete bets to upsert
      syncSuccess = true;
    }

    // Refresh state from central source to sync rankings
    await syncWithSupabase(matches, currentUser);

    if (syncSuccess) {
      setSaveModal({
        show: true,
        status: 'success',
        title: 'Palpites Salvos com Sucesso!',
        message: `Todos os seus palpites de placar foram salvos com sucesso e sincronizados em tempo real com o banco de dados nuvem do Supabase!`,
        participantName: currentUser,
        completedCount: Object.keys(cleanedBets).length,
        incompleteCount: 0,
      });
      triggerToast(`💾 Palpites de ${currentUser} sincronizados com o Supabase!`);
    } else {
      setSaveModal({
        show: true,
        status: 'warning',
        title: 'Salvo Localmente (Nuvem offline)',
        message: `Os palpites de ${currentUser} foram guardados localmente no seu navegador, mas não pudemos sincronizar em tempo real com o banco de dados nuvem do Supabase. Motivo: ${syncErrorMsg}`,
        participantName: currentUser,
        completedCount: Object.keys(cleanedBets).length,
        incompleteCount: 0,
      });
      triggerToast(`⚠️ Palpites persistidos de forma local apenas.`);
    }
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
    
    setCurrentUser(null);
    setCurrentUserBets({});
    
    // Reset isCurrentUser flag for all registrants
    const updatedParts = participants.map((p) => ({ ...p, isCurrentUser: false }));
    setParticipants(updatedParts);
    localStorage.setItem('bolao_2026_participants', JSON.stringify(updatedParts));

    // Reset tabs
    setActiveTab('jogos');
    setActivePhase('group');
    setActiveGroupTab('A');

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
                    onClick={async () => {
                      await syncWithSupabase(matches, currentUser || undefined);
                      triggerToast('🔄 Dados atualizados da nuvem Supabase!');
                    }}
                    className="p-2 bg-black/20 hover:bg-emerald-500/15 text-white/70 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                    title="Sincronizar dados em tempo real"
                  >
                    <span>🔄 Atualizar</span>
                  </button>

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
                      currentUser={currentUser}
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
