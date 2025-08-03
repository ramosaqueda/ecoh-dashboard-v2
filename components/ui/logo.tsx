'use client';

const Logo = () => {
  return (
    <div className="transition-all duration-300 cursor-pointer drop-shadow-lg hover:scale-105"> 
      <svg 
        width="220" 
        height="140" 
        viewBox="0 0 400 150" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto transition-all duration-300 brightness-75 hover:brightness-100"
        
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#0040ad', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#0055cc', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#fa7800', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#ff8a00', stopOpacity:1}} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Elemento geométrico de fondo - Hexágono parcial */}
        <path d="M 20 75 L 35 50 L 65 50 L 80 75 L 65 100 L 35 100 Z" fill="url(#blueGradient)" opacity="0.1"/>
        
        {/* Elementos decorativos - Líneas de conexión */}
        <line x1="320" y1="40" x2="340" y2="30" stroke="url(#orangeGradient)" strokeWidth="2" opacity="0.6"/>
        <line x1="340" y1="30" x2="360" y2="35" stroke="url(#orangeGradient)" strokeWidth="2" opacity="0.6"/>
        <line x1="320" y1="110" x2="340" y2="120" stroke="url(#orangeGradient)" strokeWidth="2" opacity="0.6"/>
        <line x1="340" y1="120" x2="360" y2="115" stroke="url(#orangeGradient)" strokeWidth="2" opacity="0.6"/>
        
        {/* Círculos decorativos */}
        <circle cx="350" cy="32" r="3" fill="url(#orangeGradient)" opacity="0.8"/>
        <circle cx="350" cy="118" r="3" fill="url(#orangeGradient)" opacity="0.8"/>
        <circle cx="25" cy="75" r="4" fill="url(#blueGradient)" opacity="0.3"/>
        
        {/* Letra S */}
        <path d="M 95 95 
                 C 95 105, 105 110, 120 110
                 C 135 110, 145 105, 145 95
                 C 145 85, 135 80, 120 80
                 C 105 80, 95 75, 95 65
                 C 95 55, 105 50, 120 50
                 C 135 50, 145 55, 145 65
                 L 130 65
                 C 130 60, 125 58, 120 58
                 C 115 58, 110 60, 110 65
                 C 110 70, 115 72, 120 72
                 C 135 72, 145 77, 145 87
                 C 145 97, 135 102, 120 102
                 C 105 102, 95 97, 95 87
                 Z" 
              fill="url(#blueGradient)" filter="url(#shadow)"/>
        
        {/* Letra A */}
        <path d="M 165 110
                 L 175 50
                 L 190 50
                 L 200 110
                 L 185 110
                 L 183 95
                 L 177 95
                 L 175 110
                 Z
                 M 178 82
                 L 182 82
                 L 180 72
                 Z" 
              fill="url(#orangeGradient)" filter="url(#shadow)"/>
        
        {/* Letra C */}
        <path d="M 245 50
                 C 225 50, 215 60, 215 80
                 C 215 100, 225 110, 245 110
                 C 255 110, 265 105, 270 95
                 L 255 90
                 C 252 95, 248 98, 245 98
                 C 235 98, 230 90, 230 80
                 C 230 70, 235 62, 245 62
                 C 248 62, 252 65, 255 70
                 L 270 65
                 C 265 55, 255 50, 245 50
                 Z" 
              fill="url(#blueGradient)" filter="url(#shadow)"/>
        
        {/* Elemento tecnológico - Puntos conectados */}
        <g opacity="0.4">
          <circle cx="300" cy="50" r="2" fill="url(#orangeGradient)"/>
          <circle cx="310" cy="45" r="2" fill="url(#orangeGradient)"/>
          <circle cx="320" cy="55" r="2" fill="url(#orangeGradient)"/>
          <line x1="300" y1="50" x2="310" y2="45" stroke="url(#orangeGradient)" strokeWidth="1"/>
          <line x1="310" y1="45" x2="320" y2="55" stroke="url(#orangeGradient)" strokeWidth="1"/>
          
          <circle cx="300" cy="100" r="2" fill="url(#blueGradient)"/>
          <circle cx="310" cy="105" r="2" fill="url(#blueGradient)"/>
          <circle cx="320" cy="95" r="2" fill="url(#blueGradient)"/>
          <line x1="300" y1="100" x2="310" y2="105" stroke="url(#blueGradient)" strokeWidth="1"/>
          <line x1="310" y1="105" x2="320" y2="95" stroke="url(#blueGradient)" strokeWidth="1"/>
        </g>
      </svg>
    </div>
  );
};

export default Logo;