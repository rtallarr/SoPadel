export type Match = {
  id: number;
  date: string;
  team1_player1: string;
  team1_player2: string;
  team2_player1: string;
  team2_player2: string;
  team1_set1: number;
  team1_set2: number;
  team1_set3: number;
  team2_set1: number;
  team2_set2: number;
  team2_set3: number;
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