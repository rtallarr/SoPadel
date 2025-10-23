import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT *
      FROM matches
      WHERE DATE_TRUNC('week', date) = DATE_TRUNC('week', NOW())
      ORDER BY date DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "No match id provided" }, { status: 400 });
    }

    await sql`
      DELETE FROM matches
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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
      winner_team
    } = body;

    if (!id) {
      return NextResponse.json({ error: "No match id provided" }, { status: 400 });
    }

    await sql`
      UPDATE matches
      SET
        team1_player1 = ${team1_player1},
        team1_player2 = ${team1_player2},
        team2_player1 = ${team2_player1},
        team2_player2 = ${team2_player2},
        sets1_1 = ${sets1_1},
        sets2_1 = ${sets2_1},
        sets1_2 = ${sets1_2},
        sets2_2 = ${sets2_2},
        sets1_3 = ${sets1_3},
        sets2_3 = ${sets2_3},
        winner_team = ${winner_team}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}