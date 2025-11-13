"use client";

import { useState } from "react";

export default function EnterPin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError("PIN incorrecto");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={submitPin}
        className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold text-white">Ingresar PIN</h1>

        <input
          type="password"
          className="p-2 rounded bg-gray-700 text-white"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>

        {error && <p className="text-red-400">{error}</p>}
      </form>
    </main>
  );
}