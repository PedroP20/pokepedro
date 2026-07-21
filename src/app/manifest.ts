// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PokéPedro - Mestre da Pokédex',
    short_name: 'PokéPedro',
    description: 'Treinamento, desafios e memorização oficial da Pokédex!',
    start_url: '/',
    display: 'standalone',        // Oculta a barra do navegador para parecer um app nativo
    background_color: '#F5F5F5',  // Cor de fundo ao abrir o app
    theme_color: '#1B4F9C',       // Cor da barra de status no celular (Azul Pokémon)
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