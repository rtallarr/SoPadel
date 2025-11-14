export type Match = {
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

export type Player = {
    name: string;
    lastName: string;
    sigla: string;
    rating: number;
    rd: number;
    vol: number;
};