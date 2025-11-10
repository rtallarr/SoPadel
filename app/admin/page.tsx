"use client";

import { useEffect, useState } from "react";

type Match = {
  id: number;
  team1_player1: string;
  team1_player2: string;
  team2_player1: string;
  team2_player2: string;
  date?: string;
};

export default function Admin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [playersInput, setPlayersInput] = useState("");
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

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

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
  };

  const handleSaveEdit = async () => {
    if (!editingMatch) return;

    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingMatch),
    });

    setEditingMatch(null);
    fetchMatches();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        ⚙️ Panel de Administración
      </h1>

      {/* Crear partidos aleatorios */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-white">
          🎲 Crear Partidos Aleatorios
        </h2>
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

      <h3 className="text-xl font-bold text-center mb-4 text-white">
        Partidos de esta semana
      </h3>

      {matches.length === 0 ? (
        <p className="text-center text-gray-300">No hay partidos todavía.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((match) =>
            editingMatch?.id === match.id ? (
              <div
                key={match.id}
                className="bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-3"
              >
                <h2 className="font-semibold text-lg text-white text-center">
                  ✏️ Editar Partido #{match.id}
                </h2>

                {/* Team 1 vs Team 2 layout */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="bg-gray-700/40 p-3 rounded-xl">
                    <div className="flex flex-col gap-2">
                      <input
                        className="bg-gray-700 text-white p-2 rounded-md w-full"
                        value={editingMatch.team1_player1}
                        onChange={(e) =>
                          setEditingMatch({
                            ...editingMatch,
                            team1_player1: e.target.value,
                          })
                        }
                        placeholder="Jugador 1"
                      />
                      <input
                        className="bg-gray-700 text-white p-2 rounded-md w-full"
                        value={editingMatch.team1_player2}
                        onChange={(e) =>
                          setEditingMatch({
                            ...editingMatch,
                            team1_player2: e.target.value,
                          })
                        }
                        placeholder="Jugador 2"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-700/40 p-3 rounded-xl">
                    <div className="flex flex-col gap-2">
                      <input
                        className="bg-gray-700 text-white p-2 rounded-md w-full"
                        value={editingMatch.team2_player1}
                        onChange={(e) =>
                          setEditingMatch({
                            ...editingMatch,
                            team2_player1: e.target.value,
                          })
                        }
                        placeholder="Jugador 1"
                      />
                      <input
                        className="bg-gray-700 text-white p-2 rounded-md w-full"
                        value={editingMatch.team2_player2}
                        onChange={(e) =>
                          setEditingMatch({
                            ...editingMatch,
                            team2_player2: e.target.value,
                          })
                        }
                        placeholder="Jugador 2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded-md"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingMatch(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-4 rounded-md"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={match.id}
                className="relative bg-gray-800 rounded-2xl shadow-lg p-5 pb-10 flex flex-col items-center"
              >
                <span className="absolute bottom-3 right-4 text-sm text-gray-400">
                  {formatDate(match.date)}
                </span>
                <div className="flex justify-between w-full items-center mb-3">
                  <h2 className="font-semibold text-lg text-white">
                    Partido #{match.id}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-400 hover:text-blue-500 text-sm"
                      onClick={() => handleEditMatch(match)}
                    >
                      ✏ Editar
                    </button>
                    <button
                      className="text-red-400 hover:text-red-500 text-sm"
                      onClick={() => handleDeleteMatch(match.id)}
                    >
                      ✖ Eliminar
                    </button>
                  </div>
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
            )
          )}
        </div>
      )}
    </main>
  );
}