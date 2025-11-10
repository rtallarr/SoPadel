"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type PlayerKey =
  | "team1_player1"
  | "team1_player2"
  | "team2_player1"
  | "team2_player2";

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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const [sourceMatchId, sourceTeam, sourceNum] =
      source.droppableId.split("-");
    const [destMatchId, destTeam, destNum] = destination.droppableId.split("-");

    const sourceMatchIndex = matches.findIndex(
      (m) => m.id === Number(sourceMatchId)
    );
    const destMatchIndex = matches.findIndex(
      (m) => m.id === Number(destMatchId)
    );

    if (sourceMatchIndex === -1 || destMatchIndex === -1) return;

    const updatedMatches = [...matches];
    const sourceMatch = { ...updatedMatches[sourceMatchIndex] };
    const destMatch =
      sourceMatchId === destMatchId
        ? sourceMatch
        : { ...updatedMatches[destMatchIndex] };

    const sourceKey = `${sourceTeam}_player${Number(sourceNum) + 1}` as PlayerKey;
    const destKey = `${destTeam}_player${Number(destNum) + 1}` as PlayerKey;

    const temp = sourceMatch[sourceKey];
    sourceMatch[sourceKey] = destMatch[destKey];
    destMatch[destKey] = temp;

    updatedMatches[sourceMatchIndex] = sourceMatch;
    updatedMatches[destMatchIndex] = destMatch;
    setMatches(updatedMatches);

    await fetch("/api/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sourceMatch),
    });

    if (sourceMatchId !== destMatchId) {
      await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destMatch),
      });
    }
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matches.map((match) => (
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
                  <button
                    className="text-red-400 hover:text-red-500 text-sm"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    ✖ Eliminar
                  </button>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  {["team1", "team2"].map((team) => (
                    <div
                      key={`${match.id}-${team}`}
                      className="p-3 border-2 rounded-xl border-gray-600 bg-gray-700/40"
                    >
                      {[0, 1].map((i) => {
                        const playerKey = `${team}_player${i + 1}` as PlayerKey;
                        const player = match[playerKey];

                        return (
                          <Droppable
                            droppableId={`${match.id}-${team}-${i}`}
                            key={`${match.id}-${team}-${i}`}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`rounded-md p-1 transition ${
                                  snapshot.isDraggingOver
                                    ? "bg-yellow-500/60"
                                    : ""
                                }`}
                              >
                                <Draggable
                                  draggableId={`${match.id}-${team}-${i}`}
                                  index={i}
                                >
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className={`p-2 text-center font-medium cursor-grab rounded-md transition select-none ${
                                        dragSnapshot.isDragging
                                          ? "bg-blue-500 text-white scale-105 shadow-lg"
                                          : "bg-gray-700 text-white"
                                      }`}
                                    >
                                      {player}
                                    </div>
                                  )}
                                </Draggable>
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </main>
  );
}