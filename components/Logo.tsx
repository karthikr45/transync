/* eslint-disable @next/next/no-img-element */
export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="https://cpapfiles.blob.core.windows.net/assets/logo_-_full_color.svg"
      alt="Transcend"
      className={className}
    />
  );
}
