import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT
        m.id,
        m.date,

        COALESCE(
          p1.nombre || ' ' || p1.apellido,
          m.team1_player1
        ) AS team1_player1,

        COALESCE(
          p2.nombre || ' ' || p2.apellido,
          m.team1_player2
        ) AS team1_player2,

        COALESCE(
          p3.nombre || ' ' || p3.apellido,
          m.team2_player1
        ) AS team2_player1,

        COALESCE(
          p4.nombre || ' ' || p4.apellido,
          m.team2_player2
        ) AS team2_player2,

        m.team1_set1,
        m.team2_set1,
        m.team1_set2,
        m.team2_set2,
        m.team1_set3,
        m.team2_set3,
        m.winner_team
      FROM matches m
      LEFT JOIN players p1 ON m.team1_player1_sigla = p1.sigla
      LEFT JOIN players p2 ON m.team1_player2_sigla = p2.sigla
      LEFT JOIN players p3 ON m.team2_player1_sigla = p3.sigla
      LEFT JOIN players p4 ON m.team2_player2_sigla = p4.sigla;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}