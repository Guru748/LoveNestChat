import { ThemeOption } from "@/types";

interface ThemeSelectorProps {
  themes: ThemeOption[];
  currentTheme: string;
  onSelectTheme: (themeClass: string) => void;
}

const ThemeSelector = ({ themes, currentTheme, onSelectTheme }: ThemeSelectorProps) => {
  return (
    <div className="absolute top-16 right-4 bg-white p-3 rounded-xl shadow-lg z-10 border border-[hsl(var(--secondary))]">
      <div className="grid grid-cols-3 gap-2">
        {themes.map((theme) => (
          <div
            key={theme.name}
            className={`w-8 h-8 rounded-full ${theme.color} cursor-pointer hover:ring-2 ring-[hsl(var(--accent))] ${
              currentTheme === theme.class ? "ring-2" : ""
            }`}
            onClick={() => onSelectTheme(theme.class)}
            title={theme.name}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
