"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Match } from "../types/match";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  endpoint: string;
  name: string;
};

export default function Matches({ endpoint, name }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [modalMatch, setModalMatch] = useState<Match | null>(null);
  const [tempSets, setTempSets] = useState({
    team1_set1: 0,
    team1_set2: 0,
    team1_set3: 0,
    team2_set1: 0,
    team2_set2: 0,
    team2_set3: 0,
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(endpoint);
      const data = await res.json();
      setMatches(data);
    })();
  }, [endpoint]);

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
    const dayKey = new Date(match.date).toISOString().split("T")[0];
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
      team1_set1: match.team1_set1,
      team1_set2: match.team1_set2,
      team1_set3: match.team1_set3,
      team2_set1: match.team2_set1,
      team2_set2: match.team2_set2,
      team2_set3: match.team2_set3,
    });
  };

  const closeModal = () => setModalMatch(null);

  const handleSubmit = async () => {
    //console.log(tempSets);
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
                        : match.winner_team === 0
                        ? "border-yellow-400"
                        : "border-blue-500";

                    const team2Border =
                      match.winner_team === 2
                        ? "border-green-500"
                        : match.winner_team === 1
                        ? "border-red-500"
                        : match.winner_team === 0
                        ? "border-yellow-400"
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
                              <td>{match.team1_set1}</td>
                              <td>{match.team1_set2}</td>
                              <td>{match.team1_set3}</td>
                            </tr>
                            <tr>
                              <td className="font-medium text-red-400">
                                Equipo 2
                              </td>
                              <td>{match.team2_set1}</td>
                              <td>{match.team2_set2}</td>
                              <td>{match.team2_set3}</td>
                            </tr>
                          </tbody>
                        </table>
                      {name === "home" ? (
                        match.winner_team === null || match.winner_team === undefined ? (
                          <button
                            onClick={() => openModal(match)}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition"
                          >
                            Registrar resultado
                          </button>
                        ) : (
                          <>
                            <p className="w-full mt-4 text-green-400 text-center font-semibold">
                              Resultado registrado
                            </p>
                            <button
                              onClick={() => openModal(match)}
                              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md transition"
                            >
                              Editar
                            </button>
                          </>
                        )
                      ) : (
                        match.winner_team === null || match.winner_team === undefined ? (
                          <p className="w-full mt-4 text-red-400 text-center font-semibold">
                            Resultado desconocido
                          </p>
                        ) : (
                          <p className="w-full mt-4 text-green-400 text-center font-semibold">
                            Resultado registrado
                          </p>
                        )
                      )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <Dialog open={!!modalMatch} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-gray-800 text-white">
          {modalMatch && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Registrar resultado - Partido #{modalMatch.id}
                </DialogTitle>
                {/* <DialogDescription>
                  Ingresa los resultados de cada set.
                </DialogDescription> */}
              </DialogHeader>

              <div className="grid grid-cols-4 gap-3 text-white mb-4 mt-4">
                <div></div>
                {[1, 2, 3].map((set) => (
                  <div key={`header-${set}`} className="text-center font-medium">
                    Set {set}
                  </div>
                ))}

                {[
                  { key: "team1", label: "Equipo 1" },
                  { key: "team2", label: "Equipo 2" },
                ].map((team) => (
                  <React.Fragment key={team.key}>
                    <div className="text-center font-medium">{team.label}</div>

                    {[1, 2, 3].map((set) => {
                      const field = `${team.key}_set${set}` as keyof typeof tempSets;

                      return (
                        <input
                          key={`${team.key}-${set}`}
                          type="number"
                          className="w-full rounded-md p-1 border-blue-500 border-2 bg-gray-900"
                          value={tempSets[field]}
                          onChange={(e) =>
                            setTempSets((prev) => ({
                              ...prev,
                              [field]: Number(e.target.value),
                            }))
                          }
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-md text-white font-semibold transition"
              >
                Guardar
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>

    </main>
  );
}