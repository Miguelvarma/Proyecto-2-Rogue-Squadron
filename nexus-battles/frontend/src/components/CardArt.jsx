// CardArt.jsx — Arte SVG animado para las 32 cartas de Nexus Battles V

export default function CardArt({ productId, height = 160 }) {
  const Art = ART[productId] || ArtDefault;
  return (
    <svg viewBox="0 0 300 160" width="100%" height={height}
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <Art />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HÉROES
// ─────────────────────────────────────────────────────────────────────────────

function Art_p001() { // Shadowblade — espada sombría con humo violeta
  return <g>
    <defs>
      <radialGradient id="g001" cx="50%" cy="65%" r="75%">
        <stop offset="0%" stopColor="#1a0035" /><stop offset="100%" stopColor="#04000a" />
      </radialGradient>
      <linearGradient id="g001b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#4400aa" /><stop offset="50%" stopColor="#ddbbff" /><stop offset="100%" stopColor="#3300aa" />
      </linearGradient>
      <filter id="f001"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>
    <rect width="300" height="160" fill="url(#g001)" />
    {/* Aura sombría */}
    <ellipse cx="150" cy="95" rx="55" ry="38" fill="#5500bb" opacity="0.3"
      className="ca" style={{ animation: 'ca-pulse 2.8s ease-in-out infinite' }} />
    {/* Humo / sombras flotantes */}
    {[{cx:110,cy:105,r:18,d:'2.1s',dl:'0s'},{cx:190,cy:90,r:14,d:'2.5s',dl:'0.7s'},{cx:130,cy:75,r:10,d:'1.9s',dl:'1.2s'},{cx:170,cy:115,r:8,d:'2.3s',dl:'0.3s'}].map((p,i)=>
      <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.r} ry={p.r*0.6} fill="#8800ff" opacity="0.18"
        className="ca" style={{ animation:`ca-float ${p.d} ease-in-out infinite`, animationDelay:p.dl }} />
    )}
    {/* Blade */}
    <path d="M148,130 L145,48 L150,20 L155,48 L152,130" fill="url(#g001b)" />
    {/* Crossguard */}
    <rect x="133" y="50" width="34" height="8" rx="2" fill="#5522bb" />
    {/* Handle */}
    <rect x="147" y="58" width="6" height="32" rx="1" fill="#220033" />
    {/* Gleam sweep */}
    <rect x="148" y="20" width="4" height="110" fill="white" opacity="0.12"
      className="ca" style={{ animation: 'ca-shimmer 3.5s ease-in-out infinite 1.5s' }} />
    {/* Tip glow */}
    <circle cx="150" cy="23" r="7" fill="#cc55ff" opacity="0.9"
      className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite' }} />
  </g>;
}

function Art_p002() { // Guardián de Hierro — escudo metálico con brillo
  return <g>
    <defs>
      <radialGradient id="g002" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#0d1a2e" /><stop offset="100%" stopColor="#020508" />
      </radialGradient>
      <linearGradient id="g002b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a0b8d0" /><stop offset="40%" stopColor="#5580aa" /><stop offset="100%" stopColor="#1a3050" />
      </linearGradient>
      <linearGradient id="g002s" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="white" stopOpacity="0.5" /><stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g002)" />
    {/* Brillo de fondo */}
    <ellipse cx="150" cy="80" rx="65" ry="48" fill="#2255aa" opacity="0.15"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    {/* Escudo */}
    <path d="M150,25 L205,50 L205,105 L150,138 L95,105 L95,50 Z" fill="url(#g002b)" />
    {/* Cruz interior */}
    <rect x="144" y="38" width="12" height="90" rx="2" fill="#1a3a60" opacity="0.6" />
    <rect x="107" y="74" width="86" height="12" rx="2" fill="#1a3a60" opacity="0.6" />
    {/* Borde del escudo */}
    <path d="M150,25 L205,50 L205,105 L150,138 L95,105 L95,50 Z" fill="none" stroke="#88bbee" strokeWidth="2" />
    {/* Sweep de brillo */}
    <rect x="90" y="25" width="10" height="115" fill="url(#g002s)"
      className="ca" style={{ animation: 'ca-shimmer 4s ease-in-out infinite 0.8s' }} />
    {/* Remaches */}
    {[[150,28],[195,52],[195,103],[150,135],[105,103],[105,52]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="4" fill="#88aacc" stroke="#aaccff" strokeWidth="1" />
    )}
  </g>;
}

function Art_p003() { // Arquera Tormentosa — flecha + tormenta eléctrica
  return <g>
    <defs>
      <radialGradient id="g003" cx="50%" cy="40%" r="80%">
        <stop offset="0%" stopColor="#0a1525" /><stop offset="100%" stopColor="#020508" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g003)" />
    {/* Nubes de tormenta */}
    {[[80,35,50,22],[150,25,60,20],[230,40,45,18]].map(([cx,cy,rx,ry],i)=>
      <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#1e3050" opacity="0.7" />
    )}
    {/* Relámpago principal */}
    <path d="M168,18 L132,78 L158,78 L124,142 L186,68 L158,68 Z"
      fill="#ffe044" stroke="#fff" strokeWidth="0.5"
      className="ca" style={{ animation: 'ca-flash 2.4s ease-in-out infinite' }} />
    {/* Relámpago secundario */}
    <path d="M220,10 L205,45 L215,45 L198,80 L228,38 L215,38 Z"
      fill="#aaddff" opacity="0.6"
      className="ca" style={{ animation: 'ca-flash 2.4s ease-in-out infinite 0.8s' }} />
    {/* Flecha volando */}
    <g className="ca" style={{ animation: 'ca-float 2s ease-in-out infinite' }}>
      <line x1="55" y1="95" x2="235" y2="75" stroke="#c8a050" strokeWidth="3" />
      <polygon points="235,75 218,68 222,80" fill="#e8b860" />
      <line x1="58" y1="93" x2="72" y2="90" stroke="#885500" strokeWidth="4" />
      <line x1="58" y1="97" x2="72" y2="94" stroke="#885500" strokeWidth="4" />
    </g>
    {/* Arco */}
    <path d="M58,68 C40,85 40,105 58,122" fill="none" stroke="#775522" strokeWidth="4" strokeLinecap="round" />
    <line x1="58" y1="68" x2="58" y2="122" stroke="#553311" strokeWidth="2" strokeDasharray="3 3" />
    {/* Flash de luz */}
    <circle cx="150" cy="80" r="20" fill="#ffe044" opacity="0.05"
      className="ca" style={{ animation: 'ca-glow 2.4s ease-in-out infinite' }} />
  </g>;
}

function Art_p004() { // Mago del Vacío — portal espiral con estrellas orbitando
  return <g>
    <defs>
      <radialGradient id="g004" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a0050" /><stop offset="60%" stopColor="#08002a" /><stop offset="100%" stopColor="#000008" />
      </radialGradient>
      <radialGradient id="g004p" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" /><stop offset="70%" stopColor="#220088" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g004)" />
    {/* Estrellas */}
    {[[40,20],[80,35],[200,15],[260,45],[30,120],[270,110],[90,145],[220,140]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="1.5" fill="white"
        className="ca" style={{ animation:`ca-blink ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
    )}
    {/* Portal exterior */}
    {[60,50,40,30,20].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none"
        stroke={i%2===0?"#6633ff":"#4400cc"} strokeWidth={i===0?2:1}
        opacity={0.3+i*0.1}
        className="ca" style={{ animation:`${i%2===0?'ca-rotate':'ca-rotateR'} ${6+i*2}s linear infinite` }} />
    )}
    {/* Portal centro */}
    <circle cx="150" cy="80" r="15" fill="url(#g004p)"
      className="ca" style={{ animation: 'ca-spinZ 4s ease-in-out infinite' }} />
    {/* Espiral en el portal */}
    <path d="M150,65 C160,68 165,78 158,88 C151,98 138,96 134,86 C130,76 138,65 150,65"
      fill="none" stroke="#9966ff" strokeWidth="2"
      className="ca" style={{ animation: 'ca-rotate 3s linear infinite' }} />
    {/* Partículas orbitando */}
    {[{d:'0s',c:'#bb88ff'},{d:'1.5s',c:'#6644ff'},{d:'3s',c:'#cc44ff'}].map((p,i)=>
      <circle key={i} cx="150" cy="80" r="3" fill={p.c}
        className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-orbit 3s linear infinite`, animationDelay:p.d }} />
    )}
  </g>;
}

