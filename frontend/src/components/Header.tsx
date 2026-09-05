import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  onBack?: () => void;
}

export function Header({ title = "", onBack }: HeaderProps) {
  return (
    <header className="top-row">
      {onBack ? (
        <button className="icon-button" onClick={onBack} type="button" aria-label="Volver">
          <ChevronLeft aria-hidden="true" size={26} />
        </button>
      ) : (
        <span />
      )}
      <h1 className="page-title">{title}</h1>
      <span />
    </header>
  );
}
