"use client";

import { useEffect, useState } from "react";

type Match = {
  id: number;
  team1_player1: string;
  team1_player2: string;
  team2_player1: string;
  team2_player2: string;
};

export default function Admin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [playersInput, setPlayersInput] = useState("");

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreateRandomMatches = async () => {
    const players = playersInput
        .split("\n")
        .map((line) => line.replace(/^\d+\.?-?\s*/, "").trim())
        .filter(Boolean);

    await fetch("/api/matches/create/random", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
    });

    setPlayersInput("");
    fetchMatches();
  };

  const handleDeleteMatch = async (id: number) => {
    await fetch("/api/matches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchMatches();
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        ⚙️ Panel de Administración
      </h1>

      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">🎲 Crear Partidos Aleatorios</h2>
        <textarea
          placeholder={`1.- Pedro\n2.- Juan\n3.- Jose\n...`}
          value={playersInput}
          onChange={(e) => setPlayersInput(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded-md w-full h-32"
        />
        <button
          onClick={handleCreateRandomMatches}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition w-full"
        >
          Crear Partidos Aleatorios
        </button>
      </div>

      {matches.length === 0 ? (
        <p className="text-center text-gray-300">No hay partidos todavía.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col items-center"
            >
              <div className="flex justify-between w-full items-center mb-3">
                <h2 className="font-semibold text-lg text-white">Partido #{match.id}</h2>
                <button
                  className="text-red-400 hover:text-red-500 text-sm"
                  onClick={() => handleDeleteMatch(match.id)}
                >
                  ✖ Eliminar
                </button>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <div className="p-3 border-2 border-gray-600 rounded-xl">
                  <p className="font-medium text-center text-white">
                    {match.team1_player1} & {match.team1_player2}
                  </p>
                </div>

                <div className="p-3 border-2 border-gray-600 rounded-xl">
                  <p className="font-medium text-center text-white">
                    {match.team2_player1} & {match.team2_player2}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}