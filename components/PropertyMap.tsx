import React from 'react';

interface PropertyMapProps {
  imoveis?: any[];
  address?: string;
  city?: string;
  state?: string;
  number?: string;
  neighborhood?: string;
  cep?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  imoveis, 
  address, 
  city, 
  state, 
  number, 
  neighborhood, 
  cep 
}) => {
  return (
    <div className="w-full h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200 border-dashed">
      <div className="text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mapa de Imóveis</p>
        <p className="text-slate-300 text-[10px] uppercase font-black tracking-tighter mt-1">{(imoveis || []).length} Imóveis Carregados</p>
      </div>
    </div>
  );
};

export default PropertyMap;
