import Matches from "./components/matches";

export default function Home() {
  return (
    <Matches
      endpoint="/api/matches"
      name="home"
    />
  );
}