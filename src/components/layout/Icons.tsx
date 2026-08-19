/** Small stroke icons, inline so there is no icon-font or sprite request. */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CartIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L20.5 8H6" />
      <circle cx="10" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </svg>
  );
}

export function UserIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function SearchIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function HomeIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" />
      <path d="M9.5 20.5v-6h5v6" />
    </svg>
  );
}

export function GridIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.56 3.75 1.53 5.28L2 22l5-1.65a9.8 9.8 0 0 0 5.04 1.38h.01c5.43 0 9.83-4.4 9.83-9.84C21.88 6.4 17.47 2 12.04 2Zm5.75 14.06c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.12a15.3 15.3 0 0 1-1.65-.62c-2.9-1.26-4.8-4.2-4.94-4.4-.15-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.59.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.29.49l-.44.51c-.15.15-.3.31-.13.61.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.68-.17 1.35Z" />
    </svg>
  );
}
