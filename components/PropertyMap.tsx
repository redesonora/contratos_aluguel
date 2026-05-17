'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Leaflet markers fix for Next.js - dynamic import to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const ChangeViewWrapper = dynamic(() => Promise.resolve(({ center }: { center: [number, number] }) => {
   
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}), { ssr: false });

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
  number?: string;
  neighborhood?: string;
  cep?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ address, city, state, number, neighborhood, cep }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Import leaflet only on client side
    import('leaflet').then(leaflet => {
      setL(leaflet.default);
      
      const DefaultIcon = leaflet.default.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      leaflet.default.Marker.prototype.options.icon = DefaultIcon;
    });
  }, []);

  useEffect(() => {
    const geocode = async () => {
      setLoading(true);
      setError(null);
      
      const tryFetch = async (params: Record<string, string | undefined> | string) => {
        try {
          // Nominatim requires identification. Email is part of their usage policy.
          let url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&email=contato@gerentepro.com.br';
          if (typeof params === 'string') {
            url += `&q=${encodeURIComponent(params)}`;
          } else {
            Object.entries(params).forEach(([key, value]) => {
              if (value) url += `&${key}=${encodeURIComponent(value)}`;
            });
          }
          
          const response = await fetch(url);
          if (!response.ok) return null;
          const data = await response.json();
          return data && data.length > 0 ? data[0] : null;
        } catch {
          return null;
        }
      };

      // 1. Tentar busca estrutizada (mais precisa)
      const formattedCep = cep && cep.length === 8 ? `${cep.substring(0, 5)}-${cep.substring(5)}` : cep;
      
      let result = await tryFetch({
        street: `${number || ''} ${address}`.trim(),
        city: city,
        state: state,
        postalcode: formattedCep,
        country: 'Brasil'
      });

      // 2. Tentar busca estruturada sem CEP
      if (!result && formattedCep) {
        result = await tryFetch({
          street: `${number || ''} ${address}`.trim(),
          city: city,
          state: state,
          country: 'Brasil'
        });
      }

      // 3. Tentar busca estruturada com abreviações comuns (Ex: Doutor -> Dr ou Dr.)
      if (!result && address.toLowerCase().includes('doutor')) {
        const altAddress1 = address.replace(/doutor/i, 'Dr');
        const altAddress2 = address.replace(/doutor/i, 'Dr.');
        
        result = await tryFetch({
          street: `${number || ''} ${altAddress1}`.trim(),
          city: city,
          state: state,
          country: 'Brasil'
        });
        
        if (!result) {
          result = await tryFetch({
            street: `${number || ''} ${altAddress2}`.trim(),
            city: city,
            state: state,
            country: 'Brasil'
          });
        }
      }

      // 4. Se o endereço tiver número embutido (ex: "Rua X, 100") e também passamos número
      if (!result && address.includes(',') && number) {
        const addressBase = address.split(',')[0].trim();
        result = await tryFetch({
          street: `${number} ${addressBase}`,
          city: city,
          state: state,
          country: 'Brasil'
        });
      }

      // 5. Tentar sem o número se estiver falhando
      if (!result && number) {
        result = await tryFetch({
          street: address,
          city: city,
          state: state,
          country: 'Brasil'
        });
      }

      // 6. Tentar busca livre (q=) como último recurso com várias combinações
      if (!result) {
        const fullQuery = `${number || ''} ${address}, ${neighborhood || ''}, ${city}, ${state}, ${formattedCep || ''}, Brasil`.replace(/\s\s+/g, ' ');
        result = await tryFetch(fullQuery);
      }

      if (!result) {
        // Tentar apenas o endereço e cidade na busca livre
        result = await tryFetch(`${address}, ${city}, Brasil`);
      }
      
      if (result) {
        setPosition([parseFloat(result.lat), parseFloat(result.lon)]);
      } else {
        setError('Localização não encontrada');
      }
      
      setLoading(false);
    };

    if (address && city) {
      geocode();
    }
  }, [address, city, state, number, neighborhood, cep]);

  if (!L || loading) return <div className="h-64 bg-slate-100 flex items-center justify-center rounded-xl animate-pulse text-slate-400 font-bold uppercase text-[10px]">Carregando mapa...</div>;
  if (error) return (
    <div className="h-64 bg-slate-100 flex flex-col items-center justify-center rounded-xl p-6 text-center gap-3">
      <div className="text-slate-400 font-bold uppercase text-[10px]">{error}</div>
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}${number ? `, ${number}` : ''}, ${city}, ${state}, Brasil`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
      >
        Buscar no Google Maps
      </a>
    </div>
  );
  if (!position) return <div className="h-64 bg-slate-100 flex items-center justify-center rounded-xl text-slate-400 font-bold uppercase text-[10px]">Endereço pendente</div>;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 isolation-auto bg-slate-50">
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-[10px] font-bold text-slate-800">
              {address}, {number}
            </div>
          </Popup>
        </Marker>
        <ChangeViewWrapper center={position} />
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
