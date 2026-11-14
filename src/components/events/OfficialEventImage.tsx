'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { GameEvent } from '@/lib/events';

export default function OfficialEventImage({ image, className = '', decorative = false }: { image: NonNullable<GameEvent['images']>[number]; className?: string; decorative?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`event-image-unavailable ${className}`}><span aria-hidden="true">✦</span><span>Imagem indisponível</span></div> : <Image src={image.url} alt={decorative ? '' : image.alt} width={960} height={540} loading="lazy" unoptimized className={className} onError={() => setFailed(true)} />;
}
