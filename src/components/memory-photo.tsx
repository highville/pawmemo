"use client";

import { useState } from "react";

type MemoryPhotoProps = {
  src: string;
  alt: string;
};

export function MemoryPhoto({ src, alt }: MemoryPhotoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-surface-line bg-surface-soft px-4 text-center text-sm font-semibold text-outline">
        Photo preview is unavailable right now.
      </div>
    );
  }

  return (
    <div className="relative h-56 overflow-hidden rounded-xl">
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
    </div>
  );
}
