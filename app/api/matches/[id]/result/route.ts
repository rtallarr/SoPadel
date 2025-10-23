import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const matchId = Number(params.id);
  console.log(request);
  try {
    const { sets1_1, sets1_2, sets1_3, sets2_1, sets2_2, sets2_3 } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "Missing match id" }, { status: 400 });
    }

    let count_set1 = 0; let count_set2 = 0; let winner_team = 0;
    if (sets1_1 > sets2_1) {
      count_set1++;
    } else {
      count_set2++;
    }
    if (sets1_2 > sets2_2) {
      count_set1++;
    } else {
      count_set2++;
    }
    if (sets1_3 > sets2_3) {
      count_set1++;
    } else {
      count_set2++;
    }

    if (count_set1 > count_set2) {
      winner_team = 1;
    } else if (count_set2 > count_set1) {
      winner_team = 2;
    }

    await sql`
      UPDATE matches
      SET 
        sets1_1 = ${sets1_1},
        sets1_2 = ${sets1_2},
        sets1_3 = ${sets1_3},
        sets2_1 = ${sets2_1},
        sets2_2 = ${sets2_2},
        sets2_3 = ${sets2_3},
        winner_team = ${winner_team}
      WHERE id = ${matchId}
    `;

    return NextResponse.json({ message: "Match updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}
