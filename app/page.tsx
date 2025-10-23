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

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        🎾 SoPadel
      </h1>

      {matches.length === 0 ? (
        <p className="text-center text-gray-300">No hay partidos todavía.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((match) => {
            const team1Border =
              match.winner_team === 1
                ? "border-green-500"
                : match.winner_team === 2
                ? "border-red-500"
                : "border-blue-500";

            const team2Border =
              match.winner_team === 2
                ? "border-green-500"
                : match.winner_team === 1
                ? "border-red-500"
                : "border-blue-500";

            return (
              <div
                key={match.id}
                className="bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col items-center"
              >
                <h2 className="font-semibold text-lg text-white mb-3">
                  Partido #{match.id}
                </h2>

                {/* Teams */}
                <div className="flex flex-col gap-3 w-full">
                  <div className={`p-3 border-2 rounded-xl ${team1Border}`}>
                    <p className="font-medium text-center text-white">
                      {match.team1_player1} + {match.team1_player2}
                    </p>
                  </div>

                  <div className={`p-3 border-2 rounded-xl ${team2Border}`}>
                    <p className="font-medium text-center text-white">
                      {match.team2_player1} + {match.team2_player2}
                    </p>
                  </div>
                </div>

                {/* Set scores */}
                <table className="mt-4 text-center text-gray-200 border-collapse w-full">
                  <thead>
                    <tr className="text-sm text-gray-400">
                      <th></th>
                      <th>Set 1</th>
                      <th>Set 2</th>
                      <th>Set 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium text-blue-400">Equipo 1</td>
                      <td>{match.sets1_1}</td>
                      <td>{match.sets1_2}</td>
                      <td>{match.sets1_3}</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-red-400">Equipo 2</td>
                      <td>{match.sets2_1}</td>
                      <td>{match.sets2_2}</td>
                      <td>{match.sets2_3}</td>
                    </tr>
                  </tbody>
                </table>

                <button
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition"
                >
                  Registrar resultado
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}