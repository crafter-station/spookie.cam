'use client';

export function CDate() {
  return (
    <time
      suppressHydrationWarning
      className="absolute bottom-8 left-8 font-vcr text-4xl font-black tracking-[0.1em] opacity-80"
    >
      {new Date().toLocaleDateString()}
    </time>
  );
}
