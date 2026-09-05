import { Heart, History, Home, User } from "lucide-react";

import type { Screen } from "../App";

const items = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "history", label: "Historial", icon: History },
  { id: "favorites", label: "Favoritos", icon: Heart },
  { id: "profile", label: "Perfil", icon: User },
] as const;

interface BottomNavProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          className={active === id ? "active" : ""}
          key={id}
          onClick={() => onNavigate(id)}
          type="button"
        >
          <Icon aria-hidden="true" size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
