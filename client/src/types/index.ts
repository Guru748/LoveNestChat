export interface Message {
  id?: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  read: boolean;
  encrypted: string;
}

export interface ThemeOption {
  name: string;
  class: string;
  color: string;
}
