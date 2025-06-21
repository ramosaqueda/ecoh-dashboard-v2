// components/DatosRelato.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {Tokenizr} from 'ts-tokenizr';
import { removeStopwords, spa } from 'stopword';

import { PocketKnife, Car, Users } from 'lucide-react';
import { GiPistolGun } from 'react-icons/gi';

interface RelatoProps {
  causaId: string;
}

const DatosRelato = ({ causaId }: RelatoProps) => {
  const [relato, setRelato] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string[]>([]);
  const [armasFuego, setArmasFuego] = useState(false);
  const [armasBlanca, setArmasBlanca] = useState(false);
  const [vehiculos, setVehiculos] = useState(false);
  const [grupoPersonas, setGrupoPersonas] = useState(false);

  useEffect(() => {

    if(!causaId) {
      console.error('causaId no definido');
    }

    const fetchRelato = async () => {
      try {
        const response = (await axios.get(`/api/relato-hecho/${causaId}`));
        setRelato(response.data.relato);
        tokenizeAndDetect(response.data.relato);
      } catch (error) {
        setError('Error fetching relato');
        console.error('Error fetching relato:', error);
      }
    };

    fetchRelato();
  }, [causaId]);

  const tokenizeAndDetect = (data: any) => {
    const text = data.toLowerCase();
    const tokenizer = new Tokenizr();

    tokenizer.rule(/\s+/, (ctx) => { ctx.ignore(); }); // Ignorar espacios en blanco
    tokenizer.rule(/[a-zA-Z0-9áéíóúñü]+/, (ctx, match) => {
      ctx.accept('word', match[0]);
    });
    tokenizer.rule(/./, (ctx, match) => { ctx.ignore(); }); // Ignorar cualquier otro carácter no reconocido

    tokenizer.input(text);
    let tokens: string[] = [];
    tokenizer.tokens().forEach(token => {
      if (typeof token.value === 'string') {
        tokens.push(token.value);
      }
    });

    tokens = tokens.filter(word => word.length > 0);
    tokens = removeStopwords(tokens, spa);
    setTokens(tokens);

    const expresiones = [/\bsecuestr\w*/, /\bpistol\w*/, /\bcriminal\w*/, /\bcuchillo/, /\bamenaz\w*/];
    const expArmasFuego = [/\bpistol\w*/, /\bala\w*/, /\dispar\w*/];
    const expArmasBlanca = [/\bcuchillo/];
    const expVehiculos = [/\bauto\w*/, /\bvehiculo\w*/];
    const expGrupoPersonas = [/\bcriminales\w*/, /\bsecuestradores\w*/, /\bsujetos\w*/, /\bhombres\w*/, /\bmujeres\w*/, /\bsospechosos\w*/, /sospechosas\w*/];

    const detectarPalabra = (expReg: RegExp[], tokens: string[]): boolean => {
      for (const exp of expReg) {
        for (const token of tokens) {
          if (exp.test(token)) {
            return true;
          }
        }
      }
      return false;
    };

    setArmasFuego(detectarPalabra(expArmasFuego, tokens));
    setArmasBlanca(detectarPalabra(expArmasBlanca, tokens));
    setVehiculos(detectarPalabra(expVehiculos, tokens));
    setGrupoPersonas(detectarPalabra(expGrupoPersonas, tokens));
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!relato) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='flex items-center gap-2'>
        <PocketKnife size={20}/>
        <p className="text-[15px] font-semibold">Armas Blancas: {armasBlanca ? 'Sí' : 'No'}</p>
        
      </div>
      < div className='flex items-center gap-2'>
        <GiPistolGun size={25}/>
        <p className="text-[15px] font-semibold">Armas de Fuego: {armasFuego ? 'Sí' : 'No'}</p>
      </div>
      <div className='flex items-center gap-2'>
        <Car/>
        <p className="text-[15px] font-semibold">Automóviles: {vehiculos ? 'Sí' : 'No'}</p>
      </div>
      <div className='flex items-center gap-2'>
        <Users/>
        <p className="text-[15px] font-semibold">Grupo de personas: {grupoPersonas ? 'Sí' : 'No'}</p>
      </div>
      
      
    </div>
  );
};
export default DatosRelato;