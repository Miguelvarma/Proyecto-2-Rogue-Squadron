// src/data/weaponsData.ts
export const weaponsData = [
  // GUERRERO - SET 1
  {
    name: "Espada de una mano",
    heroType: "GUERRERO",
    subclass: "TANQUE",
    set: "SET1",
    effects: { ataque: 1, critico: 1 },
    description: "Espada versátil que aumenta el ataque y probabilidad crítica",
    price: 150,
    rarity: "RARE"
  },
  {
    name: "Espada de dos manos",
    heroType: "GUERRERO",
    subclass: "TANQUE",
    set: "SET1",
    effects: { ataque: 1, critico: 3 },
    description: "Poderosa espada a dos manos con alto crítico",
    price: 200,
    rarity: "EPIC"
  },
  // GUERRERO - SET 2
  {
    name: "Escudo de dragón",
    heroType: "GUERRERO",
    subclass: "TANQUE",
    set: "SET2",
    effects: { defensa: 1 },
    description: "Escudo legendario que aumenta la defensa",
    price: 180,
    rarity: "EPIC"
  },
  {
    name: "Piedra de afilar",
    heroType: "GUERRERO",
    subclass: "TANQUE",
    set: "SET2",
    effects: { daño: 2 },
    description: "Aumenta el daño físico del guerrero",
    price: 100,
    rarity: "COMMON"
  },

  // MAGO - SET 1
  {
    name: "Orbe de manos ardientes",
    heroType: "MAGO",
    subclass: "FUEGO",
    set: "SET1",
    effects: { daño: 1, critico: 3 },
    description: "Orbe ígneo que quema a los enemigos",
    price: 220,
    rarity: "EPIC"
  },
  {
    name: "Báculo de Permafrost",
    heroType: "MAGO",
    subclass: "HIELO",
    set: "SET1",
    effects: { oponente_ataque: -1, oponente_critico: -2 },
    description: "Báculo que congela las habilidades enemigas",
    price: 230,
    rarity: "LEGENDARY"
  },
  // MAGO - SET 2
  {
    name: "Fuego fatuo",
    heroType: "MAGO",
    subclass: "FUEGO",
    set: "SET2",
    effects: { ataque: 1 },
    description: "Llama mágica que aumenta el ataque",
    price: 120,
    rarity: "RARE"
  },
  {
    name: "Venas heladas",
    heroType: "MAGO",
    subclass: "HIELO",
    set: "SET2",
    effects: { daño: 1 },
    description: "Canaliza el poder del hielo para más daño",
    price: 130,
    rarity: "RARE"
  },

  // PÍCARO - SET 1
  {
    name: "Daga purulenta",
    heroType: "PICARO",
    subclass: "VENENO",
    set: "SET1",
    effects: { daño: 1, critico: 3, duracion_turnos: 2 },
    description: "Daga envenenada que daña por dos turnos",
    price: 190,
    rarity: "EPIC"
  },
  {
    name: "Machete vendito",
    heroType: "PICARO",
    subclass: "MACHETE",
    set: "SET1",
    effects: { daño: 2, critico: 2 },
    description: "Machete bendito con poder letal",
    price: 210,
    rarity: "EPIC"
  },
  // PÍCARO - SET 2
  {
    name: "Visión borrosa",
    heroType: "PICARO",
    subclass: "VENENO",
    set: "SET2",
    effects: { oponente_ataque: -1 },
    description: "Desorienta al enemigo reduciendo su ataque",
    price: 110,
    rarity: "RARE"
  },
  {
    name: "Cierra sangrienta",
    heroType: "PICARO",
    subclass: "MACHETE",
    set: "SET2",
    effects: { daño: 2, duracion_turnos: 2 },
    description: "Causa hemorragia por dos turnos",
    price: 140,
    rarity: "RARE"
  },

  // SANADOR - SET 1
  {
    name: "Raíz china",
    heroType: "SANADOR",
    subclass: "CHAMAN",
    set: "SET1",
    effects: { sanacion: "2d4" },
    description: "Raíz ancestral que restaura vida",
    price: 160,
    rarity: "RARE"
  },
  {
    name: "Kit de urgencias",
    heroType: "SANADOR",
    subclass: "MEDICO",
    set: "SET1",
    effects: { sanacion: "2d6" },
    description: "Kit médico completo para emergencias",
    price: 170,
    rarity: "EPIC"
  },
  // SANADOR - SET 2
  {
    name: "Yerbabuena",
    heroType: "SANADOR",
    subclass: "CHAMAN",
    set: "SET2",
    effects: { sanacion: 2, duracion_turnos: 2 },
    description: "Hierba curativa que sana por dos turnos",
    price: 120,
    rarity: "COMMON"
  },
  {
    name: "Reanimador",
    heroType: "SANADOR",
    subclass: "MEDICO",
    set: "SET2",
    effects: { sanacion: "4d6" },
    description: "Dispositivo que revive a aliados caídos",
    price: 250,
    rarity: "LEGENDARY"
  }
];