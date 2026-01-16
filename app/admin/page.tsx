"use client";
import { Match } from "../types/match";
import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";

type PlayerKey =
  | "team1_player1"
  | "team1_player2"
  | "team2_player1"
  | "team2_player2";

function DraggablePlayer({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    touchAction: "none",
    opacity: isDragging ? 0 : 1, // Fixes double render
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 text-center font-medium rounded-md cursor-grab select-none transition
        ${isDragging ? "bg-blue-500 text-white scale-105 shadow-lg" : "bg-gray-700 text-white"}
      `}
    >
      {name}
    </div>
  );
}

function DroppableSlot({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md p-1 transition ${
        isOver ? "bg-yellow-500/60" : ""
      }`}
    >
      {children}
    </div>
  );
}


export default function Admin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [playersInput, setPlayersInput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
      .map((line) => line.trim().replace(/^\d+[.\-\s\u200B-\u200D\uFEFF\u2060⁠]*/, "").trim())
      .filter((line) => line && !line.toLowerCase().startsWith("listado"));

    //console.log("playerInput:", playersInput, "\nparsed players:", players);
    //console.log(playersInput.split("\n").map((line) => line.replace(/\d+\.?-?/, "")));

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const [sourceMatchId, sourceTeam, sourceIndex] = String(active.id).split("-");
    const [destMatchId, destTeam, destIndex] = String(over.id).split("-");

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

    const sourceKey = `${sourceTeam}_player${Number(sourceIndex) + 1}` as PlayerKey;
    const destKey = `${destTeam}_player${Number(destIndex) + 1}` as PlayerKey;

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
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
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
                  {/* <button
                    className="text-red-400 hover:text-red-500 text-sm"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    ✖ Eliminar
                  </button> */}
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

                        const slotId = `${match.id}-${team}-${i}`;
                        return (
                          <DroppableSlot id={slotId} key={slotId}>
                            <DraggablePlayer id={slotId} name={player} />
                          </DroppableSlot>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="p-2 text-center font-medium rounded-md bg-blue-500 text-white shadow-xl scale-105 cursor-grabbing">
                {(() => {
                  const [matchId, team, index] = activeId.split("-");
                  const match = matches.find(m => m.id === Number(matchId));
                  if (!match) return null;
                  const key = `${team}_player${Number(index) + 1}` as PlayerKey;
                  return match[key];
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </main>
  );
}