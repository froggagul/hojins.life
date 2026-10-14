import Hangul from "hangul-js";

export interface SearchEntry {
  title: string;
  url: string;
  type: "Blog" | "Publication" | "Project";
  detail: string;
  terms: string;
  language?: string;
}
const normalize = (text: string) =>
  Hangul.disassemble(text.toLowerCase()).join("");
export function matchesSearch(text: string, query: string): boolean {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(normalize);
  const normalized = normalize(text);
  const initials = Hangul.disassemble(text.toLowerCase(), true)
    .map((letters) => letters[0])
    .join("");
  return terms.every((term) =>
    /^[ㄱ-ㅎ]+$/.test(term)
      ? initials.includes(term)
      : normalized.includes(term),
  );
}
