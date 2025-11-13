"use client";

import { useEffect, useState } from "react";

type Match = {
  id: number;
  date?: string;
  team1_player1: string;
  team1_player2: string;
  team2_player1: string;
  team2_player2: string;
  sets1_1: number;
  sets2_1: number;
  sets1_2: number;
  sets2_2: number;
  sets1_3: number;
  sets2_3: number;
  winner_team?: number | null;
};

export default function StatisticsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/matches/get/all");
      const data = await res.json();
      setMatches(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-10">Cargando estadísticas...</p>;

  //general
  const totalMatches = matches.length;
  //const totalSets = 
  const matchesRegistered = matches.filter(match => match.winner_team !== null).length;
  
  const playerWins: Record<string, number> = {};
  const playerMatches: Record<string, number> = {};

  matches.forEach(match => {
    if (match.winner_team === null) return; // skip matches without a result

    [match.team1_player1, match.team1_player2, match.team2_player1, match.team2_player2].forEach(p => {
      playerMatches[p] = (playerMatches[p] || 0) + 1;
    });
    if (match.winner_team === 1) {
      [match.team1_player1, match.team1_player2].forEach(p => {
        playerWins[p] = (playerWins[p] || 0) + 1;
      });
    } else if (match.winner_team === 2) {
      [match.team2_player1, match.team2_player2].forEach(p => {
        playerWins[p] = (playerWins[p] || 0) + 1;
      });
    }
  });

  // Top 5 players by total wins
  const topByWins = Object.entries(playerWins)
    .sort(([, winsA], [, winsB]) => winsB - winsA)
    .slice(0, 5);

  // Top 5 players by win rate
  const topByWinRate = Object.keys(playerMatches)
    .map(player => {
      const wins = playerWins[player] || 0;
      const total = playerMatches[player];
      return { player, wins, total, winRate: (wins / total) * 100 };
    })
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  //console.log("topByWins", topByWins);
  //console.log("topByWinRate", topByWinRate);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <p>Total de partidos: <strong>{totalMatches}</strong></p>
          <p>Partidos con resultados: <strong>{matchesRegistered} ({(matchesRegistered/totalMatches*100).toFixed(1)}%)</strong> </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Total de Victorias</h2>
          <ul className="list-disc list-inside">
            {topByWins.map(([player, wins], i) => (
              <li key={i}>
                {player}: {wins}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Porcentaje de Victorias</h2>
          <ul className="list-disc list-inside">
            {topByWinRate.map(({ player, wins, total, winRate }) => (
              <li key={player}>
                {player}: {wins}/{total} victorias ({winRate.toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>

      </div>
    </main>
  );
}