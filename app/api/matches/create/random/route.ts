import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

function formatDateForPG(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get Wednesday of current week
function getWednesdayOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = 3 - day;
  const wed = new Date(now);
  wed.setDate(now.getDate() + diff);
  wed.setHours(0, 0, 0, 0);
  return wed;
}

export async function POST(req: Request) {
  try {
    const { players } = await req.json();
    if (!Array.isArray(players) || players.length < 4) {
      return NextResponse.json(
        { error: "Need at least 4 players" },
        { status: 400 }
      );
    }

    // Schedule times
    const wed = getWednesdayOfWeek();
    const times = [0, 45];

    for (const mins of times) {
      const shuffled = shuffle(players);
      const matchDate = new Date(wed);
      matchDate.setHours(19, mins, 0, 0);
      const matchDateStr = formatDateForPG(matchDate);
      for (let i = 0; i + 3 < shuffled.length; i += 4) {
        const [p1, p2, p3, p4] = shuffled.slice(i, i + 4);

        await sql`
          INSERT INTO matches (
            date, team1_player1, team1_player2, team2_player1, team2_player2
          )
          VALUES (
            ${matchDateStr}, ${p1}, ${p2}, ${p3}, ${p4}
          )
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create matches" }, { status: 500 });
  }
}