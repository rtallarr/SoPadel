import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      date,
      team1_player1,
      team1_player2,
      team2_player1,
      team2_player2,
      sets1_1,
      sets2_1,
      sets1_2,
      sets2_2,
      sets1_3,
      sets2_3,
      winner_team,
    } = body;

    await sql`
      INSERT INTO matches (
        date, team1_player1, team1_player2,
        team2_player1, team2_player2,
        sets1_1, sets2_1, sets1_2, sets2_2,
        sets1_3, sets2_3, winner_team
      )
      VALUES (
        ${date}, ${team1_player1}, ${team1_player2},
        ${team2_player1}, ${team2_player2},
        ${sets1_1}, ${sets2_1}, ${sets1_2}, ${sets2_2},
        ${sets1_3}, ${sets2_3}, ${winner_team}
      );
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to insert match" }, { status: 500 });
  }
}