"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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

    const sourceId = result.source.droppableId; // e.g. match-1-team1-0
    const destId = result.destination.droppableId;

    if (sourceId === destId) return;

    const [_, sourceMatchId, sourceTeam, sourceSlot] = sourceId.split("-");
    const [__, destMatchId, destTeam, destSlot] = destId.split("-");

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

    type PlayerKey =
      | "team1_player1"
      | "team1_player2"
      | "team2_player1"
      | "team2_player2";

    const sourceKey = `${sourceTeam}_player${Number(sourceSlot) + 1}` as PlayerKey;
    const destKey = `${destTeam}_player${Number(destSlot) + 1}` as PlayerKey;

    // swap players
    const temp = sourceMatch[sourceKey];
    sourceMatch[sourceKey] = destMatch[destKey];
    destMatch[destKey] = temp;

    updatedMatches[sourceMatchIndex] = sourceMatch;
    updatedMatches[destMatchIndex] = destMatch;

    setMatches(updatedMatches);

    // Persist both matches if they differ
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
                  {["team1", "team2"].map((team, tIndex) => (
                    <Droppable
                      key={`${match.id}-${team}`}
                      droppableId={`match-${match.id}-${team}-${tIndex}`}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="p-3 border-2 border-gray-600 rounded-xl min-h-[70px] flex flex-col gap-2"
                        >
                          {[1, 2].map((num, i) => {
                            const playerKey = `${team}_player${num}` as keyof Match;
                            const player = match[playerKey];
                            const droppableId = `match-${match.id}-${team}-${i}`;
                            return (
                              <Droppable
                                key={droppableId}
                                droppableId={droppableId}
                              >
                                {(innerProvided) => (
                                  <div
                                    ref={innerProvided.innerRef}
                                    {...innerProvided.droppableProps}
                                  >
                                    <Draggable
                                      draggableId={droppableId}
                                      index={0}
                                    >
                                      {(dragProvided) => (
                                        <div
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          {...dragProvided.dragHandleProps}
                                          className="bg-gray-700 text-white p-2 rounded-md text-center cursor-move select-none"
                                        >
                                          {player}
                                        </div>
                                      )}
                                    </Draggable>
                                    {innerProvided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
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
