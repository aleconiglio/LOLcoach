// League of Legends Runes Reforged Database (Season 14/15)

export interface RuneInfo {
  id: number;
  name: string;
  tree: 'Precisión' | 'Dominación' | 'Brujería' | 'Valor' | 'Inspiración';
  slot: 'KEYSTONE' | 'MINOR_1' | 'MINOR_2' | 'MINOR_3';
  description: string;
  iconPath?: string;
}

export const LOL_RUNES: Record<number, RuneInfo> = {
  // === PRECISIÓN ===
  8010: {
    id: 8010,
    name: 'Conquistador',
    tree: 'Precisión',
    slot: 'KEYSTONE',
    description: 'Acumula fuerza adaptativa en combate prolongado. Al llegar a 12 acumulaciones, cura un porcentaje del daño infligido.',
    iconPath: 'perk-images/Styles/Precision/Conqueror/Conqueror.png',
  },
  8008: {
    id: 8008,
    name: 'Compás Letal',
    tree: 'Precisión',
    slot: 'KEYSTONE',
    description: 'Otorga velocidad de ataque acumulativa al atacar campeones y aumenta el alcance de ataque al máximo de cargas.',
    iconPath: 'perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png',
  },
  8021: {
    id: 8021,
    name: 'Sobre la Marcha',
    tree: 'Precisión',
    slot: 'KEYSTONE',
    description: 'Atacar genera cargas de Energía. Los ataques cargados curan y otorgan velocidad de movimiento.',
    iconPath: 'perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png',
  },
  8005: {
    id: 8005,
    name: 'Estrategia Ofensiva (PTA)',
    tree: 'Precisión',
    slot: 'KEYSTONE',
    description: 'Golpear a un enemigo con 3 autoataques inflige daño adicional y amplifica todo el daño recibido.',
    iconPath: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
  },
  // Precisión Minors
  9101: { id: 9101, name: 'Absorber Vida', tree: 'Precisión', slot: 'MINOR_1', description: 'Eliminar un objetivo restaura una pequeña cantidad de vida.' },
  9111: { id: 9111, name: 'Triunfo', tree: 'Precisión', slot: 'MINOR_1', description: 'Los derribos restauran el 2.5% de tu vida máxima y otorgan 20 de oro adicional.' },
  8009: { id: 8009, name: 'Claridad Mental', tree: 'Precisión', slot: 'MINOR_1', description: 'Dañar a un campeón aumenta la regeneración de maná. Los derribos restauran maná/energía.' },
  9104: { id: 9104, name: 'Leyenda: Presteza', tree: 'Precisión', slot: 'MINOR_2', description: 'Otorga velocidad de ataque acumulativa por cada derribo o monstruo épico.' },
  9105: { id: 9105, name: 'Leyenda: Aceleración', tree: 'Precisión', slot: 'MINOR_2', description: 'Otorga aceleración de habilidades básicas con cada derribo.' },
  9103: { id: 9103, name: 'Leyenda: Linaje', tree: 'Precisión', slot: 'MINOR_2', description: 'Otorga robo de vida acumulativo y vida máxima.' },
  8014: { id: 8014, name: 'Golpe de Gracia', tree: 'Precisión', slot: 'MINOR_3', description: 'Inflige un 8% más de daño a campeones con menos del 40% de vida.' },
  8017: { id: 8017, name: 'Derribado', tree: 'Precisión', slot: 'MINOR_3', description: 'Inflige más daño a objetivos con más del 60% de vida.' },
  8299: { id: 8299, name: 'Último Esfuerzo', tree: 'Precisión', slot: 'MINOR_3', description: 'Inflige hasta un 11% de daño adicional cuando estás bajo de vida.' },

  // === DOMINACIÓN ===
  8112: {
    id: 8112,
    name: 'Electrocutar',
    tree: 'Dominación',
    slot: 'KEYSTONE',
    description: 'Golpear a un campeón con 3 ataques o habilidades individuales en 3s inflige daño adaptativo explosivo.',
    iconPath: 'perk-images/Styles/Domination/Electrocute/Electrocute.png',
  },
  8128: {
    id: 8128,
    name: 'Cosecha Oscura',
    tree: 'Dominación',
    slot: 'KEYSTONE',
    description: 'Dañar a un campeón con menos del 50% de vida inflige daño adaptativo y recolecta su alma para acumular daño permanente.',
    iconPath: 'perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png',
  },
  9923: {
    id: 9923,
    name: 'Lluvia de Cuchillas',
    tree: 'Dominación',
    slot: 'KEYSTONE',
    description: 'Otorga una ráfaga masiva de 110% de velocidad de ataque para los 3 primeros ataques básicos.',
    iconPath: 'perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png',
  },
  // Dominación Minors
  8126: { id: 8126, name: 'Golpe Bajo', tree: 'Dominación', slot: 'MINOR_1', description: 'Inflige daño verdadero adicional a campeones con movimiento alterado o ralentizados.' },
  8139: { id: 8139, name: 'Sabor a Sangre', tree: 'Dominación', slot: 'MINOR_1', description: 'Cura al dañar a un campeón enemigo (enfriamiento de 20s).' },
  8143: { id: 8143, name: 'Impacto Súbito', tree: 'Dominación', slot: 'MINOR_1', description: 'Otorga letalidad y penetración mágica tras usar un desplazamiento o sigilo.' },
  8136: { id: 8136, name: 'Guardián Zombi', tree: 'Dominación', slot: 'MINOR_2', description: 'Destruir guardianes enemigos genera un guardián zombi aliado y otorga daño adaptativo.' },
  8120: { id: 8120, name: 'Poro Fantasma', tree: 'Dominación', slot: 'MINOR_2', description: 'Tus guardianes dejan un Poro que vigila el área y otorga fuerza adaptativa.' },
  8138: { id: 8138, name: 'Colección de Ojos', tree: 'Dominación', slot: 'MINOR_2', description: 'Recolecta ojos con derribos de campeones para obtener fuerza adaptativa permanente.' },
  8135: { id: 8135, name: 'Cazador de Tesoros', tree: 'Dominación', slot: 'MINOR_3', description: 'Otorga oro adicional en el primer derribo de cada campeón enemigo (hasta 450 de oro).' },
  8105: { id: 8105, name: 'Cazador Implacable', tree: 'Dominación', slot: 'MINOR_3', description: 'Otorga velocidad de movimiento fuera de combate acumulativa con cada derribo.' },
  8106: { id: 8106, name: 'Cazador Definitivo', tree: 'Dominación', slot: 'MINOR_3', description: 'Reduce el enfriamiento de tu habilidad definitiva con cada derribo único.' },

  // === BRUJERÍA ===
  8214: {
    id: 8214,
    name: 'Invocar a Aery',
    tree: 'Brujería',
    slot: 'KEYSTONE',
    description: 'Tus ataques y habilidades envían a Aery a dañar enemigos o a otorgar escudos a los aliados cercanos.',
    iconPath: 'perk-images/Styles/Sorcery/SummonAery/SummonAery.png',
  },
  8229: {
    id: 8229,
    name: 'Cometa Arcano',
    tree: 'Brujería',
    slot: 'KEYSTONE',
    description: 'Dañar a un campeón con una habilidad lanza un cometa a su posición que inflige daño adaptativo en área.',
    iconPath: 'perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png',
  },
  8230: {
    id: 8230,
    name: 'Irrupción de Fase',
    tree: 'Brujería',
    slot: 'KEYSTONE',
    description: 'Golpear con 3 ataques o habilidades individuales otorga una gran bonificación de velocidad de movimiento y 75% de resistencia a ralentizaciones.',
    iconPath: 'perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png',
  },
  // Brujería Minors
  8224: { id: 8224, name: 'Orbe Anulador', tree: 'Brujería', slot: 'MINOR_1', description: 'Otorga un escudo de daño mágico al quedar por debajo del 30% de vida.' },
  8226: { id: 8226, name: 'Banda de Maná', tree: 'Brujería', slot: 'MINOR_1', description: 'Golpear con habilidades aumenta permanentemente el maná máximo hasta 250 de maná.' },
  8275: { id: 8275, name: 'Capa del Nimbo', tree: 'Brujería', slot: 'MINOR_1', description: 'Usar un hechizo de invocador otorga una bonificación de velocidad de movimiento y atraviesa unidades.' },
  8210: { id: 8210, name: 'Trascendencia', tree: 'Brujería', slot: 'MINOR_2', description: 'Otorga aceleración de habilidad a los niveles 5 y 8. Al nivel 11, los derribos reducen el enfriamiento restante.' },
  8234: { id: 8234, name: 'Celeridad', tree: 'Brujería', slot: 'MINOR_2', description: 'Aumenta todas las bonificaciones de velocidad de movimiento un 7% y otorga velocidad plana.' },
  8233: { id: 8233, name: 'Concentración Absoluta', tree: 'Brujería', slot: 'MINOR_2', description: 'Otorga daño adaptativo adicional mientras estés por encima del 70% de vida.' },
  8237: { id: 8237, name: 'Piromancia (Chamuscar)', tree: 'Brujería', slot: 'MINOR_3', description: 'Tu siguiente habilidad prende fuego al campeón enemigo e inflige daño mágico extra tras 1s.' },
  8232: { id: 8232, name: 'Caminar sobre Agua', tree: 'Brujería', slot: 'MINOR_3', description: 'Otorga velocidad de movimiento y fuerza adaptativa en el río.' },
  8236: { id: 8236, name: 'Tormenta Creciente', tree: 'Brujería', slot: 'MINOR_3', description: 'Otorga cantidades crecientes de daño adaptativo cada 10 minutos de partida.' },

  // === VALOR ===
  8437: {
    id: 8437,
    name: 'Garras del Inmortal',
    tree: 'Valor',
    slot: 'KEYSTONE',
    description: 'Entrar en combate acumula cargas. El siguiente ataque inflige daño adicional por vida máxima, te cura y otorga vida permanente.',
    iconPath: 'perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
  },
  8439: {
    id: 8439,
    name: 'Reverberacción',
    tree: 'Valor',
    slot: 'KEYSTONE',
    description: 'Inmovilizar a un campeón enemigo otorga un pico masivo de armadura y resistencia mágica, seguido de una explosión en área.',
    iconPath: 'perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
  },
  8465: {
    id: 8465,
    name: 'Guardián',
    tree: 'Valor',
    slot: 'KEYSTONE',
    description: 'Protege a los aliados cercanos. Si tú o un aliado protegido reciben daño, ambos obtienen un escudo y velocidad.',
    iconPath: 'perk-images/Styles/Resolve/Guardian/Guardian.png',
  },
  // Valor Minors
  8446: { id: 8446, name: 'Demoler', tree: 'Valor', slot: 'MINOR_1', description: 'Carga un ataque devastador contra torretas cuando estás cerca de ellas.' },
  8463: { id: 8463, name: 'Fuente de Vida', tree: 'Valor', slot: 'MINOR_1', description: 'Ralentizar o inmovilizar marca a un enemigo. Los aliados que lo atacan se curan con el tiempo.' },
  8401: { id: 8401, name: 'Golpe de Escudo', tree: 'Valor', slot: 'MINOR_1', description: 'Al obtener un escudo, ganas resistencias y tu siguiente ataque inflige daño adaptativo adicional.' },
  8429: { id: 8429, name: 'Acondicionamiento', tree: 'Valor', slot: 'MINOR_2', description: 'Al minuto 12 ganas +8 de armadura y resistencia mágica, y aumentas tus resistencias un 3%.' },
  8444: { id: 8444, name: 'Fuerzas Renovadas', tree: 'Valor', slot: 'MINOR_2', description: 'Tras recibir daño de un campeón, regeneras un porcentaje de la vida que te falte a lo largo de 10s.' },
  8473: { id: 8473, name: 'Revestimiento de Huesos', tree: 'Valor', slot: 'MINOR_2', description: 'Tras recibir daño de un enemigo, sus siguientes 3 ataques o habilidades infligen menos daño.' },
  8451: { id: 8451, name: 'Sobrecrecimiento', tree: 'Valor', slot: 'MINOR_3', description: 'Ganas vida máxima permanente por cada súbdito o monstruo que muera cerca de ti.' },
  8453: { id: 8453, name: 'Revitalizar', tree: 'Valor', slot: 'MINOR_3', description: 'Las curaciones y escudos que aplicas o recibes son un 5% más potentes (10% si estás bajo de vida).' },
  8242: { id: 8242, name: 'Inquebrantable', tree: 'Valor', slot: 'MINOR_3', description: 'Ganas resistencias y tenacidad adicional al recibir efectos de control de masas.' },

  // === INSPIRACIÓN ===
  8351: {
    id: 8351,
    name: 'Mejora Glacial',
    tree: 'Inspiración',
    slot: 'KEYSTONE',
    description: 'Inmovilizar a un campeón emite rayos congelados que ralentizan el área y reducen el daño de los enemigos afectados a tus aliados.',
    iconPath: 'perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png',
  },
  8360: {
    id: 8360,
    name: 'Libro de Hechizos Abierto',
    tree: 'Inspiración',
    slot: 'KEYSTONE',
    description: 'Permite intercambiar uno de tus hechizos de invocador fuera de combate por otro disponible.',
    iconPath: 'perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
  },
  8369: {
    id: 8369,
    name: 'Primer Golpe (First Strike)',
    tree: 'Inspiración',
    slot: 'KEYSTONE',
    description: 'Iniciar combate contra un campeón otorga 5 de oro y un 7% de daño adicional durante 3s, recompensando con oro equivalente al daño infligido.',
    iconPath: 'perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png',
  },
  // Inspiración Minors
  8306: { id: 8306, name: 'Destello Hextech', tree: 'Inspiración', slot: 'MINOR_1', description: 'Cuando Destello esté en enfriamiento, se reemplaza por Destello Hextech canalizable.' },
  8304: { id: 8304, name: 'Calzado Mágico', tree: 'Inspiración', slot: 'MINOR_1', description: 'Obtienes Botas Ligeramente Mágicas gratis al min 12 (se adelanta con derribos).' },
  8321: { id: 8321, name: 'Reembolso (Cash Back)', tree: 'Inspiración', slot: 'MINOR_1', description: 'Recuperas el 6% de oro al comprar cualquier objeto legendario completo.' },
  8313: { id: 8313, name: 'Tónico Triple', tree: 'Inspiración', slot: 'MINOR_2', description: 'Al nivel 3, 6 y 9 recibes elíxires especiales que otorgan oro, stats adaptativos y 1 punto de habilidad.' },
  8345: { id: 8345, name: 'Entrega de Galletas', tree: 'Inspiración', slot: 'MINOR_2', description: 'Recibes una galleta cada 2 min hasta el min 6. Las galletas restauran vida, maná y aumentan maná máximo.' },
  8347: { id: 8347, name: 'Perspicacia Cósmica', tree: 'Inspiración', slot: 'MINOR_3', description: 'Otorga +18 de aceleración de hechizos de invocador y +10 de aceleración de objetos.' },
  8410: { id: 8410, name: 'Velocidad de Aproximación', tree: 'Inspiración', slot: 'MINOR_3', description: 'Ganas velocidad de movimiento hacia campeones enemigos con movimiento alterado o ralentizados.' },
  8316: { id: 8316, name: 'Milusos (Jack of All Trades)', tree: 'Inspiración', slot: 'MINOR_3', description: 'Otorga aceleración de habilidad y fuerza adaptativa por cada estadística diferente que compres.' },
};

/**
 * Valida si un ID de runa existe en la base oficial
 */
export const isValidRune = (runeId: number): boolean => {
  return typeof runeId === 'number' && runeId > 0 && !!LOL_RUNES[runeId];
};

/**
 * Obtiene el objeto de runa por su ID
 */
export const getRuneById = (runeId: number): RuneInfo | undefined => {
  return LOL_RUNES[runeId];
};

/**
 * Obtiene el nombre de la runa
 */
export const getRuneName = (runeId: number): string => {
  return LOL_RUNES[runeId]?.name || `Runa #${runeId}`;
};

/**
 * Obtiene la URL del icono de la runa desde DataDragon
 */
export const getRuneIconUrl = (runeId: number): string => {
  const rune = LOL_RUNES[runeId];
  if (!rune || !rune.iconPath) {
    return 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/RunesIcon.png';
  }
  return `https://ddragon.leagueoflegends.com/cdn/img/${rune.iconPath}`;
};
