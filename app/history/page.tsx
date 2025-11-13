import Matches from "./../components/matches";

export default function Home() {
  return (
    <Matches
      endpoint="/api/matches/get/all"
      title="🎾 Partidos de la Semana"
    />
  );
}