function Art_p005() { // Druida Ancestral — árbol con hojas flotantes
  return <g>
    <defs>
      <radialGradient id="g005" cx="50%" cy="80%" r="70%">
        <stop offset="0%" stopColor="#062010" /><stop offset="100%" stopColor="#010805" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g005)" />
    {/* Tronco */}
    <rect x="143" y="90" width="14" height="65" rx="4" fill="#4a2c10" />
    {/* Copas del árbol (capas) */}
    {[[150,90,55],[150,72,45],[150,55,36],[150,40,26]].map(([cx,cy,r],i)=>
      <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r*0.7}
        fill={`hsl(${120+i*8},${55+i*5}%,${18+i*3}%)`} opacity="0.95" />
    )}
    {/* Brillo del árbol */}
    <ellipse cx="150" cy="65" rx="35" ry="30" fill="#22aa44" opacity="0.12"
      className="ca" style={{ animation: 'ca-pulse 3.5s ease-in-out infinite' }} />
    {/* Raíces */}
    <path d="M143,152 C135,145 125,148 115,155" fill="none" stroke="#3a2008" strokeWidth="3" strokeLinecap="round" />
    <path d="M157,152 C165,145 175,148 185,155" fill="none" stroke="#3a2008" strokeWidth="3" strokeLinecap="round" />
    {/* Hojas flotantes */}
    {[{x:120,y:90,d:'0s',t:'ca-leaf'},{x:175,y:75,d:'0.8s',t:'ca-leaf2'},{x:108,y:65,d:'1.6s',t:'ca-leaf'},{x:188,y:95,d:'2.4s',t:'ca-leaf2'},{x:140,y:55,d:'3.2s',t:'ca-leaf'}].map((l,i)=>
      <ellipse key={i} cx={l.x} cy={l.y} rx="6" ry="3" fill="#33cc55" opacity="0.85"
        className="ca" style={{ animation:`${l.t} 3.5s ease-in infinite`, animationDelay:l.d }} />
    )}
  </g>;
}

function Art_p006() { // Paladín de la Luz — cruz radiante con rayos girando
  return <g>
    <defs>
      <radialGradient id="g006" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#2a2200" /><stop offset="60%" stopColor="#0d0a00" /><stop offset="100%" stopColor="#040300" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g006)" />
    {/* Halo giratorio */}
    <g className="ca" style={{ transformOrigin:'150px 80px', animation: 'ca-rotate 12s linear infinite' }}>
      {Array.from({length:8},(_,i)=>i*45).map(a=>
        <line key={a}
          x1={150+Math.cos(a*Math.PI/180)*28} y1={80+Math.sin(a*Math.PI/180)*28}
          x2={150+Math.cos(a*Math.PI/180)*70} y2={80+Math.sin(a*Math.PI/180)*70}
          stroke="#ffe066" strokeWidth="2" opacity="0.4"
          className="ca" style={{ animation:`ca-ray 2s ease-in-out infinite`, animationDelay:`${a/360*2}s` }} />
      )}
    </g>
    {/* Aura dorada */}
    <circle cx="150" cy="80" r="42" fill="#ffcc00" opacity="0.08"
      className="ca" style={{ animation: 'ca-pulse 2.5s ease-in-out infinite' }} />
    {/* Cruz */}
    <rect x="140" y="32" width="20" height="96" rx="4" fill="#ffe066" />
    <rect x="105" y="67" width="90" height="20" rx="4" fill="#ffe066" />
    {/* Cruz interior (vacío) */}
    <rect x="143" y="35" width="14" height="90" rx="3" fill="#fff8d0" opacity="0.6" />
    <rect x="108" y="70" width="84" height="14" rx="3" fill="#fff8d0" opacity="0.6" />
    {/* Glow central */}
    <circle cx="150" cy="77" r="14" fill="white" opacity="0.3"
      className="ca" style={{ animation: 'ca-glow2 1.8s ease-in-out infinite' }} />
  </g>;
}

function Art_p007() { // Berserker Salvaje — hacha con sangre y aura roja
  return <g>
    <defs>
      <radialGradient id="g007" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#2a0000" /><stop offset="100%" stopColor="#080000" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g007)" />
    {/* Aura de rabia */}
    <ellipse cx="150" cy="85" rx="65" ry="50" fill="#cc0000" opacity="0.12"
      className="ca" style={{ animation: 'ca-shake 0.4s ease-in-out infinite' }} />
    {/* Mango */}
    <rect x="147" y="70" width="8" height="80" rx="3" fill="#552200" />
    {/* Hoja del hacha */}
    <path d="M155,35 C185,28 200,50 195,75 C190,100 168,105 155,95 L155,35 Z" fill="#cc3300" />
    <path d="M155,35 C125,28 110,50 115,75 C120,100 142,105 155,95 L155,35 Z" fill="#aa2200" />
    {/* Filo */}
    <path d="M195,75 C198,85 185,110 155,95" fill="none" stroke="#ff6644" strokeWidth="2" />
    {/* Sangre */}
    {[{x:195,y:75},{x:175,y:108},{x:155,y:95}].map((p,i)=>
      <rect key={i} x={p.x-2} y={p.y} width="4" height="22" rx="2" fill="#cc0000"
        className="ca" style={{ transformOrigin:`${p.x}px ${p.y}px`, animation:`ca-drip 2s ease-in-out infinite`, animationDelay:`${i*0.6}s` }} />
    )}
    {/* Vibración del hacha */}
    <path d="M155,35 C185,28 200,50 195,75 C190,100 168,105 155,95 L155,35 Z" fill="none"
      stroke="#ff4422" strokeWidth="1.5" opacity="0.5"
      className="ca" style={{ animation: 'ca-shake 0.4s ease-in-out infinite' }} />
  </g>;
}

