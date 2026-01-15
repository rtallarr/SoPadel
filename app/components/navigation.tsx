"use client";

import { useState } from "react";
import { Home, BarChart2, Clock, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { href: "/", label: "Partidos", icon: Home },
    { href: "/stats", label: "Estadísticas", icon: BarChart2 },
    { href: "/history", label: "Historial", icon: Clock },
  ];

  return (
    <nav className="bg-gray-800 text-white px-8 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">SoPadel</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 text-lg items-center">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
        </div>
        </div>

        {/* Mobile hamgurger */}
        <button
          className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-700 pt-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-blue-400 transition-colors font-medium flex items-center gap-2 py-2 px-2 hover:bg-gray-700 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}