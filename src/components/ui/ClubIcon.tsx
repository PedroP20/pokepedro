export type ClubIconName = 'home' | 'dex' | 'battle' | 'play' | 'events' | 'trophy' | 'arrow' | 'search' | 'shield' | 'spark' | 'user' | 'book' | 'logout' | 'wild';
const paths: Record<ClubIconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  dex: <><rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="9" cy="8" r="1.5"/><path d="M13 8h3M8 13h8M8 17h5"/></>,
  battle: <><path d="m4 3 13 13M3 3l1 5 4-4ZM16 14l5 5M14 16l4-4M20 3 7 16M21 3l-1 5-4-4ZM8 14l-5 5M10 16l-4-4"/></>,
  play: <><rect x="2" y="6" width="20" height="13" rx="5"/><path d="M6 12h6M9 9v6M16 11h.01M19 14h.01"/></>,
  events: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></>,
  trophy: <><path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 6H3v3a4 4 0 0 0 4 4M17 6h4v3a4 4 0 0 1-4 4M12 15v6M8 21h8"/></>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
  spark: <path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>,
  user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
  book: <><path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2ZM12 5v16"/></>,
  wild: <><path d="m2 20 6.5-11 4 6.5L15 12l7 8Z"/><path d="M11.2 13.2 8.5 9l-1.6 2.6"/><circle cx="17" cy="5" r="2"/></>,
  logout: <><path d="M9 3H4v18h5M10 12h11m-4-4 4 4-4 4"/></>,
};
export default function ClubIcon({ name, size = 22, className }: { name: ClubIconName; size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>;
}
