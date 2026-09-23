// League of Legends Item Database & Helper Functions (Season 14/15)

export interface ItemInfo {
  id: number;
  name: string;
  category: 'AP' | 'AD' | 'TANK' | 'SUPPORT' | 'BOOTS' | 'STARTER' | 'COMPONENT' | 'WARD';
  tags?: string[];
}

export const LOL_ITEMS: Record<number, ItemInfo> = {
  // --- BOTAS ---
  3020: { id: 3020, name: 'Botas del Hechicero', category: 'BOOTS', tags: ['Penetración Mágica'] },
  3047: { id: 3047, name: 'Botas Blindadas (Tabis)', category: 'BOOTS', tags: ['Armadura', 'Reducción Autoataques'] },
  3111: { id: 3111, name: 'Botas de Mercurio', category: 'BOOTS', tags: ['Resistencia Mágica', 'Tenacidad'] },
  3158: { id: 3158, name: 'Botas Jonias de la Lucidez', category: 'BOOTS', tags: ['Aceleración de Habilidad', 'Hechizos de Invocador'] },
  3006: { id: 3006, name: 'Grebas de Berserker', category: 'BOOTS', tags: ['Velocidad de Ataque'] },
  3009: { id: 3009, name: 'Botas de Rapidez', category: 'BOOTS', tags: ['Velocidad de Movimiento', 'Resistencia a Ralentizaciones'] },
  3117: { id: 3117, name: 'Botas de Movilidad', category: 'BOOTS', tags: ['Roam'] },

  // --- MAGOS / AP ---
  6655: { id: 6655, name: 'Compañera de Luden', category: 'AP', tags: ['Burst', 'Maná'] },
  6653: { id: 6653, name: 'Tormento de Liandry', category: 'AP', tags: ['Quemadura', 'Antitanque'] },
  3157: { id: 3157, name: 'Reloj de Arena de Zhonya', category: 'AP', tags: ['Armadura', 'Estasis'] },
  3089: { id: 3089, name: 'Sombrero Mortal de Rabadon', category: 'AP', tags: ['Poder de Habilidad Puro'] },
  3135: { id: 3135, name: 'Báculo del Vacío', category: 'AP', tags: ['Penetración Mágica'] },
  4645: { id: 4645, name: 'Llamasombría', category: 'AP', tags: ['Burst Crítico Mágico'] },
  4646: { id: 4646, name: 'Sobrecarga Tormentosa', category: 'AP', tags: ['Ejecución', 'Velocidad'] },
  3165: { id: 3165, name: 'Morellonomicón', category: 'AP', tags: ['Heridas Graves'] },
  3116: { id: 3116, name: 'Cetro de Cristal de Rylai', category: 'AP', tags: ['Ralentización'] },
  3100: { id: 3100, name: 'Maldición del Liche', category: 'AP', tags: ['Brillo', 'Burst'] },
  3115: { id: 3115, name: 'Diente de Nashor', category: 'AP', tags: ['Velocidad de Ataque'] },
  3152: { id: 3152, name: 'Cinturón Cohete Hextech', category: 'AP', tags: ['Movilidad', 'Engage'] },
  6656: { id: 6656, name: 'Vara de las Edades', category: 'AP', tags: ['Escalado', 'Sustain'] },
  3003: { id: 3003, name: 'Báculo del Arcángel', category: 'AP', tags: ['Escudo', 'Maná'] },
  3040: { id: 3040, name: 'Abrazo del Serafín', category: 'AP', tags: ['Escudo', 'Maná'] },
  3102: { id: 3102, name: 'Velo del Hada de la Muerte', category: 'AP', tags: ['Escudo Antihechizos'] },
  3118: { id: 3118, name: 'Malignidad', category: 'AP', tags: ['Aceleración Definitiva', 'Área de Quemadura'] },
  3137: { id: 3137, name: 'Criptoflorecimiento', category: 'AP', tags: ['Penetración Mágica', 'Curación en Área'] },

  // --- ASESINOS AD / LETALIDAD ---
  6692: { id: 6692, name: 'Eclipse', category: 'AD', tags: ['Duelo', 'Escudo'] },
  3142: { id: 3142, name: 'Espada Fantasma de Youmuu', category: 'AD', tags: ['Letalidad', 'Roam'] },
  6676: { id: 6676, name: 'El Coleccionista', category: 'AD', tags: ['Letalidad', 'Crítico', 'Ejecución'] },
  6694: { id: 6694, name: 'Rencor de Serylda', category: 'AD', tags: ['Penetración de Armadura', 'Ralentización'] },
  3814: { id: 3814, name: 'Filo de la Noche', category: 'AD', tags: ['Escudo Antihechizos', 'Letalidad'] },
  6695: { id: 6695, name: 'Hidra Profana', category: 'AD', tags: ['Limpieza de Oleadas', 'Burst Letalidad'] },
  6696: { id: 6696, name: 'Oportunidad', category: 'AD', tags: ['Letalidad Inicial', 'Velocidad de Fuga'] },
  6697: { id: 6697, name: 'Cicloespada Voltaica', category: 'AD', tags: ['Energizado', 'Ralentización'] },
  6698: { id: 6698, name: 'Soberbia', category: 'AD', tags: ['AD por Asesinatos', 'Escalado Bola de Nieve'] },
  3134: { id: 3134, name: 'Puñal Serrado', category: 'COMPONENT', tags: ['Letalidad Temprana'] },

  // --- TIRADORES / AD CRÍTICO / ON-HIT ---
  3031: { id: 3031, name: 'Filo del Infinito', category: 'AD', tags: ['Daño Crítico'] },
  3094: { id: 3094, name: 'Cañón de Fuego Rápido', category: 'AD', tags: ['Rango de Ataque'] },
  3085: { id: 3085, name: 'Huracán de Runaan', category: 'AD', tags: ['Daño Multiobjetivo'] },
  3046: { id: 3046, name: 'Bailarín Espectral', category: 'AD', tags: ['Velocidad de Movimiento', 'Ataque'] },
  3036: { id: 3036, name: 'Recuerdos de Lord Dominik', category: 'AD', tags: ['Penetración de Armadura'] },
  3033: { id: 3033, name: 'Recordatorio Mortal', category: 'AD', tags: ['Heridas Graves', 'Penetración'] },
  3072: { id: 3072, name: 'La Sanguinaria', category: 'AD', tags: ['Robo de Vida', 'Escudo'] },
  3153: { id: 3153, name: 'Espada del Rey Arruinado (BORK)', category: 'AD', tags: ['Daño por Vida Máxima', 'Robo de Vida'] },
  6672: { id: 6672, name: 'Verdugo de Krakens', category: 'AD', tags: ['Daño Continuo Cada 3 Golpes'] },
  3508: { id: 3508, name: 'Segador de Esencia', category: 'AD', tags: ['Maná', 'Brillo'] },
  3124: { id: 3124, name: 'Espadafuria de Guinsoo', category: 'AD', tags: ['Efectos de Impacto'] },
  3302: { id: 3302, name: 'Términus', category: 'AD', tags: ['Penetración Híbrida', 'Resistencias'] },

  // --- LUCHADORES / BRUISERS ---
  3078: { id: 3078, name: 'Fuerza de la Trinidad', category: 'AD', tags: ['Brillo', 'Stats Completas'] },
  3071: { id: 3071, name: 'Cuchilla Negra', category: 'AD', tags: ['Desgaste de Armadura', 'Vida'] },
  3053: { id: 3053, name: 'Guantelete de Sterak', category: 'AD', tags: ['Escudo Antiráfaga', 'Tenacidad'] },
  6333: { id: 6333, name: 'Danza de la Muerte', category: 'AD', tags: ['Resistencia al Burst', 'Armadura'] },
  3156: { id: 3156, name: 'Fauces de Malmortius', category: 'AD', tags: ['Escudo Antimagia'] },
  3074: { id: 3074, name: 'Hidra Voraz', category: 'AD', tags: ['Limpieza de Oleadas', 'Robo de Vida'] },
  3748: { id: 3748, name: 'Hidra Titánica', category: 'AD', tags: ['Daño por Vida', 'Empuje de Línea'] },
  6631: { id: 6631, name: 'Rompeavances', category: 'AD', tags: ['Ralentización Activa', 'Movilidad'] },
  6610: { id: 6610, name: 'Cielo Desgarrado', category: 'AD', tags: ['Primer Golpe Crítico', 'Curación'] },
  3161: { id: 3161, name: 'Lanza de Shojin', category: 'AD', tags: ['Aceleración Básica', 'Amplificación de Daño'] },
  3181: { id: 3181, name: 'Rompecascos', category: 'AD', tags: ['Splitpush', 'Potenciación de Súbditos'] },

  // --- TANQUES ---
  3068: { id: 3068, name: 'Égida de Fuego Solar', category: 'TANK', tags: ['Armadura', 'Daño de Área'] },
  3075: { id: 3075, name: 'Cota de Espinas', category: 'TANK', tags: ['Armadura', 'Heridas Graves'] },
  3143: { id: 3143, name: 'Presagio de Randuin', category: 'TANK', tags: ['Anticrítico', 'Ralentización Activa'] },
  3110: { id: 3110, name: 'Corazón de Hielo', category: 'TANK', tags: ['Reducción Velocidad de Ataque', 'Armadura'] },
  3065: { id: 3065, name: 'Rostro Espiritual', category: 'TANK', tags: ['Aumento de Curaciones/Escudos', 'MR'] },
  4401: { id: 4401, name: 'Fuerza de la Naturaleza', category: 'TANK', tags: ['Resistencia Mágica Acumulativa', 'Velocidad'] },
  3084: { id: 3084, name: 'Corazón de Acero', category: 'TANK', tags: ['Vida Infinita Acumulable'] },
  3066: { id: 3066, name: 'Desesperanza Infinita', category: 'TANK', tags: ['Curación en Área', 'Armadura'] },
  2504: { id: 2504, name: 'Fulgor Vano', category: 'TANK', tags: ['Limpieza de Oleadas', 'Resistencia Mágica'] },
  2502: { id: 2502, name: 'Resplandor Vacío', category: 'TANK', tags: ['Resistencia Mágica', 'Daño Mágico'] },
  6665: { id: 6665, name: 'Jak\'Sho el Proteico', category: 'TANK', tags: ['Resistencias en Combate Prolongado'] },

  // --- SOPORTES ---
  3190: { id: 3190, name: 'Relicario de los Solari de Hierro', category: 'SUPPORT', tags: ['Escudo en Área'] },
  3107: { id: 3107, name: 'Redención', category: 'SUPPORT', tags: ['Curación Global en Área'] },
  3504: { id: 3504, name: 'Incensario Ardiente', category: 'SUPPORT', tags: ['Potenciación de Autoataques Aliados'] },
  6617: { id: 6617, name: 'Renovador de Piedra Lunar', category: 'SUPPORT', tags: ['Curación y Escudos en Cadena'] },
  3050: { id: 3050, name: 'Convergencia de Zeke', category: 'SUPPORT', tags: ['Tormenta Helada en Definitiva'] },
  3109: { id: 3109, name: 'Promesa del Caballero', category: 'SUPPORT', tags: ['Redirección de Daño de Aliado'] },
  2065: { id: 2065, name: 'Canto de Guerra de Shurelya', category: 'SUPPORT', tags: ['Velocidad de Movimiento de Equipo'] },

  // --- COMPONENTES CLAVE ---
  3123: { id: 3123, name: 'Llamada del Verdugo', category: 'COMPONENT', tags: ['Anti-curación Temprana (800g)'] },
  3916: { id: 3916, name: 'Orbe del Olvido', category: 'COMPONENT', tags: ['Anti-curación Mágica Temprana (800g)'] },
  3076: { id: 3076, name: 'Chaleco de Zarzas', category: 'COMPONENT', tags: ['Anti-curación Tanque Temprana (800g)'] },
  3802: { id: 3802, name: 'Capítulo Perdido', category: 'COMPONENT', tags: ['Pico de Maná y AP al nivel 6'] },
  3191: { id: 3191, name: 'Protector del Brazo de la Buscadora', category: 'COMPONENT', tags: ['Armadura contra Asesinos AD'] },
  3057: { id: 3057, name: 'Brillo', category: 'COMPONENT', tags: ['Daño Adicional tras Habilidad'] },
  3044: { id: 3044, name: 'Bacteriófago', category: 'COMPONENT', tags: ['Vida y Daño'] },
  3133: { id: 3133, name: 'Martillo de Guerra de Caulfield', category: 'COMPONENT', tags: ['Aceleración'] },

  // --- TRINKETS Y WARDS ---
  3340: { id: 3340, name: 'Guardián Invisible (Trinket Amarillo)', category: 'WARD', tags: ['Visión'] },
  3364: { id: 3364, name: 'Lente del Oráculo (Lente Roja)', category: 'WARD', tags: ['Denegación de Visión'] },
  3363: { id: 3363, name: 'Visión Lejana (Trinket Azul)', category: 'WARD', tags: ['Visión a Distancia'] },
  2055: { id: 2055, name: 'Guardián de Control (Pink Ward)', category: 'WARD', tags: ['Visión Verdadera'] },
};

/**
 * Obtiene el nombre en español de un ítem por su ID
 */
export const getItemName = (itemId: number): string => {
  if (!itemId || itemId === 0) return '';
  return LOL_ITEMS[itemId]?.name || `Objeto #${itemId}`;
};

/**
 * Convierte un arreglo de IDs de ítems en una lista legible de nombres
 */
export const getBuildItemNames = (itemIds: number[]): string[] => {
  return itemIds
    .filter((id) => id > 0)
    .map((id) => getItemName(id));
};
