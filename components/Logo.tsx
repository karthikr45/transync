/* eslint-disable @next/next/no-img-element */
export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="https://mytranscend.com/wp-content/uploads/2024/02/Transcend2C.png"
      alt="Transcend"
      className={className}
    />
  );
}
