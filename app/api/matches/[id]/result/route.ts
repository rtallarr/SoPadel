import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const matchId = Number(id);

  try {
    const { team1_set1, team1_set2, team1_set3, team2_set1, team2_set2, team2_set3 } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "Missing match id" }, { status: 400 });
    }

    let count_set1 = 0; let count_set2 = 0; let winner_team = 0;
    if (team1_set1 > team2_set1) {
      count_set1++;
    } else if (team1_set1 < team2_set1) {
      count_set2++;
    }
    if (team1_set2 > team2_set2) {
      count_set1++;
    } else if (team1_set2 < team2_set2) {
      count_set2++;
    }
    if (team1_set3 > team2_set3) {
      count_set1++;
    } else if (team1_set3 < team2_set3) {
      count_set2++;
    }

    if (count_set1 > count_set2) {
      winner_team = 1;
    } else if (count_set2 > count_set1) {
      winner_team = 2;
    }

    const result = await sql`
      UPDATE matches
      SET 
        team1_set1 = ${team1_set1},
        team1_set2 = ${team1_set2},
        team1_set3 = ${team1_set3},
        team2_set1 = ${team2_set1},
        team2_set2 = ${team2_set2},
        team2_set3 = ${team2_set3},
        winner_team = ${winner_team}
      WHERE id = ${matchId}
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