function Art_p008() { // Exploradora Élfica — silueta en bosque oscuro con estrellas
  return <g>
    <defs>
      <radialGradient id="g008" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#010a04" /><stop offset="100%" stopColor="#000200" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g008)" />
    {/* Árboles de fondo */}
    {[[60,160,16],[100,160,12],[200,160,14],[240,160,10],[280,160,8]].map(([x,y,w],i)=>
      <path key={i} d={`M${x},${y} L${x-w},100 L${x-w*0.5},100 L${x-w*0.5},60 L${x+w*0.5},60 L${x+w*0.5},100 L${x+w},100 Z`}
        fill={`#0${i*1+1}1500`} opacity="0.9" />
    )}
    {/* Silueta élfica */}
    <ellipse cx="150" cy="60" rx="14" ry="16" fill="#0a1a0a" />{/* cabeza */}
    <path d="M136,75 C130,100 128,130 130,155 L170,155 C172,130 170,100 164,75 Z" fill="#071007" />{/* cuerpo */}
    {/* Capa */}
    <path d="M136,78 C120,100 115,130 120,155 L130,155 C128,130 130,100 136,78 Z" fill="#092209" opacity="0.8" />
    <path d="M164,78 C180,100 185,130 180,155 L170,155 C172,130 170,100 164,78 Z" fill="#092209" opacity="0.8" />
    {/* Orejas élfica */}
    <ellipse cx="137" cy="58" rx="5" ry="3" fill="#0a1a0a" transform="rotate(-30,137,58)" />
    <ellipse cx="163" cy="58" rx="5" ry="3" fill="#0a1a0a" transform="rotate(30,163,58)" />
    {/* Estrellas titilando */}
    {[[40,25],[90,15],[210,20],[260,30],[30,70],[270,65]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2" fill="#aaffcc"
        className="ca" style={{ animation:`ca-blink ${1.2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
    {/* Ojos brillantes */}
    <circle cx="145" cy="59" r="2" fill="#44ff88"
      className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite' }} />
    <circle cx="155" cy="59" r="2" fill="#44ff88"
      className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite 0.3s' }} />
  </g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HECHIZOS
// ─────────────────────────────────────────────────────────────────────────────

function Art_p009() { // Bola de Fuego — fireball pulsante con llamas
  return <g>
    <defs>
      <radialGradient id="g009" cx="50%" cy="60%" r="80%">
        <stop offset="0%" stopColor="#2a0a00" /><stop offset="100%" stopColor="#060100" />
      </radialGradient>
      <radialGradient id="g009b" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffaaa" /><stop offset="30%" stopColor="#ffaa00" /><stop offset="70%" stopColor="#ff4400" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g009)" />
    {/* Resplandor de fondo */}
    <circle cx="150" cy="80" r="65" fill="#ff4400" opacity="0.08"
      className="ca" style={{ animation: 'ca-pulse 1.8s ease-in-out infinite' }} />
    {/* Llamas exteriores */}
    {[{x:150,y:30,rx:18,ry:30,d:'0s'},{x:120,y:55,rx:12,ry:22,d:'0.4s'},{x:180,y:55,rx:12,ry:22,d:'0.8s'},{x:110,y:80,rx:10,ry:18,d:'0.2s'},{x:190,y:80,rx:10,ry:18,d:'0.6s'}].map((f,i)=>
      <ellipse key={i} cx={f.x} cy={f.y} rx={f.rx} ry={f.ry} fill="#ff6600" opacity="0.5"
        className="ca" style={{ animation:`ca-wave 1.2s ease-in-out infinite`, animationDelay:f.d }} />
    )}
    {/* Bola central */}
    <circle cx="150" cy="80" r="38" fill="url(#g009b)"
      className="ca" style={{ animation: 'ca-beat 1.5s ease-in-out infinite' }} />
    {/* Núcleo */}
    <circle cx="150" cy="80" r="16" fill="#ffffaa" opacity="0.9"
      className="ca" style={{ animation: 'ca-glow2 1s ease-in-out infinite' }} />
    {/* Chispas */}
    {[[110,42],[185,45],[105,100],[195,100],[148,35]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2.5" fill="#ffcc00" opacity="0.8"
        className="ca" style={{ animation:`ca-float ${0.8+i*0.15}s ease-in-out infinite`, animationDelay:`${i*0.25}s` }} />
    )}
  </g>;
}

function Art_p010() { // Nova de Hielo — cristal de nieve expandiéndose
  return <g>
    <defs>
      <radialGradient id="g010" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#001830" /><stop offset="100%" stopColor="#000408" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g010)" />
    {/* Anillos de hielo expandiéndose */}
    {[35,50,65].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none" stroke="#88ddff" strokeWidth="1.5"
        opacity={0.6-i*0.15}
        className="ca" style={{ animation:`ca-pulse ${2+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
    )}
    {/* Copos de nieve — 6 brazos */}
    {Array.from({length:6},(_,i)=>i*60).map(angle=>{
      const rad = angle*Math.PI/180;
      const x2 = 150+Math.cos(rad)*50, y2 = 80+Math.sin(rad)*50;
      const xm1 = 150+Math.cos(rad)*25+Math.cos((angle+60)*Math.PI/180)*14;
      const ym1 = 80+Math.sin(rad)*25+Math.sin((angle+60)*Math.PI/180)*14;
      const xm2 = 150+Math.cos(rad)*25+Math.cos((angle-60)*Math.PI/180)*14;
      const ym2 = 80+Math.sin(rad)*25+Math.sin((angle-60)*Math.PI/180)*14;
      return <g key={angle} className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-rotate ${20}s linear infinite` }}>
        <line x1="150" y1="80" x2={x2} y2={y2} stroke="#aaeeff" strokeWidth="2" />
        <line x1={150+Math.cos(rad)*25} y1={80+Math.sin(rad)*25} x2={xm1} y2={ym1} stroke="#aaeeff" strokeWidth="1.5" />
        <line x1={150+Math.cos(rad)*25} y1={80+Math.sin(rad)*25} x2={xm2} y2={ym2} stroke="#aaeeff" strokeWidth="1.5" />
      </g>;
    })}
    {/* Núcleo */}
    <circle cx="150" cy="80" r="10" fill="#cceeff" opacity="0.9"
      className="ca" style={{ animation: 'ca-glow2 2s ease-in-out infinite' }} />
    {/* Partículas de hielo */}
    {[[100,40],[200,45],[85,110],[215,115],[135,35]].map(([x,y],i)=>
      <polygon key={i} points={`${x},${y-5} ${x+3},${y+3} ${x-3},${y+3}`} fill="#88ddff" opacity="0.7"
        className="ca" style={{ animation:`ca-float ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
    )}
  </g>;
}

function Art_p011() { // Rayo de Tormenta — rayo parpadeante en tormenta
  return <g>
    <defs>
      <radialGradient id="g011" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#1a1a30" /><stop offset="100%" stopColor="#030308" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g011)" />
    {/* Nubes */}
    {[[70,30,55,22],[160,20,70,24],[250,35,50,20]].map(([cx,cy,rx,ry],i)=>
      <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#1e2240" opacity="0.9" />
    )}
    {/* Flash de fondo */}
    <rect width="300" height="160" fill="#ffffaa" opacity="0"
      className="ca" style={{ animation: 'ca-flash 2s ease-in-out infinite 0.1s' }} />
    {/* Rayo principal */}
    <path d="M168,16 L133,78 L160,78 L122,144 L188,66 L158,66 Z"
      fill="#fffaaa" stroke="white" strokeWidth="0.5"
      className="ca" style={{ animation: 'ca-flash 2s ease-in-out infinite' }} />
    {/* Aura del rayo */}
    <path d="M168,16 L133,78 L160,78 L122,144 L188,66 L158,66 Z"
      fill="none" stroke="#aaccff" strokeWidth="6" opacity="0.3"
      className="ca" style={{ animation: 'ca-flash 2s ease-in-out infinite' }} />
    {/* Rayos secundarios */}
    <path d="M100,18 L88,50 L98,50 L82,82 L110,44 L98,44 Z"
      fill="#aaaaff" opacity="0.5"
      className="ca" style={{ animation: 'ca-flash 2s ease-in-out infinite 1.1s' }} />
    <path d="M220,25 L212,55 L220,55 L208,85 L228,50 L218,50 Z"
      fill="#aaaaff" opacity="0.4"
      className="ca" style={{ animation: 'ca-flash 2s ease-in-out infinite 1.6s' }} />
  </g>;
}

function Art_p012() { // Toque Sanador — cruz verde con ondas de sanación
  return <g>
    <defs>
      <radialGradient id="g012" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#002212" /><stop offset="100%" stopColor="#000503" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g012)" />
    {/* Ondas de sanación expandiéndose */}
    {[25,42,60,78].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none" stroke="#44ee88" strokeWidth="1.5"
        opacity={0.8-i*0.18}
        className="ca" style={{ animation:`ca-pulse ${2.5+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
    {/* Cruz de sanación */}
    <rect x="137" y="35" width="26" height="90" rx="6" fill="#22cc55" />
    <rect x="105" y="67" width="90" height="26" rx="6" fill="#22cc55" />
    {/* Brillo interior */}
    <rect x="140" y="38" width="20" height="84" rx="5" fill="#88ffaa" opacity="0.5" />
    <rect x="108" y="70" width="84" height="20" rx="5" fill="#88ffaa" opacity="0.5" />
    {/* Centro brillante */}
    <circle cx="150" cy="80" r="18" fill="#aaffcc" opacity="0.4"
      className="ca" style={{ animation: 'ca-pulse 1.5s ease-in-out infinite' }} />
    {/* Partículas sanadoras */}
    {[[115,50],[185,55],[108,110],[192,108],[150,38]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="3" fill="#44ff88"
        className="ca" style={{ animation:`ca-rise ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
  </g>;
}

function Art_p013() { // Vacío Sombrío — vórtice negro drenando todo
  return <g>
    <defs>
      <radialGradient id="g013" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#000000" /><stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="g013v" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" /><stop offset="50%" stopColor="#330066" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g013)" />
    {/* Vórtice exterior */}
    {[75,60,45,30,18].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none"
        stroke={`hsl(${270+i*10},80%,${15+i*5}%)`} strokeWidth="1.5"
        className="ca" style={{ animation:`${i%2?'ca-rotate':'ca-rotateR'} ${4+i*1.5}s linear infinite` }} />
    )}
    {/* Espirales del vórtice */}
    {[0,120,240].map(offset=>
      <path key={offset} d={`M150,80 C${150+30*Math.cos(offset*Math.PI/180)},${80+30*Math.sin(offset*Math.PI/180)} ${150+60*Math.cos((offset+60)*Math.PI/180)},${80+60*Math.sin((offset+60)*Math.PI/180)} ${150+75*Math.cos((offset+120)*Math.PI/180)},${80+75*Math.sin((offset+120)*Math.PI/180)}`}
        fill="none" stroke="#6600aa" strokeWidth="2" opacity="0.6"
        className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-rotate 5s linear infinite`, animationDelay:`${offset/120}s` }} />
    )}
    {/* Núcleo negro absoluto */}
    <circle cx="150" cy="80" r="14" fill="black" />
    <circle cx="150" cy="80" r="8" fill="#000" stroke="#4400aa" strokeWidth="1"
      className="ca" style={{ animation: 'ca-pulse 2s ease-in-out infinite' }} />
    {/* Partículas siendo drenadas */}
    {[[100,50],[200,55],[90,115],[210,110]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2.5" fill="#9933ff" opacity="0.7"
        className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-orbit ${3+i*0.8}s linear infinite`, animationDelay:`${i*0.7}s` }} />
    )}
  </g>;
}

function Art_p014() { // Escudo Arcano — hexágono mágico con runas
  return <g>
    <defs>
      <radialGradient id="g014" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#001535" /><stop offset="100%" stopColor="#000308" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g014)" />
    {/* Hexágono exterior */}
    <polygon points="150,22 197,47 197,113 150,138 103,113 103,47"
      fill="none" stroke="#4488ff" strokeWidth="2"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    {/* Hexágono interior */}
    <polygon points="150,38 183,55 183,105 150,122 117,105 117,55"
      fill="#0a1a40" stroke="#2266cc" strokeWidth="1.5" />
    {/* Runas parpadeantes */}
    {[[150,58,'✦'],[130,82,'⬡'],[170,82,'✦'],[150,106,'⬡']].map(([x,y,sym],i)=>
      <text key={i} x={x} y={y} textAnchor="middle" fill="#44aaff" fontSize="14" opacity="0.8"
        className="ca" style={{ animation:`ca-rune 2s ease-in-out infinite`, animationDelay:`${i*0.5}s` }}>
        {sym}
      </text>
    )}
    {/* Aura del escudo */}
    <polygon points="150,22 197,47 197,113 150,138 103,113 103,47"
      fill="#2255bb" opacity="0.1"
      className="ca" style={{ animation: 'ca-glow 2.5s ease-in-out infinite' }} />
    {/* Nodo central */}
    <circle cx="150" cy="80" r="12" fill="#1133aa" stroke="#4488ff" strokeWidth="1.5"
      className="ca" style={{ animation: 'ca-beat 2s ease-in-out infinite' }} />
    <circle cx="150" cy="80" r="6" fill="#88ccff" opacity="0.8" />
  </g>;
}

function Art_p015() { // Tormenta de Arena — partículas de arena orbitando
  return <g>
    <defs>
      <radialGradient id="g015" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a1200" /><stop offset="100%" stopColor="#050300" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g015)" />
    {/* Torbellino de arena */}
    {[68,52,38,24].map((r,i)=>
      <ellipse key={i} cx="150" cy="80" rx={r} ry={r*0.5} fill="none"
        stroke={`hsl(38,${70-i*10}%,${35+i*8}%)`} strokeWidth="1.5"
        className="ca" style={{ animation:`${i%2?'ca-rotate':'ca-rotateR'} ${3+i}s linear infinite` }} />
    )}
    {/* Partículas de arena */}
    {Array.from({length:14},(_,i)=>{
      const angle = i*360/14;
      const r = 30+Math.random()*30;
      return <circle key={i}
        cx={150+Math.cos(angle*Math.PI/180)*r}
        cy={80+Math.sin(angle*Math.PI/180)*r*0.5}
        r={1.5+Math.random()*2} fill="#cc9922" opacity="0.7"
        className="ca"
        style={{ transformOrigin:'150px 80px', animation:`ca-rotate ${2+i*0.3}s linear infinite`, animationDelay:`${i*0.2}s` }} />;
    })}
    {/* Ojo del torbellino */}
    <ellipse cx="150" cy="80" rx="14" ry="8" fill="#221800" stroke="#aa7700" strokeWidth="1.5" />
    {/* Líneas de viento */}
    {[[50,55,100,52],[200,60,250,57],[40,110,90,108],[210,105,260,108]].map(([x1,y1,x2,y2],i)=>
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cc9922" strokeWidth="1.5" opacity="0.4"
        className="ca" style={{ animation:`ca-drift ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
    )}
  </g>;
}

function Art_p016() { // Meteorito Cósmico — meteoro cayendo con estela
  return <g>
    <defs>
      <radialGradient id="g016" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#000010" /><stop offset="100%" stopColor="#000005" />
      </radialGradient>
      <linearGradient id="g016t" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff6600" stopOpacity="0" /><stop offset="100%" stopColor="#ff6600" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g016)" />
    {/* Estrellas */}
    {[[20,15],[60,40],[100,10],[200,25],[250,10],[280,50],[30,80],[280,90],[250,140],[30,140]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r={1+i%2} fill="white"
        className="ca" style={{ animation:`ca-blink ${1.5+i*0.2}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
    )}
    {/* Estela del meteoro */}
    <line x1="80" y1="20" x2="210" y2="138" stroke="url(#g016t)" strokeWidth="12" strokeLinecap="round" opacity="0.4"
      className="ca" style={{ animation: 'ca-glow 1.5s ease-in-out infinite' }} />
    {/* Meteoro principal */}
    <g className="ca" style={{ animation: 'ca-meteor 3s ease-in-out infinite' }}>
      <circle cx="90" cy="30" r="18" fill="#ff6600" />
      <circle cx="90" cy="30" r="12" fill="#ffaa00" />
      <circle cx="90" cy="30" r="6" fill="#ffffaa" />
    </g>
    {/* Impacto glow */}
    <circle cx="210" cy="140" r="20" fill="#ff4400" opacity="0.15"
      className="ca" style={{ animation: 'ca-pulse 1.5s ease-in-out infinite' }} />
  </g>;
}

function Art_p017() { // Maldición Ancestral — calavera con runas de maldición
  return <g>
    <defs>
      <radialGradient id="g017" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#180028" /><stop offset="100%" stopColor="#040005" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g017)" />
    {/* Aura de maldición */}
    <circle cx="150" cy="75" r="55" fill="#6600aa" opacity="0.1"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    {/* Calavera */}
    <ellipse cx="150" cy="68" rx="32" ry="30" fill="#220033" stroke="#8800cc" strokeWidth="1.5" />{/* Cráneo */}
    <rect x="130" y="88" width="40" height="22" rx="4" fill="#1a0028" stroke="#8800cc" strokeWidth="1" />{/* Mandíbula */}
    {/* Dientes */}
    {[133,141,149,157,165].map((x,i)=>
      <rect key={i} x={x} y="94" width="5" height="12" rx="1" fill="#220033" />
    )}
    {/* Ojos */}
    <ellipse cx="138" cy="65" rx="10" ry="12" fill="#9900ff" className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite' }} />
    <ellipse cx="162" cy="65" rx="10" ry="12" fill="#9900ff" className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite 0.5s' }} />
    {/* Fosas nasales */}
    <path d="M146,78 L150,73 L154,78 Z" fill="#440066" />
    {/* Runas de maldición */}
    {[[80,30,'⚝'],[220,35,'⚝'],[70,115,'✶'],[230,120,'✶'],[150,145,'⚛']].map(([x,y,s],i)=>
      <text key={i} x={x} y={y} textAnchor="middle" fill="#aa44ff" fontSize="16"
        className="ca" style={{ animation:`ca-blink ${1.8+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.6}s` }}>
        {s}
      </text>
    )}
  </g>;
}

function Art_p018() { // Resurrección — figura ascendiendo con luz dorada
  return <g>
    <defs>
      <radialGradient id="g018" cx="50%" cy="60%" r="80%">
        <stop offset="0%" stopColor="#1a1000" /><stop offset="100%" stopColor="#040300" />
      </radialGradient>
      <radialGradient id="g018b" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#ffcc00" stopOpacity="0.4" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g018)" />
    <rect width="300" height="160" fill="url(#g018b)" />
    {/* Rayos de luz desde el suelo */}
    {[[-30,0],[- 15,0],[0,0],[15,0],[30,0]].map(([offset],i)=>
      <path key={i} d={`M${150+offset},160 L${150+offset-20},20 L${150+offset+20},20 Z`}
        fill="#ffcc00" opacity="0.06"
        className="ca" style={{ animation:`ca-ray ${2+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.2}s` }} />
    )}
    {/* Figura ascendiendo */}
    <g className="ca" style={{ animation: 'ca-rise 3s ease-in-out infinite' }}>
      <ellipse cx="150" cy="72" rx="12" ry="13" fill="#ffe8aa" />{/* Cabeza */}
      <path d="M138,85 C132,105 130,125 132,145 L168,145 C170,125 168,105 162,85 Z" fill="#ffcc44" opacity="0.9" />{/* Cuerpo */}
      {/* Alas de luz */}
      <path d="M138,95 C115,80 100,95 105,118" fill="none" stroke="#ffe066" strokeWidth="2" opacity="0.7" />
      <path d="M162,95 C185,80 200,95 195,118" fill="none" stroke="#ffe066" strokeWidth="2" opacity="0.7" />
    </g>
    {/* Halo */}
    <ellipse cx="150" cy="60" rx="20" ry="6" fill="none" stroke="#ffee88" strokeWidth="2" opacity="0.6"
      className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite' }} />
    {/* Chispas ascendentes */}
    {[[130,130],[145,145],[160,135],[170,125]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2" fill="#ffcc00"
        className="ca" style={{ animation:`ca-bubble ${1.5+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
  </g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ÍTEMS
// ─────────────────────────────────────────────────────────────────────────────

function Art_p019() { // Escudo Escama de Dragón — escudo rojo/dorado con escamas
  return <g>
    <defs>
      <radialGradient id="g019" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#250500" /><stop offset="100%" stopColor="#060100" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g019)" />
    {/* Escamas patrón (hexágonos) */}
    {[[130,55],[150,55],[170,55],[120,70],[140,70],[160,70],[180,70],[130,85],[150,85],[170,85],[140,100],[160,100]].map(([cx,cy],i)=>
      <polygon key={i} points={`${cx},${cy-10} ${cx+9},${cy-5} ${cx+9},${cy+5} ${cx},${cy+10} ${cx-9},${cy+5} ${cx-9},${cy-5}`}
        fill={i%3===0?"#8b0000":i%3===1?"#aa1100":"#cc2200"} stroke="#ffaa00" strokeWidth="0.8"
        className="ca" style={{ animation:`ca-glow2 ${2+i*0.15}s ease-in-out infinite`, animationDelay:`${i*0.1}s` }} />
    )}
    {/* Marco del escudo */}
    <path d="M150,20 L210,48 L210,108 L150,142 L90,108 L90,48 Z" fill="none" stroke="#ff6600" strokeWidth="3"
      className="ca" style={{ animation: 'ca-glow 2.5s ease-in-out infinite' }} />
    {/* Garra de dragón central */}
    <path d="M145,70 L150,52 L155,70 M140,74 L150,58 L160,74 M135,80 L150,62 L165,80"
      fill="none" stroke="#ffaa00" strokeWidth="2" opacity="0.6" />
    {/* Brillo de fuego en el borde */}
    <path d="M150,20 L210,48 L210,108 L150,142 L90,108 L90,48 Z" fill="#ff4400" opacity="0.06"
      className="ca" style={{ animation: 'ca-pulse 1.8s ease-in-out infinite' }} />
  </g>;
}

function Art_p020() { // Arco Encantado — arco brillante con flecha encantada
  return <g>
    <defs>
      <radialGradient id="g020" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a0040" /><stop offset="100%" stopColor="#050008" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g020)" />
    {/* Arco */}
    <path d="M85,20 C55,60 55,100 85,140" fill="none" stroke="#8844ff" strokeWidth="5" strokeLinecap="round"
      className="ca" style={{ animation: 'ca-glow 2.5s ease-in-out infinite' }} />
    {/* Cuerda del arco */}
    <line x1="85" y1="20" x2="85" y2="140" stroke="#cc88ff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
    {/* Energía mágica en el arco */}
    {[0.25,0.5,0.75].map((t,i)=>{
      const y = 20+t*120;
      const x = 85-(1-Math.abs(t-0.5)*2)*18;
      return <circle key={i} cx={x} cy={y} r="4" fill="#cc55ff" opacity="0.7"
        className="ca" style={{ animation:`ca-glow ${1.2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />;
    })}
    {/* Flecha */}
    <line x1="90" y1="80" x2="240" y2="80" stroke="#ddaaff" strokeWidth="2.5" />
    <polygon points="240,80 222,72 222,88" fill="#ffaaff" />
    <line x1="90" y1="78" x2="104" y2="75" stroke="#884422" strokeWidth="3.5" />
    <line x1="90" y1="82" x2="104" y2="85" stroke="#884422" strokeWidth="3.5" />
    {/* Partículas encantadas */}
    {[[150,62],[180,70],[200,68],[170,92],[195,95]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2.5" fill="#cc66ff" opacity="0.8"
        className="ca" style={{ animation:`ca-float ${1.3+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }} />
    )}
  </g>;
}

function Art_p021() { // Espada de Acero — espada plateada con destello
  return <g>
    <defs>
      <radialGradient id="g021" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#101820" /><stop offset="100%" stopColor="#030508" />
      </radialGradient>
      <linearGradient id="g021b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#445566" /><stop offset="40%" stopColor="#ddeeff" /><stop offset="60%" stopColor="#ddeeff" /><stop offset="100%" stopColor="#334455" />
      </linearGradient>
      <linearGradient id="g021s" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="white" stopOpacity="0.9" /><stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g021)" />
    {/* Brillo de fondo */}
    <ellipse cx="150" cy="80" rx="50" ry="30" fill="#8899aa" opacity="0.08"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    {/* Hoja */}
    <path d="M148,130 L145,46 L150,18 L155,46 L152,130" fill="url(#g021b)" />
    {/* Guarda */}
    <rect x="130" y="48" width="40" height="10" rx="3" fill="#6688aa" />
    {/* Mango */}
    <rect x="146" y="58" width="8" height="36" rx="2" fill="#334455" />
    <rect x="147" y="60" width="6" height="34" rx="1" fill="#223344" />
    {/* Pomo */}
    <circle cx="150" cy="96" r="7" fill="#556677" stroke="#8899aa" strokeWidth="1" />
    {/* Destello que atraviesa la hoja */}
    <rect x="147" y="18" width="6" height="114" fill="url(#g021s)" opacity="0.6"
      className="ca" style={{ animation: 'ca-shimmer 3s ease-in-out infinite 0.5s' }} />
    {/* Chispas en la punta */}
    {[[145,18],[155,20],[148,22]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2" fill="white" opacity="0.8"
        className="ca" style={{ animation:`ca-blink ${0.8+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
    )}
  </g>;
}

function Art_p022() { // Amuleto del Nexus — gema con anillos de energía orbitando
  return <g>
    <defs>
      <radialGradient id="g022" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#0a0020" /><stop offset="100%" stopColor="#020008" />
      </radialGradient>
      <radialGradient id="g022g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#aaccff" /><stop offset="50%" stopColor="#4466ff" /><stop offset="100%" stopColor="#220088" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g022)" />
    {/* Anillos orbitando */}
    {[55,42,30].map((r,i)=>
      <ellipse key={i} cx="150" cy="80" rx={r} ry={r*0.4} fill="none"
        stroke={['#4466ff','#6644ff','#ff44cc'][i]} strokeWidth="1.5"
        className="ca" style={{ animation:`${i%2?'ca-rotate':'ca-rotateR'} ${4+i*2}s linear infinite` }} />
    )}
    {/* Gema central */}
    <polygon points="150,45 175,65 175,95 150,115 125,95 125,65" fill="url(#g022g)"
      className="ca" style={{ animation: 'ca-beat 2.5s ease-in-out infinite' }} />
    {/* Reflejo en la gema */}
    <polygon points="150,48 168,64 162,88 138,88 132,64" fill="white" opacity="0.1" />
    <polygon points="150,50 158,60 150,62 142,60" fill="white" opacity="0.3" />
    {/* Glow de la gema */}
    <polygon points="150,45 175,65 175,95 150,115 125,95 125,65" fill="#4466ff" opacity="0.15"
      className="ca" style={{ animation: 'ca-glow 2s ease-in-out infinite' }} />
    {/* Partículas orbitando */}
    {[{c:'#88aaff',d:'0s'},{c:'#ff88ee',d:'1.2s'},{c:'#88ffcc',d:'2.4s'}].map((p,i)=>
      <circle key={i} cx="150" cy="80" r="4" fill={p.c}
        className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-orbit 4s linear infinite`, animationDelay:p.d }} />
    )}
  </g>;
}

function Art_p023() { // Bastón del Sabio — báculo con orbe mágico y partículas
  return <g>
    <defs>
      <radialGradient id="g023" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#100030" /><stop offset="100%" stopColor="#030008" />
      </radialGradient>
      <radialGradient id="g023o" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" /><stop offset="40%" stopColor="#8855ff" /><stop offset="100%" stopColor="#330088" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g023)" />
    {/* Báculo */}
    <rect x="147" y="55" width="6" height="105" rx="3" fill="#553311" />
    <path d="M148,55 C140,35 135,22 150,15 C165,22 160,35 152,55 Z" fill="#7744aa" />
    {/* Orbe */}
    <circle cx="150" cy="38" r="22" fill="url(#g023o)"
      className="ca" style={{ animation: 'ca-beat 2.2s ease-in-out infinite' }} />
    <circle cx="150" cy="38" r="22" fill="none" stroke="#aa77ff" strokeWidth="1.5"
      className="ca" style={{ animation: 'ca-glow 2.2s ease-in-out infinite' }} />
    {/* Estrella en el orbe */}
    <text x="150" y="43" textAnchor="middle" fill="white" fontSize="18" opacity="0.8"
      className="ca" style={{ animation: 'ca-rotate 6s linear infinite', transformOrigin:'150px 38px' }}>
      ✦
    </text>
    {/* Anillos del orbe */}
    <ellipse cx="150" cy="38" rx="28" ry="8" fill="none" stroke="#cc88ff" strokeWidth="1"
      className="ca" style={{ animation: 'ca-rotateR 4s linear infinite' }} />
    {/* Partículas ascendentes */}
    {[[135,100],[145,115],[155,90],[165,108],[140,130]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2.5" fill="#aa66ff" opacity="0.8"
        className="ca" style={{ animation:`ca-bubble ${1.8+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
  </g>;
}

function Art_p024() { // Botas de Velocidad — bota con líneas de velocidad
  return <g>
    <defs>
      <radialGradient id="g024" cx="30%" cy="50%" r="80%">
        <stop offset="0%" stopColor="#1a0e00" /><stop offset="100%" stopColor="#050300" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g024)" />
    {/* Líneas de velocidad */}
    {[[20,55,120,53],[15,65,110,63],[25,75,115,74],[18,85,112,84],[22,95,118,94],[16,105,108,104]].map(([x1,y1,x2,y2],i)=>
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffaa00" strokeWidth="1.5"
        opacity={0.8-i*0.08}
        className="ca" style={{ animation:`ca-shimmer ${0.6+i*0.1}s linear infinite`, animationDelay:`${i*0.08}s` }} />
    )}
    {/* Bota */}
    <path d="M120,140 L120,75 C120,65 128,58 140,58 L165,58 C175,58 185,65 185,75 L185,110 L210,110 L210,140 Z"
      fill="#663300" stroke="#cc6600" strokeWidth="2" />
    {/* Caña de la bota */}
    <path d="M120,75 C120,65 128,58 140,58 L165,58 C175,58 185,65 185,75 L185,100 L120,100 Z"
      fill="#774400" />
    {/* Suela */}
    <rect x="115" y="136" width="100" height="10" rx="4" fill="#221100" />
    {/* Detalles */}
    <line x1="122" y1="90" x2="183" y2="90" stroke="#cc6600" strokeWidth="1.5" opacity="0.6" />
    <line x1="140" y1="58" x2="140" y2="100" stroke="#cc6600" strokeWidth="1" opacity="0.5" />
    {/* Aura de velocidad */}
    <ellipse cx="152" cy="115" rx="45" ry="12" fill="#ff8800" opacity="0.08"
      className="ca" style={{ animation: 'ca-pulse 1.2s ease-in-out infinite' }} />
    {/* Energía en los pies */}
    {[[130,140],[155,140],[180,140]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="3" fill="#ffaa00" opacity="0.6"
        className="ca" style={{ animation:`ca-drift ${0.8+i*0.2}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
    )}
  </g>;
}

function Art_p025() { // Corona del Rey Sombrío — corona oscura con energía sombría
  return <g>
    <defs>
      <radialGradient id="g025" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#180025" /><stop offset="100%" stopColor="#030005" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g025)" />
    {/* Tentáculos sombríos */}
    {[[-50,-30],[0,-40],[50,-30]].map(([ox,oy],i)=>
      <path key={i} d={`M${150+ox},${130} C${150+ox+10},${100+oy} ${150+ox-10},${80+oy} ${150+ox+5},${60+oy}`}
        fill="none" stroke="#6600aa" strokeWidth="2" opacity="0.6"
        className="ca" style={{ animation:`ca-tentacle 2.5s ease-in-out infinite`, animationDelay:`${i*0.8}s` }} />
    )}
    {/* Corona */}
    <path d="M100,100 L100,65 L120,82 L140,50 L150,70 L160,50 L180,82 L200,65 L200,100 Z"
      fill="#1a0030" stroke="#9900ff" strokeWidth="2" />
    {/* Gemas en la corona */}
    {[[120,68,'#ff0044'],[150,56,'#aa00ff'],[180,68,'#0044ff']].map(([x,y,c],i)=>
      <circle key={i} cx={x} cy={y} r="7" fill={c}
        className="ca" style={{ animation:`ca-glow ${2+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.6}s` }} />
    )}
    {/* Aura de sombra */}
    <path d="M100,100 L100,65 L120,82 L140,50 L150,70 L160,50 L180,82 L200,65 L200,100 Z"
      fill="#6600cc" opacity="0.1"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    {/* Brillo dorado en el borde */}
    <path d="M100,100 L200,100" stroke="#aa8800" strokeWidth="3" />
    {/* Partículas sombras */}
    {[[120,110],[150,115],[180,110],[105,85],[195,85]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="2.5" fill="#8800cc" opacity="0.7"
        className="ca" style={{ animation:`ca-float ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
  </g>;
}

function Art_p026() { // Poción de Fuerza — frasco rojo con burbujas subiendo
  return <g>
    <defs>
      <radialGradient id="g026" cx="50%" cy="60%" r="70%">
        <stop offset="0%" stopColor="#200000" /><stop offset="100%" stopColor="#060000" />
      </radialGradient>
      <radialGradient id="g026l" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ff4444" stopOpacity="0.6" /><stop offset="100%" stopColor="#880000" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g026)" />
    {/* Resplandor de fondo */}
    <circle cx="150" cy="95" r="45" fill="#cc0000" opacity="0.08"
      className="ca" style={{ animation: 'ca-pulse 2s ease-in-out infinite' }} />
    {/* Frasco */}
    <path d="M130,140 L125,105 L132,95 L132,72 L140,66 L160,66 L168,72 L168,95 L175,105 L170,140 Z"
      fill="url(#g026l)" stroke="#ff2222" strokeWidth="1.5" />
    {/* Cuello */}
    <rect x="132" y="52" width="36" height="16" rx="6" fill="#441100" stroke="#cc2222" strokeWidth="1" />
    {/* Tapón */}
    <rect x="138" y="44" width="24" height="10" rx="4" fill="#661100" />
    {/* Líquido interior */}
    <path d="M128,140 L126,110 C126,110 145,118 165,108 L172,140 Z" fill="#990000" opacity="0.6" />
    {/* Burbujas */}
    {[[140,125,'0s'],[150,130,'0.6s'],[158,120,'1.2s'],[145,135,'1.8s'],[155,128,'2.4s']].map(([x,y,dl],i)=>
      <circle key={i} cx={x} cy={y} r="3.5" fill="#ff4444" opacity="0.7" stroke="#ff8888" strokeWidth="0.5"
        className="ca" style={{ animation:`ca-bubble ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:dl }} />
    )}
    {/* Brillo del frasco */}
    <path d="M134,78 C130,90 130,110 133,125" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
  </g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAMPAS
// ─────────────────────────────────────────────────────────────────────────────

function Art_p027() { // Trampa de Espinas — espinas creciendo del suelo
  return <g>
    <defs>
      <radialGradient id="g027" cx="50%" cy="80%" r="80%">
        <stop offset="0%" stopColor="#0a1500" /><stop offset="100%" stopColor="#020400" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g027)" />
    {/* Suelo */}
    <rect x="0" y="130" width="300" height="30" fill="#1a0e00" />
    {/* Grietas en el suelo */}
    <path d="M80,130 L90,145 L100,130" fill="none" stroke="#2a1500" strokeWidth="2" />
    <path d="M180,130 L190,148 L205,130" fill="none" stroke="#2a1500" strokeWidth="2" />
    {/* Espinas principales */}
    {[
      {x:110,h:80,w:14,d:'0s'},{x:135,h:95,w:12,d:'0.2s'},{x:150,h:110,w:16,d:'0.4s'},
      {x:165,h:90,w:12,d:'0.6s'},{x:188,h:75,w:13,d:'0.8s'},
      {x:90,h:55,w:10,d:'1s'},{x:210,h:60,w:11,d:'1.2s'},
    ].map(({x,h,w,d},i)=>
      <g key={i} className="ca" style={{ transformOrigin:`${x}px 130px`, animation:`ca-growY 1.5s ease-out forwards`, animationDelay:d }}>
        <path d={`M${x-w/2},130 L${x},${130-h} L${x+w/2},130`} fill="#1a4400" stroke="#336600" strokeWidth="1.5" />
        <path d={`M${x-w/4},${130-h*0.3} L${x-w},${130-h*0.5}`} fill="none" stroke="#336600" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M${x+w/4},${130-h*0.5} L${x+w},${130-h*0.7}`} fill="none" stroke="#336600" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    )}
    {/* Sangre en puntas */}
    {[[110,50],[150,20],[188,55]].map(([x,y],i)=>
      <circle key={i} cx={x} cy={y} r="3" fill="#cc0000" opacity="0.8"
        className="ca" style={{ animation:`ca-drip 2.5s ease-in-out infinite`, animationDelay:`${i*0.8}s` }} />
    )}
  </g>;
}

function Art_p028() { // Trampa de Fuego Arcano — runa de fuego con llamas
  return <g>
    <defs>
      <radialGradient id="g028" cx="50%" cy="70%" r="70%">
        <stop offset="0%" stopColor="#200800" /><stop offset="100%" stopColor="#060200" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g028)" />
    {/* Runa en el suelo */}
    <circle cx="150" cy="120" rx="55" ry="20" fill="none" stroke="#ff6600" strokeWidth="2"
      className="ca" style={{ animation: 'ca-glow 1.5s ease-in-out infinite' }} />
    <ellipse cx="150" cy="120" rx="55" ry="20" fill="none" stroke="#ff6600" strokeWidth="2"
      className="ca" style={{ animation: 'ca-glow 1.5s ease-in-out infinite' }} />
    <ellipse cx="150" cy="120" rx="40" ry="14" fill="none" stroke="#ff4400" strokeWidth="1.5"
      className="ca" style={{ animation: 'ca-rotateR 4s linear infinite' }} />
    {/* Símbolo de la runa */}
    <text x="150" y="126" textAnchor="middle" fill="#ff6600" fontSize="20" fontFamily="serif"
      className="ca" style={{ animation: 'ca-blink 1.5s ease-in-out infinite' }}>
      ⁂
    </text>
    {/* Llamas que emergen */}
    {[{x:110,h:80,d:'0s'},{x:130,h:100,d:'0.3s'},{x:150,h:115,d:'0.6s'},{x:170,h:95,d:'0.9s'},{x:192,h:75,d:'1.2s'}].map(({x,h,d},i)=>
      <g key={i}>
        <ellipse cx={x} cy={120-h*0.4} rx={10} ry={h*0.35} fill="#ff4400" opacity="0.65"
          className="ca" style={{ animation:`ca-wave ${0.8+i*0.1}s ease-in-out infinite`, animationDelay:d }} />
        <ellipse cx={x} cy={120-h*0.6} rx={6} ry={h*0.25} fill="#ffaa00" opacity="0.7"
          className="ca" style={{ animation:`ca-wave ${0.7+i*0.1}s ease-in-out infinite`, animationDelay:`${parseFloat(d)+0.1}s` }} />
        <ellipse cx={x} cy={120-h*0.8} rx={3} ry={h*0.12} fill="#ffe066" opacity="0.9"
          className="ca" style={{ animation:`ca-wave ${0.6+i*0.1}s ease-in-out infinite`, animationDelay:`${parseFloat(d)+0.2}s` }} />
      </g>
    )}
  </g>;
}

function Art_p029() { // Portal Trampa — portal dimensional giratorio
  return <g>
    <defs>
      <radialGradient id="g029" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#000018" /><stop offset="100%" stopColor="#000005" />
      </radialGradient>
      <radialGradient id="g029p" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#110044" /><stop offset="50%" stopColor="#220088" /><stop offset="80%" stopColor="#6600cc" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g029)" />
    {/* Anillos del portal */}
    {[70,56,44,32,20].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none"
        stroke={`hsl(${260+i*15},80%,${30+i*8}%)`} strokeWidth={i===0?2.5:1.5}
        className="ca" style={{ animation:`${i%2?'ca-rotate':'ca-rotateR'} ${3+i*1.5}s linear infinite` }} />
    )}
    {/* Distorsión en el portal */}
    <circle cx="150" cy="80" r="62" fill="url(#g029p)" opacity="0.8"
      className="ca" style={{ animation: 'ca-vortex 4s linear infinite' }} />
    {/* Núcleo negro */}
    <circle cx="150" cy="80" r="18" fill="#000" />
    <circle cx="150" cy="80" r="12" fill="#110044"
      className="ca" style={{ animation: 'ca-spinZ 3s ease-in-out infinite' }} />
    {/* Señal de advertencia */}
    <text x="150" y="148" textAnchor="middle" fill="#ffaa00" fontSize="13" fontFamily="sans-serif"
      className="ca" style={{ animation: 'ca-blink 1.2s ease-in-out infinite' }}>
      ⚠ TRAMPA ⚠
    </text>
    {/* Objetos siendo absorbidos */}
    {[[90,40,'✦'],[210,45,'✦'],[80,120,'✦'],[220,115,'✦']].map(([x,y,s],i)=>
      <text key={i} x={x} y={y} textAnchor="middle" fill="#8844ff" fontSize="12"
        className="ca" style={{ transformOrigin:'150px 80px', animation:`ca-orbit ${3+i*0.5}s linear infinite`, animationDelay:`${i*0.7}s` }}>
        {s}
      </text>
    )}
  </g>;
}

function Art_p030() { // Niebla Confusora — niebla gris con signos de interrogación
  return <g>
    <defs>
      <radialGradient id="g030" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#101518" /><stop offset="100%" stopColor="#040506" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g030)" />
    {/* Capas de niebla */}
    {[{y:100,rx:150,ry:35,d:'0s'},{y:80,rx:130,ry:28,d:'0.5s'},{y:60,rx:110,ry:22,d:'1s'},{y:40,rx:90,ry:18,d:'1.5s'}].map((f,i)=>
      <ellipse key={i} cx="150" cy={f.y} rx={f.rx} ry={f.ry} fill={`rgba(${120+i*10},${130+i*10},${145+i*10},${0.12+i*0.04})`}
        className="ca" style={{ animation:`ca-fog ${3+i*0.5}s ease-in-out infinite`, animationDelay:f.d }} />
    )}
    {/* Volutas de niebla */}
    {[[60,90],[120,60],[180,75],[240,95],[90,120],[200,110]].map(([cx,cy],i)=>
      <ellipse key={i} cx={cx} cy={cy} rx={25+i*3} ry={12+i*2} fill="rgba(150,160,175,0.1)"
        className="ca" style={{ animation:`ca-drift ${2.5+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
    {/* Signos de interrogación */}
    {[[80,55,'1.5s'],[150,45,'0.5s'],[220,60,'2s'],[100,110,'1s'],[200,105,'2.5s'],[145,135,'0s']].map(([x,y,dl],i)=>
      <text key={i} x={x} y={y} textAnchor="middle" fill="#8899aa" fontSize={14+i%3*4}
        className="ca" style={{ animation:`ca-blink ${1.8+i*0.4}s ease-in-out infinite`, animationDelay:dl }}>
        ?
      </text>
    )}
    {/* Ojo en la niebla */}
    <ellipse cx="150" cy="80" rx="18" ry="10" fill="#1a2030" opacity="0.8" />
    <circle cx="150" cy="80" r="6" fill="#8899aa" opacity="0.5" />
    <circle cx="150" cy="80" r="3" fill="#445566" />
  </g>;
}

function Art_p031() { // Sello del Silencio — sello de cera con cadenas
  return <g>
    <defs>
      <radialGradient id="g031" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a0008" /><stop offset="100%" stopColor="#050002" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g031)" />
    {/* Cadenas extendiéndose */}
    {[[0,-55],[55,0],[0,55],[-55,0]].map(([ox,oy],i)=>{
      const x1=150, y1=80, x2=150+ox*1.6, y2=80+oy*1.6;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#554400" strokeWidth="4" strokeDasharray="8 4"
        className="ca" style={{ animation:`ca-chain 2s ease-out forwards`, animationDelay:`${i*0.4}s` }} />;
    })}
    {/* Sello circular */}
    <circle cx="150" cy="80" r="42" fill="#660011" stroke="#cc0033" strokeWidth="3"
      className="ca" style={{ animation: 'ca-glow 3s ease-in-out infinite' }} />
    <circle cx="150" cy="80" r="35" fill="#550010" stroke="#880022" strokeWidth="1.5" />
    {/* Símbolo de silencio */}
    <text x="150" y="70" textAnchor="middle" fill="#ffaacc" fontSize="22" fontWeight="bold">🤫</text>
    {/* Runas en el sello */}
    {[0,72,144,216,288].map((a,i)=>{
      const rad=a*Math.PI/180;
      return <text key={i} x={150+Math.cos(rad)*30} y={80+Math.sin(rad)*30+4}
        textAnchor="middle" fill="#cc3366" fontSize="10"
        className="ca" style={{ animation:`ca-blink ${2+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }}>
        ⛧
      </text>;
    })}
    {/* Cera derramada */}
    {[[110,115],[150,120],[190,115]].map(([x,y],i)=>
      <ellipse key={i} cx={x} cy={y} rx="15" ry="6" fill="#880011" opacity="0.7" />
    )}
  </g>;
}

function Art_p032() { // Trampa del Tiempo Detenido — reloj que gira y se congela
  return <g>
    <defs>
      <radialGradient id="g032" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#000820" /><stop offset="100%" stopColor="#000305" />
      </radialGradient>
    </defs>
    <rect width="300" height="160" fill="url(#g032)" />
    {/* Ondas de tiempo */}
    {[70,55,40].map((r,i)=>
      <circle key={i} cx="150" cy="80" r={r} fill="none" stroke="#4488cc" strokeWidth="1.5"
        opacity={0.5-i*0.1}
        className="ca" style={{ animation:`ca-pulse ${3+i}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
    )}
    {/* Cara del reloj */}
    <circle cx="150" cy="80" r="58" fill="#020a1a" stroke="#2255aa" strokeWidth="2.5" />
    <circle cx="150" cy="80" r="52" fill="#030c20" stroke="#1144aa" strokeWidth="1" />
    {/* Marcas de hora */}
    {Array.from({length:12},(_,i)=>{
      const a=(i*30-90)*Math.PI/180;
      return <line key={i}
        x1={150+Math.cos(a)*44} y1={80+Math.sin(a)*44}
        x2={150+Math.cos(a)*50} y2={80+Math.sin(a)*50}
        stroke="#4488cc" strokeWidth={i%3===0?2.5:1.5} />;
    })}
    {/* Manecilla de horas */}
    <line x1="150" y1="80" x2="150" y2="50" stroke="#88aadd" strokeWidth="3" strokeLinecap="round"
      className="ca" style={{ transformOrigin:'150px 80px', animation:'ca-clock 4s ease-in-out infinite' }} />
    {/* Manecilla de minutos */}
    <line x1="150" y1="80" x2="182" y2="80" stroke="#88aadd" strokeWidth="2" strokeLinecap="round"
      className="ca" style={{ transformOrigin:'150px 80px', animation:'ca-clock 4s ease-in-out infinite 0.5s' }} />
    {/* Centro del reloj */}
    <circle cx="150" cy="80" r="5" fill="#4488cc" />
    <circle cx="150" cy="80" r="3" fill="#aaccff"
      className="ca" style={{ animation: 'ca-glow2 2s ease-in-out infinite' }} />
    {/* "STOP" congelado */}
    <text x="150" y="145" textAnchor="middle" fill="#2255aa" fontSize="11" fontFamily="monospace" letterSpacing="4"
      className="ca" style={{ animation: 'ca-blink 3s ease-in-out infinite' }}>
      ⏸ DETENIDO ⏸
    </text>
  </g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default / Fallback
// ─────────────────────────────────────────────────────────────────────────────
function ArtDefault() {
  return <g>
    <rect width="300" height="160" fill="#070912" />
    <circle cx="150" cy="80" r="38" fill="none" stroke="#1e2d45" strokeWidth="2"
      className="ca" style={{ animation: 'ca-pulse 3s ease-in-out infinite' }} />
    <text x="150" y="86" textAnchor="middle" fill="#4a5568" fontSize="32">⚔</text>
  </g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup
// ─────────────────────────────────────────────────────────────────────────────
const ART = {
  p001: Art_p001, p002: Art_p002, p003: Art_p003, p004: Art_p004,
  p005: Art_p005, p006: Art_p006, p007: Art_p007, p008: Art_p008,
  p009: Art_p009, p010: Art_p010, p011: Art_p011, p012: Art_p012,
  p013: Art_p013, p014: Art_p014, p015: Art_p015, p016: Art_p016,
  p017: Art_p017, p018: Art_p018, p019: Art_p019, p020: Art_p020,
  p021: Art_p021, p022: Art_p022, p023: Art_p023, p024: Art_p024,
  p025: Art_p025, p026: Art_p026, p027: Art_p027, p028: Art_p028,
  p029: Art_p029, p030: Art_p030, p031: Art_p031, p032: Art_p032,
};
