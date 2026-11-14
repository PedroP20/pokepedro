// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PokéClub 2.0 · Seu universo Pokémon',
    short_name: 'PokéClub',
    description: 'Descubra, jogue e evolua no seu clube Pokémon.',
    start_url: '/',
    display: 'standalone',        // Oculta a barra do navegador para parecer um app nativo
    background_color: '#f7f8fa',
    theme_color: '#183b65',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',      // 👈 CORRIGIDO: Apenas 'maskable' no lugar de 'any maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
