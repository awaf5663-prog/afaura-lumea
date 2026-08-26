/** lucide-react ne fournit pas d'icône TikTok : celle-ci est tracée à la main. */
export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M16.5 2h-2.6v13.2a2.4 2.4 0 1 1-2.4-2.4c.2 0 .4 0 .6.1v-2.7a5.6 5.6 0 0 0-.6 0 5.1 5.1 0 1 0 5.1 5.1V8.9a6.4 6.4 0 0 0 3.8 1.2V7.5a3.8 3.8 0 0 1-3.8-3.8V2Z" />
    </svg>
  );
}
