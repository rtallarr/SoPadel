"use client";

import React from "react";
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
  const [modalMatch, setModalMatch] = useState<Match | null>(null);
  const [tempSets, setTempSets] = useState({
    sets1_1: 0,
    sets2_1: 0,
    sets1_2: 0,
    sets2_2: 0,
    sets1_3: 0,
    sets2_3: 0,
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    })();
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group matches by day
  const groupedByDay = matches.reduce((groups, match) => {
    if (!match.date) return groups;
    const d = new Date(match.date);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    const dayKey = local.toISOString().split("T")[0];
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(match);
    return groups;
  }, {} as Record<string, Match[]>);

  // Sort days descending
  const sortedDays = Object.entries(groupedByDay).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Group by time within day
  const sortedAndGrouped = sortedDays.map(([day, dayMatches]) => {
    const timeGroups: Record<string, Match[]> = {};
    dayMatches.forEach((match) => {
      const time = formatTime(match.date);
      if (!timeGroups[time]) timeGroups[time] = [];
      timeGroups[time].push(match);
    });

    const sortedTimes = Object.entries(timeGroups).sort(
      ([t1], [t2]) =>
        new Date(`${day}T${t1}`).getTime() - new Date(`${day}T${t2}`).getTime()
    );

    return [day, sortedTimes] as [string, [string, Match[]][]];
  });

  const openModal = (match: Match) => {
    setModalMatch(match);
    setTempSets({
      sets1_1: match.sets1_1,
      sets2_1: match.sets2_1,
      sets1_2: match.sets1_2,
      sets2_2: match.sets2_2,
      sets1_3: match.sets1_3,
      sets2_3: match.sets2_3,
    });
  };

  const closeModal = () => setModalMatch(null);

  const handleSubmit = async () => {
    console.log(tempSets);
    if (!modalMatch) return;

    const res = await fetch(`/api/matches/${modalMatch.id}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempSets),
    });

    if (res.ok) {
      const updated = await res.json();
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      closeModal();
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        🎾 SoPadel
      </h1>

      {matches.length === 0 ? (
        <p className="text-center text-gray-300">No hay partidos todavía.</p>
      ) : (
        sortedAndGrouped.map(([dayKey, timeGroups]) => (
          <div key={dayKey} className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              📅{" "}
              {new Date(dayKey + "T00:00:00").toLocaleDateString("es-CL", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })}
            </h2>

            {timeGroups.map(([time, matchesAtTime]) => (
              <div key={time} className="mb-6">
                <h3 className="text-lg font-medium text-gray-300 mb-3 text-center">
                  🕒 {time}
                </h3>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {matchesAtTime.map((match) => {
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
                        className="relative bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col items-center"
                      >

                        <h2 className="font-semibold text-lg text-white mb-3">
                          Partido #{match.id}
                        </h2>

                        <div className="flex flex-col gap-3 w-full">
                          <div
                            className={`p-3 border-2 rounded-xl ${team1Border}`}
                          >
                            <p className="font-medium text-center text-white">
                              {match.team1_player1} & {match.team1_player2}
                            </p>
                          </div>

                          <div
                            className={`p-3 border-2 rounded-xl ${team2Border}`}
                          >
                            <p className="font-medium text-center text-white">
                              {match.team2_player1} & {match.team2_player2}
                            </p>
                          </div>
                        </div>

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
                              <td className="font-medium text-blue-400">
                                Equipo 1
                              </td>
                              <td>{match.sets1_1}</td>
                              <td>{match.sets1_2}</td>
                              <td>{match.sets1_3}</td>
                            </tr>
                            <tr>
                              <td className="font-medium text-red-400">
                                Equipo 2
                              </td>
                              <td>{match.sets2_1}</td>
                              <td>{match.sets2_2}</td>
                              <td>{match.sets2_3}</td>
                            </tr>
                          </tbody>
                        </table>

                        <button
                          onClick={() => openModal(match)}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition"
                        >
                          Registrar resultado
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Modal */}
      {modalMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-96 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={closeModal}
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              Registrar resultado - Partido #{modalMatch.id}
            </h2>

<div className="grid grid-cols-3 gap-2 text-white mb-4">
  <div></div>
  <div className="text-center font-medium">Equipo 1</div>
  <div className="text-center font-medium">Equipo 2</div>

  {[1, 2, 3].map((set) => (
    <React.Fragment key={set}>
      <div className="text-center font-medium">Set {set}</div>
      <input
        type="number"
        className="w-full rounded-md p-1 border-blue-500 border-2"
        value={tempSets[`sets1_${set}` as keyof typeof tempSets]}
        onChange={(e) =>
          setTempSets((prev) => ({
            ...prev,
            [`sets1_${set}`]: Number(e.target.value),
          }))
        }
      />
      <input
        type="number"
        className="w-full rounded-md p-1 border-blue-500 border-2"
        value={tempSets[`sets2_${set}` as keyof typeof tempSets]}
        onChange={(e) =>
          setTempSets((prev) => ({
            ...prev,
            [`sets2_${set}`]: Number(e.target.value),
          }))
        }
      />
    </React.Fragment>
  ))}
</div>


            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-md text-white font-semibold transition"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}