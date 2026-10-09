import { getCurrentPatchSync } from './patchVerificationService';

export interface ChampionInfo {
  id: string;
  name: string;
  normalizedName: string;
}


export const LOL_CHAMPIONS: ChampionInfo[] = [
  { id: 'Aatrox', name: 'Aatrox', normalizedName: 'aatrox' },
  { id: 'Ahri', name: 'Ahri', normalizedName: 'ahri' },
  { id: 'Akali', name: 'Akali', normalizedName: 'akali' },
  { id: 'Akshan', name: 'Akshan', normalizedName: 'akshan' },
  { id: 'Alistar', name: 'Alistar', normalizedName: 'alistar' },
  { id: 'Ambessa', name: 'Ambessa', normalizedName: 'ambessa' },
  { id: 'Amumu', name: 'Amumu', normalizedName: 'amumu' },
  { id: 'Anivia', name: 'Anivia', normalizedName: 'anivia' },
  { id: 'Annie', name: 'Annie', normalizedName: 'annie' },
  { id: 'Aphelios', name: 'Aphelios', normalizedName: 'aphelios' },
  { id: 'Ashe', name: 'Ashe', normalizedName: 'ashe' },
  { id: 'AurelionSol', name: 'Aurelion Sol', normalizedName: 'aurelion sol' },
  { id: 'Aurora', name: 'Aurora', normalizedName: 'aurora' },
  { id: 'Azir', name: 'Azir', normalizedName: 'azir' },
  { id: 'Bard', name: 'Bardo', normalizedName: 'bardo bard' },
  { id: 'Belveth', name: 'Bel\'Veth', normalizedName: 'belveth' },
  { id: 'Blitzcrank', name: 'Blitzcrank', normalizedName: 'blitzcrank' },
  { id: 'Brand', name: 'Brand', normalizedName: 'brand' },
  { id: 'Braum', name: 'Braum', normalizedName: 'braum' },
  { id: 'Briar', name: 'Briar', normalizedName: 'briar' },
  { id: 'Caitlyn', name: 'Caitlyn', normalizedName: 'caitlyn' },
  { id: 'Camille', name: 'Camille', normalizedName: 'camille' },
  { id: 'Cassiopeia', name: 'Cassiopeia', normalizedName: 'cassiopeia' },
  { id: 'Chogath', name: 'Cho\'Gath', normalizedName: 'chogath' },
  { id: 'Corki', name: 'Corki', normalizedName: 'corki' },
  { id: 'Darius', name: 'Darius', normalizedName: 'darius' },
  { id: 'Diana', name: 'Diana', normalizedName: 'diana' },
  { id: 'Draven', name: 'Draven', normalizedName: 'draven' },
  { id: 'DrMundo', name: 'Dr. Mundo', normalizedName: 'dr mundo drmundo' },
  { id: 'Ekko', name: 'Ekko', normalizedName: 'ekko' },
  { id: 'Elise', name: 'Elise', normalizedName: 'elise' },
  { id: 'Evelynn', name: 'Evelynn', normalizedName: 'evelynn' },
  { id: 'Ezreal', name: 'Ezreal', normalizedName: 'ezreal' },
  { id: 'Fiddlesticks', name: 'Fiddlesticks', normalizedName: 'fiddlesticks' },
  { id: 'Fiora', name: 'Fiora', normalizedName: 'fiora' },
  { id: 'Fizz', name: 'Fizz', normalizedName: 'fizz' },
  { id: 'Galio', name: 'Galio', normalizedName: 'galio' },
  { id: 'Gangplank', name: 'Gangplank', normalizedName: 'gangplank' },
  { id: 'Garen', name: 'Garen', normalizedName: 'garen' },
  { id: 'Gnar', name: 'Gnar', normalizedName: 'gnar' },
  { id: 'Gragas', name: 'Gragas', normalizedName: 'gragas' },
  { id: 'Graves', name: 'Graves', normalizedName: 'graves' },
  { id: 'Gwen', name: 'Gwen', normalizedName: 'gwen' },
  { id: 'Hecarim', name: 'Hecarim', normalizedName: 'hecarim' },
  { id: 'Heimerdinger', name: 'Heimerdinger', normalizedName: 'heimerdinger' },
  { id: 'Hwei', name: 'Hwei', normalizedName: 'hwei' },
  { id: 'Illaoi', name: 'Illaoi', normalizedName: 'illaoi' },
  { id: 'Irelia', name: 'Irelia', normalizedName: 'irelia' },
  { id: 'Ivern', name: 'Ivern', normalizedName: 'ivern' },
  { id: 'Janna', name: 'Janna', normalizedName: 'janna' },
  { id: 'JarvanIV', name: 'Jarvan IV', normalizedName: 'jarvan iv' },
  { id: 'Jax', name: 'Jax', normalizedName: 'jax' },
  { id: 'Jayce', name: 'Jayce', normalizedName: 'jayce' },
  { id: 'Jhin', name: 'Jhin', normalizedName: 'jhin' },
  { id: 'Jinx', name: 'Jinx', normalizedName: 'jinx' },
  { id: 'Ksante', name: 'K\'Sante', normalizedName: 'ksante' },
  { id: 'Kaisa', name: 'Kai\'Sa', normalizedName: 'kaisa' },
  { id: 'Kalista', name: 'Kalista', normalizedName: 'kalista' },
  { id: 'Karma', name: 'Karma', normalizedName: 'karma' },
  { id: 'Karthus', name: 'Karthus', normalizedName: 'karthus' },
  { id: 'Kassadin', name: 'Kassadin', normalizedName: 'kassadin' },
  { id: 'Katarina', name: 'Katarina', normalizedName: 'katarina' },
  { id: 'Kayle', name: 'Kayle', normalizedName: 'kayle' },
  { id: 'Kayn', name: 'Kayn', normalizedName: 'kayn' },
  { id: 'Kennen', name: 'Kennen', normalizedName: 'kennen' },
  { id: 'Khazix', name: 'Kha\'Zix', normalizedName: 'khazix' },
  { id: 'Kindred', name: 'Kindred', normalizedName: 'kindred' },
  { id: 'Kled', name: 'Kled', normalizedName: 'kled' },
  { id: 'KogMaw', name: 'Kog\'Maw', normalizedName: 'kogmaw' },
  { id: 'Leblanc', name: 'LeBlanc', normalizedName: 'leblanc' },
  { id: 'LeeSin', name: 'Lee Sin', normalizedName: 'lee sin' },
  { id: 'Leona', name: 'Leona', normalizedName: 'leona' },
  { id: 'Lillia', name: 'Lillia', normalizedName: 'lillia' },
  { id: 'Lissandra', name: 'Lissandra', normalizedName: 'lissandra' },
  { id: 'Locke', name: 'Locke', normalizedName: 'locke' },
  { id: 'Lucian', name: 'Lucian', normalizedName: 'lucian' },
  { id: 'Lulu', name: 'Lulu', normalizedName: 'lulu' },
  { id: 'Lux', name: 'Lux', normalizedName: 'lux' },
  { id: 'Malphite', name: 'Malphite', normalizedName: 'malphite' },
  { id: 'Malzahar', name: 'Malzahar', normalizedName: 'malzahar' },
  { id: 'Maokai', name: 'Maokai', normalizedName: 'maokai' },
  { id: 'MasterYi', name: 'Master Yi', normalizedName: 'master yi' },
  { id: 'Mel', name: 'Mel', normalizedName: 'mel' },
  { id: 'Milio', name: 'Milio', normalizedName: 'milio' },
  { id: 'MissFortune', name: 'Miss Fortune', normalizedName: 'miss fortune' },
  { id: 'MonkeyKing', name: 'Wukong', normalizedName: 'wukong monkeyking' },
  { id: 'Mordekaiser', name: 'Mordekaiser', normalizedName: 'mordekaiser' },
  { id: 'Morgana', name: 'Morgana', normalizedName: 'morgana' },
  { id: 'Naafiri', name: 'Naafiri', normalizedName: 'naafiri' },
  { id: 'Nami', name: 'Nami', normalizedName: 'nami' },
  { id: 'Nasus', name: 'Nasus', normalizedName: 'nasus' },
  { id: 'Nautilus', name: 'Nautilus', normalizedName: 'nautilus' },
  { id: 'Neeko', name: 'Neeko', normalizedName: 'neeko' },
  { id: 'Nidalee', name: 'Nidalee', normalizedName: 'nidalee' },
  { id: 'Nilah', name: 'Nilah', normalizedName: 'nilah' },
  { id: 'Nocturne', name: 'Nocturne', normalizedName: 'nocturne' },
  { id: 'Nunu', name: 'Nunu & Willump', normalizedName: 'nunu' },
  { id: 'Olaf', name: 'Olaf', normalizedName: 'olaf' },
  { id: 'Orianna', name: 'Orianna', normalizedName: 'orianna' },
  { id: 'Ornn', name: 'Ornn', normalizedName: 'ornn' },
  { id: 'Pantheon', name: 'Pantheon', normalizedName: 'pantheon' },
  { id: 'Poppy', name: 'Poppy', normalizedName: 'poppy' },
  { id: 'Pyke', name: 'Pyke', normalizedName: 'pyke' },
  { id: 'Qiyana', name: 'Qiyana', normalizedName: 'qiyana' },
  { id: 'Quinn', name: 'Quinn', normalizedName: 'quinn' },
  { id: 'Rakan', name: 'Rakan', normalizedName: 'rakan' },
  { id: 'Rammus', name: 'Rammus', normalizedName: 'rammus' },
  { id: 'RekSai', name: 'Rek\'Sai', normalizedName: 'reksai' },
  { id: 'Rell', name: 'Rell', normalizedName: 'rell' },
  { id: 'Renata', name: 'Renata Glasc', normalizedName: 'renata' },
  { id: 'Renekton', name: 'Renekton', normalizedName: 'renekton' },
  { id: 'Rengar', name: 'Rengar', normalizedName: 'rengar' },
  { id: 'Riven', name: 'Riven', normalizedName: 'riven' },
  { id: 'Rumble', name: 'Rumble', normalizedName: 'rumble' },
  { id: 'Ryze', name: 'Ryze', normalizedName: 'ryze' },
  { id: 'Samira', name: 'Samira', normalizedName: 'samira' },
  { id: 'Sejuani', name: 'Sejuani', normalizedName: 'sejuani' },
  { id: 'Senna', name: 'Senna', normalizedName: 'senna' },
  { id: 'Seraphine', name: 'Seraphine', normalizedName: 'seraphine' },
  { id: 'Sett', name: 'Sett', normalizedName: 'sett' },
  { id: 'Shaco', name: 'Shaco', normalizedName: 'shaco' },
  { id: 'Shen', name: 'Shen', normalizedName: 'shen' },
  { id: 'Shyvana', name: 'Shyvana', normalizedName: 'shyvana' },
  { id: 'Singed', name: 'Singed', normalizedName: 'singed' },
  { id: 'Sion', name: 'Sion', normalizedName: 'sion' },
  { id: 'Sivir', name: 'Sivir', normalizedName: 'sivir' },
  { id: 'Skarner', name: 'Skarner', normalizedName: 'skarner' },
  { id: 'Smolder', name: 'Smolder', normalizedName: 'smolder' },
  { id: 'Sona', name: 'Sona', normalizedName: 'sona' },
  { id: 'Soraka', name: 'Soraka', normalizedName: 'soraka' },
  { id: 'Swain', name: 'Swain', normalizedName: 'swain' },
  { id: 'Sylas', name: 'Sylas', normalizedName: 'sylas' },
  { id: 'Syndra', name: 'Syndra', normalizedName: 'syndra' },
  { id: 'TahmKench', name: 'Tahm Kench', normalizedName: 'tahm kench' },
  { id: 'Taliyah', name: 'Taliyah', normalizedName: 'taliyah' },
  { id: 'Talon', name: 'Talon', normalizedName: 'talon' },
  { id: 'Taric', name: 'Taric', normalizedName: 'taric' },
  { id: 'Teemo', name: 'Teemo', normalizedName: 'teemo' },
  { id: 'Thresh', name: 'Thresh', normalizedName: 'thresh' },
  { id: 'Tristana', name: 'Tristana', normalizedName: 'tristana' },
  { id: 'Trundle', name: 'Trundle', normalizedName: 'trundle' },
  { id: 'Tryndamere', name: 'Tryndamere', normalizedName: 'tryndamere' },
  { id: 'TwistedFate', name: 'Twisted Fate', normalizedName: 'twisted fate' },
  { id: 'Twitch', name: 'Twitch', normalizedName: 'twitch' },
  { id: 'Udyr', name: 'Udyr', normalizedName: 'udyr' },
  { id: 'Urgot', name: 'Urgot', normalizedName: 'urgot' },
  { id: 'Varus', name: 'Varus', normalizedName: 'varus' },
  { id: 'Vayne', name: 'Vayne', normalizedName: 'vayne' },
  { id: 'Veigar', name: 'Veigar', normalizedName: 'veigar' },
  { id: 'Velkoz', name: 'Vel\'Koz', normalizedName: 'velkoz' },
  { id: 'Vex', name: 'Vex', normalizedName: 'vex' },
  { id: 'Vi', name: 'Vi', normalizedName: 'vi' },
  { id: 'Viego', name: 'Viego', normalizedName: 'viego' },
  { id: 'Viktor', name: 'Viktor', normalizedName: 'viktor' },
  { id: 'Vladimir', name: 'Vladimir', normalizedName: 'vladimir' },
  { id: 'Volibear', name: 'Volibear', normalizedName: 'volibear' },
  { id: 'Warwick', name: 'Warwick', normalizedName: 'warwick' },
  { id: 'Xayah', name: 'Xayah', normalizedName: 'xayah' },
  { id: 'Xerath', name: 'Xerath', normalizedName: 'xerath' },
  { id: 'XinZhao', name: 'Xin Zhao', normalizedName: 'xin zhao' },
  { id: 'Yasuo', name: 'Yasuo', normalizedName: 'yasuo' },
  { id: 'Yone', name: 'Yone', normalizedName: 'yone' },
  { id: 'Yorick', name: 'Yorick', normalizedName: 'yorick' },
  { id: 'Yuumi', name: 'Yuumi', normalizedName: 'yuumi' },
  { id: 'Yunara', name: 'Yunara', normalizedName: 'yunara' },
  { id: 'Zaahen', name: 'Zaahen', normalizedName: 'zaahen' },
  { id: 'Zac', name: 'Zac', normalizedName: 'zac' },
  { id: 'Zed', name: 'Zed', normalizedName: 'zed' },
  { id: 'Zeri', name: 'Zeri', normalizedName: 'zeri' },
  { id: 'Ziggs', name: 'Ziggs', normalizedName: 'ziggs' },
  { id: 'Zilean', name: 'Zilean', normalizedName: 'zilean' },
  { id: 'Zoe', name: 'Zoe', normalizedName: 'zoe' },
  { id: 'Zyra', name: 'Zyra', normalizedName: 'zyra' },
];

/**
 * Returns Riot DataDragon CDN Champion Icon URL
 */
export const getChampionIconUrl = (championName: string | number): string => {
  if (!championName) return '';
  const str = String(championName).trim();

  // Handle pure numeric Riot Champion IDs (e.g. 805 -> Locke, 799 -> Ambessa)
  if (/^\d+$/.test(str)) {
    const numId = parseInt(str, 10);
    const meta = getChampionByNumericId(numId);
    if (meta && meta.id) {
      return `https://ddragon.leagueoflegends.com/cdn/${getCurrentPatchSync()}/img/champion/${meta.id}.png`;
    }
  }

  // Normalize champion name for DataDragon API format
  const found = LOL_CHAMPIONS.find(
    (c) =>
      c.name.toLowerCase() === str.toLowerCase() ||
      c.id.toLowerCase() === str.toLowerCase()
  );

  let key = found ? found.id : str.replace(/[^a-zA-Z0-9]/g, '');

  // Handle special Riot DataDragon keys
  const specialMap: Record<string, string> = {
    wukong: 'MonkeyKing',
    leblanc: 'Leblanc',
    khazix: 'Khazix',
    chogath: 'Chogath',
    velkoz: 'Velkoz',
    kaisa: 'Kaisa',
    belveth: 'Belveth',
    ksante: 'KSante',
    reksai: 'RekSai',
    nunu: 'Nunu',
    renata: 'Renata',
    drmundo: 'DrMundo',
    jarvaniv: 'JarvanIV',
    masteryi: 'MasterYi',
    tahmkench: 'TahmKench',
    leesin: 'LeeSin',
    missfortune: 'MissFortune',
    twistedfate: 'TwistedFate',
    xinzhao: 'XinZhao',
    ambessa: 'Ambessa',
    aurora: 'Aurora',
    smolder: 'Smolder',
    hwei: 'Hwei',
    naafiri: 'Naafiri',
    locke: 'Locke',
    mel: 'Mel',
    yunara: 'Yunara',
    zaahen: 'Zaahen',
    briar: 'Briar',
    vex: 'Vex',
    sett: 'Sett',
    lillia: 'Lillia',
  };

  const lowerKey = key.toLowerCase();
  if (specialMap[lowerKey]) {
    key = specialMap[lowerKey];
  } else if (key.length > 0) {
    // Capitalize first letter
    key = key.charAt(0).toUpperCase() + key.slice(1);
  }

  return `https://ddragon.leagueoflegends.com/cdn/${getCurrentPatchSync()}/img/champion/${key}.png`;
};

/**
 * Secondary fallback champion icon URL with cache buster
 */
export const getChampionFallbackIconUrl = (championName: string): string => {
  const primary = getChampionIconUrl(championName);
  if (!primary) return '';
  return `${primary}?t=${Date.now()}`;
};

/**
 * Robust image error handler
 */
export const handleChampionImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  championName: string
) => {
  const target = e.currentTarget;
  if (!target.dataset.triedFallback) {
    target.dataset.triedFallback = 'true';
    target.src = getChampionFallbackIconUrl(championName);
  } else {
    // Elegant fallback SVG icon placeholder if network fails completely
    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23c8aa6e" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/></svg>';
  }
};

/**
 * Returns Riot DataDragon CDN Item Icon URL
 */
export const getItemIconUrl = (itemId: number): string => {
  if (!itemId || itemId === 0) return '';
  return `https://ddragon.leagueoflegends.com/cdn/${getCurrentPatchSync()}/img/item/${itemId}.png`;
};

// ==========================================
// CHAMPION METADATA & COMBAT PROFILES
// ==========================================

export type CombatClass = 
  | 'TANK' 
  | 'BRUISER' 
  | 'ASSASSIN_AD' 
  | 'ASSASSIN_AP' 
  | 'MAGE' 
  | 'MARKSMAN' 
  | 'SUPPORT_ENCHANTER' 
  | 'SUPPORT_TANK';

export interface ChampionMetadata {
  id: string; // DataDragon key (e.g. "Ahri", "Aatrox")
  numericId: number; // Riot Spectator numeric ID (e.g. 103, 266)
  name: string; // Display name
  role: 'TOP' | 'JUNGLE' | 'MID' | 'BOT' | 'SUPPORT';
  damageType: 'AD' | 'AP' | 'MIXED' | 'TRUE';
  combatClass: CombatClass;
  hasHardCc: boolean;
  hasHeavyHealing: boolean;
  isHighBurst: boolean;
  isHighRange: boolean;
  skillOrder: string;
  keystoneId: number;
  primaryTree: string;
  secondaryTree: string;
}

export const CHAMPION_METADATA_LIST: ChampionMetadata[] = [
  { id: 'Aatrox', numericId: 266, name: 'Aatrox', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Ahri', numericId: 103, name: 'Ahri', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Akali', numericId: 84, name: 'Akali', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Akshan', numericId: 166, name: 'Akshan', role: 'MID', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Alistar', numericId: 12, name: 'Alistar', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Amumu', numericId: 32, name: 'Amumu', role: 'JUNGLE', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Precisión' },
  { id: 'Anivia', numericId: 34, name: 'Anivia', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'E > Q > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Annie', numericId: 1, name: 'Annie', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Aphelios', numericId: 523, name: 'Aphelios', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Ashe', numericId: 22, name: 'Ashe', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'W > Q > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'AurelionSol', numericId: 136, name: 'Aurelion Sol', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Aurora', numericId: 893, name: 'Aurora', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Azir', numericId: 268, name: 'Azir', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'W > Q > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Bard', numericId: 432, name: 'Bardo', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Belveth', numericId: 200, name: 'Bel\'Veth', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Blitzcrank', numericId: 53, name: 'Blitzcrank', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Valor' },
  { id: 'Brand', numericId: 63, name: 'Brand', role: 'SUPPORT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'W > E > Q', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Braum', numericId: 201, name: 'Braum', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8465, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Briar', numericId: 233, name: 'Briar', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Caitlyn', numericId: 51, name: 'Caitlyn', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Camille', numericId: 164, name: 'Camille', role: 'TOP', damageType: 'TRUE', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Cassiopeia', numericId: 69, name: 'Cassiopeia', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Chogath', numericId: 31, name: 'Cho\'Gath', role: 'TOP', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Corki', numericId: 42, name: 'Corki', role: 'MID', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Darius', numericId: 122, name: 'Darius', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Diana', numericId: 131, name: 'Diana', role: 'JUNGLE', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Draven', numericId: 119, name: 'Draven', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'DrMundo', numericId: 36, name: 'Dr. Mundo', role: 'TOP', damageType: 'AD', combatClass: 'TANK', hasHardCc: false, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Ekko', numericId: 245, name: 'Ekko', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Inspiración' },
  { id: 'Elise', numericId: 60, name: 'Elise', role: 'JUNGLE', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Evelynn', numericId: 28, name: 'Evelynn', role: 'JUNGLE', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Ezreal', numericId: 81, name: 'Ezreal', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Fiddlesticks', numericId: 9, name: 'Fiddlesticks', role: 'JUNGLE', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Dominación' },
  { id: 'Fiora', numericId: 114, name: 'Fiora', role: 'TOP', damageType: 'TRUE', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Brujería' },
  { id: 'Fizz', numericId: 105, name: 'Fizz', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Galio', numericId: 3, name: 'Galio', role: 'MID', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Brujería' },
  { id: 'Gangplank', numericId: 41, name: 'Gangplank', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Garen', numericId: 86, name: 'Garen', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Gnar', numericId: 150, name: 'Gnar', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Gragas', numericId: 79, name: 'Gragas', role: 'TOP', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Graves', numericId: 104, name: 'Graves', role: 'JUNGLE', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Gwen', numericId: 887, name: 'Gwen', role: 'TOP', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Hecarim', numericId: 120, name: 'Hecarim', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Precisión' },
  { id: 'Heimerdinger', numericId: 71, name: 'Heimerdinger', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Hwei', numericId: 910, name: 'Hwei', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Illaoi', numericId: 420, name: 'Illaoi', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Irelia', numericId: 39, name: 'Irelia', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Ivern', numericId: 427, name: 'Ivern', role: 'JUNGLE', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Janna', numericId: 40, name: 'Janna', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'JarvanIV', numericId: 59, name: 'Jarvan IV', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Jax', numericId: 24, name: 'Jax', role: 'TOP', damageType: 'MIXED', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Jayce', numericId: 126, name: 'Jayce', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Jhin', numericId: 202, name: 'Jhin', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Jinx', numericId: 222, name: 'Jinx', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Kaisa', numericId: 145, name: 'Kai\'Sa', role: 'BOT', damageType: 'MIXED', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Kalista', numericId: 429, name: 'Kalista', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Karma', numericId: 43, name: 'Karma', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Karthus', numericId: 30, name: 'Karthus', role: 'JUNGLE', damageType: 'AP', combatClass: 'MAGE', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8128, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Kassadin', numericId: 38, name: 'Kassadin', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Katarina', numericId: 55, name: 'Katarina', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Kayle', numericId: 10, name: 'Kayle', role: 'TOP', damageType: 'MIXED', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Kayn', numericId: 141, name: 'Kayn', role: 'JUNGLE', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Kennen', numericId: 85, name: 'Kennen', role: 'TOP', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Dominación' },
  { id: 'Khazix', numericId: 121, name: 'Kha\'Zix', role: 'JUNGLE', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8128, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Kindred', numericId: 203, name: 'Kindred', role: 'JUNGLE', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Kled', numericId: 240, name: 'Kled', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'KogMaw', numericId: 96, name: 'Kog\'Maw', role: 'BOT', damageType: 'MIXED', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'W > Q > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Ksante', numericId: 897, name: 'K\'Sante', role: 'TOP', damageType: 'AD', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Leblanc', numericId: 7, name: 'LeBlanc', role: 'MID', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'LeeSin', numericId: 64, name: 'Lee Sin', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Leona', numericId: 89, name: 'Leona', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Lillia', numericId: 876, name: 'Lillia', role: 'JUNGLE', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Lissandra', numericId: 127, name: 'Lissandra', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Lucian', numericId: 236, name: 'Lucian', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Lulu', numericId: 117, name: 'Lulu', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Lux', numericId: 99, name: 'Lux', role: 'SUPPORT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'E > Q > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Dominación' },
  { id: 'Malphite', numericId: 54, name: 'Malphite', role: 'TOP', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Valor' },
  { id: 'Malzahar', numericId: 90, name: 'Malzahar', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Maokai', numericId: 57, name: 'Maokai', role: 'SUPPORT', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'MasterYi', numericId: 11, name: 'Master Yi', role: 'JUNGLE', damageType: 'TRUE', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Milio', numericId: 902, name: 'Milio', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'MissFortune', numericId: 21, name: 'Miss Fortune', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'MonkeyKing', numericId: 62, name: 'Wukong', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Mordekaiser', numericId: 82, name: 'Mordekaiser', role: 'TOP', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Morgana', numericId: 25, name: 'Morgana', role: 'SUPPORT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Naafiri', numericId: 950, name: 'Naafiri', role: 'MID', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Nami', numericId: 267, name: 'Nami', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Nasus', numericId: 75, name: 'Nasus', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Nautilus', numericId: 111, name: 'Nautilus', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Neeko', numericId: 518, name: 'Neeko', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Nidalee', numericId: 76, name: 'Nidalee', role: 'JUNGLE', damageType: 'AP', combatClass: 'ASSASSIN_AP', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8128, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Nilah', numericId: 895, name: 'Nilah', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Nocturne', numericId: 56, name: 'Nocturne', role: 'JUNGLE', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Nunu', numericId: 20, name: 'Nunu & Willump', role: 'JUNGLE', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Precisión' },
  { id: 'Olaf', numericId: 2, name: 'Olaf', role: 'TOP', damageType: 'TRUE', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Orianna', numericId: 61, name: 'Orianna', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Ornn', numericId: 516, name: 'Ornn', role: 'TOP', damageType: 'MIXED', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Pantheon', numericId: 80, name: 'Pantheon', role: 'MID', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Poppy', numericId: 78, name: 'Poppy', role: 'JUNGLE', damageType: 'AD', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Pyke', numericId: 555, name: 'Pyke', role: 'SUPPORT', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 9923, primaryTree: 'Dominación', secondaryTree: 'Inspiración' },
  { id: 'Qiyana', numericId: 246, name: 'Qiyana', role: 'MID', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Quinn', numericId: 133, name: 'Quinn', role: 'TOP', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'W > Q > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Rakan', numericId: 497, name: 'Rakan', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Valor' },
  { id: 'Rammus', numericId: 33, name: 'Rammus', role: 'JUNGLE', damageType: 'MIXED', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Precisión' },
  { id: 'RekSai', numericId: 421, name: 'Rek\'Sai', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Rell', numericId: 526, name: 'Rell', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Valor' },
  { id: 'Renata', numericId: 888, name: 'Renata Glasc', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8465, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Renekton', numericId: 58, name: 'Renekton', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Rengar', numericId: 107, name: 'Rengar', role: 'JUNGLE', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Riven', numericId: 92, name: 'Riven', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Rumble', numericId: 68, name: 'Rumble', role: 'TOP', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Ryze', numericId: 13, name: 'Ryze', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Samira', numericId: 360, name: 'Samira', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Sejuani', numericId: 113, name: 'Sejuani', role: 'JUNGLE', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Precisión' },
  { id: 'Senna', numericId: 235, name: 'Senna', role: 'SUPPORT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Seraphine', numericId: 147, name: 'Seraphine', role: 'BOT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Sett', numericId: 875, name: 'Sett', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Shaco', numericId: 35, name: 'Shaco', role: 'JUNGLE', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 9923, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Shen', numericId: 98, name: 'Shen', role: 'TOP', damageType: 'MIXED', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Shyvana', numericId: 102, name: 'Shyvana', role: 'JUNGLE', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Singed', numericId: 27, name: 'Singed', role: 'TOP', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Sion', numericId: 14, name: 'Sion', role: 'TOP', damageType: 'AD', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Sivir', numericId: 15, name: 'Sivir', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Skarner', numericId: 72, name: 'Skarner', role: 'JUNGLE', damageType: 'AD', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Smolder', numericId: 901, name: 'Smolder', role: 'BOT', damageType: 'TRUE', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8021, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Sona', numericId: 37, name: 'Sona', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Precisión' },
  { id: 'Soraka', numericId: 16, name: 'Soraka', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Swain', numericId: 50, name: 'Swain', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Sylas', numericId: 517, name: 'Sylas', role: 'MID', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Syndra', numericId: 134, name: 'Syndra', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'TahmKench', numericId: 223, name: 'Tahm Kench', role: 'TOP', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Taliyah', numericId: 163, name: 'Taliyah', role: 'JUNGLE', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Talon', numericId: 91, name: 'Talon', role: 'MID', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Taric', numericId: 44, name: 'Taric', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Valor' },
  { id: 'Teemo', numericId: 17, name: 'Teemo', role: 'TOP', damageType: 'AP', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > Q > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Thresh', numericId: 412, name: 'Thresh', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8351, primaryTree: 'Inspiración', secondaryTree: 'Valor' },
  { id: 'Tristana', numericId: 18, name: 'Tristana', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'E > Q > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Trundle', numericId: 48, name: 'Trundle', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Tryndamere', numericId: 23, name: 'Tryndamere', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'TwistedFate', numericId: 4, name: 'Twisted Fate', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Twitch', numericId: 29, name: 'Twitch', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'E > Q > W', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
  { id: 'Udyr', numericId: 77, name: 'Udyr', role: 'JUNGLE', damageType: 'AP', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'R > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Urgot', numericId: 6, name: 'Urgot', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Varus', numericId: 110, name: 'Varus', role: 'BOT', damageType: 'MIXED', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Vayne', numericId: 67, name: 'Vayne', role: 'BOT', damageType: 'TRUE', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Veigar', numericId: 45, name: 'Veigar', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Velkoz', numericId: 161, name: 'Vel\'Koz', role: 'MID', damageType: 'TRUE', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Vex', numericId: 711, name: 'Vex', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Vi', numericId: 254, name: 'Vi', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Viego', numericId: 234, name: 'Viego', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Viktor', numericId: 112, name: 'Viktor', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'E > Q > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Vladimir', numericId: 8, name: 'Vladimir', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: false, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8230, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Volibear', numericId: 106, name: 'Volibear', role: 'TOP', damageType: 'MIXED', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Precisión' },
  { id: 'Warwick', numericId: 19, name: 'Warwick', role: 'JUNGLE', damageType: 'MIXED', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Xayah', numericId: 498, name: 'Xayah', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Xerath', numericId: 101, name: 'Xerath', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'XinZhao', numericId: 5, name: 'Xin Zhao', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'W > E > Q', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Yasuo', numericId: 157, name: 'Yasuo', role: 'MID', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Yone', numericId: 777, name: 'Yone', role: 'MID', damageType: 'MIXED', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Yorick', numericId: 83, name: 'Yorick', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: false, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Yuumi', numericId: 350, name: 'Yuumi', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Zac', numericId: 154, name: 'Zac', role: 'JUNGLE', damageType: 'AP', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8439, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Zed', numericId: 238, name: 'Zed', role: 'MID', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Zeri', numericId: 221, name: 'Zeri', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Ziggs', numericId: 115, name: 'Ziggs', role: 'BOT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Zilean', numericId: 26, name: 'Zilean', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Zoe', numericId: 142, name: 'Zoe', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Zyra', numericId: 143, name: 'Zyra', role: 'SUPPORT', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > E > W', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  // Modern Champions
  { id: 'Ambessa', numericId: 799, name: 'Ambessa', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Locke', numericId: 805, name: 'Locke', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Mel', numericId: 800, name: 'Mel', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8229, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Yunara', numericId: 804, name: 'Yunara', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Zaahen', numericId: 904, name: 'Zaahen', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'KSante', numericId: 897, name: 'K\'Sante', role: 'TOP', damageType: 'AD', combatClass: 'TANK', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8437, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Milio', numericId: 902, name: 'Milio', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8214, primaryTree: 'Brujería', secondaryTree: 'Inspiración' },
  { id: 'Naafiri', numericId: 950, name: 'Naafiri', role: 'MID', damageType: 'AD', combatClass: 'ASSASSIN_AD', hasHardCc: false, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Precisión' },
  { id: 'Nilah', numericId: 895, name: 'Nilah', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > E > W', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Renata', numericId: 888, name: 'Renata Glasc', role: 'SUPPORT', damageType: 'AP', combatClass: 'SUPPORT_ENCHANTER', hasHardCc: true, hasHeavyHealing: false, isHighBurst: false, isHighRange: false, skillOrder: 'E > W > Q', keystoneId: 8465, primaryTree: 'Valor', secondaryTree: 'Inspiración' },
  { id: 'Sett', numericId: 875, name: 'Sett', role: 'TOP', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Valor' },
  { id: 'Lillia', numericId: 876, name: 'Lillia', role: 'JUNGLE', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: true, isHighBurst: false, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8010, primaryTree: 'Precisión', secondaryTree: 'Brujería' },
  { id: 'Smolder', numericId: 901, name: 'Smolder', role: 'BOT', damageType: 'AD', combatClass: 'MARKSMAN', hasHardCc: false, hasHeavyHealing: false, isHighBurst: false, isHighRange: true, skillOrder: 'Q > W > E', keystoneId: 8008, primaryTree: 'Precisión', secondaryTree: 'Inspiración' },
  { id: 'Vex', numericId: 711, name: 'Vex', role: 'MID', damageType: 'AP', combatClass: 'MAGE', hasHardCc: true, hasHeavyHealing: false, isHighBurst: true, isHighRange: false, skillOrder: 'Q > W > E', keystoneId: 8112, primaryTree: 'Dominación', secondaryTree: 'Brujería' },
  { id: 'Briar', numericId: 233, name: 'Briar', role: 'JUNGLE', damageType: 'AD', combatClass: 'BRUISER', hasHardCc: true, hasHeavyHealing: true, isHighBurst: true, isHighRange: false, skillOrder: 'W > Q > E', keystoneId: 8005, primaryTree: 'Precisión', secondaryTree: 'Dominación' },
];

export const CHAMPION_METADATA_MAP: Record<number, ChampionMetadata> = {};
CHAMPION_METADATA_LIST.forEach((c) => {
  CHAMPION_METADATA_MAP[c.numericId] = c;
});

/**
 * Obtiene los metadatos de combate de un campeón por su ID numérico de Riot
 */
export const getChampionByNumericId = (numericId: number): ChampionMetadata | undefined => {
  return CHAMPION_METADATA_MAP[numericId];
};

/**
 * Obtiene los metadatos de combate de un campeón por su nombre o ID de cadena
 */
export const getChampionByName = (nameOrId: string): ChampionMetadata | undefined => {
  if (!nameOrId) return undefined;
  const clean = nameOrId.trim().toLowerCase();
  return CHAMPION_METADATA_LIST.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
  );
};

/**
 * Resuelve metadatos seguros de un campeón por ID numérico o nombre, con fallback robusto
 */
export const resolveChampionInfo = (idOrName: number | string): ChampionMetadata => {
  const cleanStr = String(idOrName || '').trim();
  const numericVal = typeof idOrName === 'number'
    ? idOrName
    : (/^\d+$/.test(cleanStr) ? parseInt(cleanStr, 10) : undefined);

  if (numericVal !== undefined) {
    const found = getChampionByNumericId(numericVal);
    if (found) return found;
  }
  const foundByName = getChampionByName(cleanStr);
  if (foundByName) return foundByName;

  // Fallback seguro si es un campeón nuevo no registrado
  const nameStr = cleanStr;
  return {
    id: nameStr.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown',
    numericId: numericVal !== undefined ? numericVal : 9999,
    name: nameStr || 'Campeón Desconocido',
    role: 'MID',
    damageType: 'AD',
    combatClass: 'BRUISER',
    hasHardCc: false,
    hasHeavyHealing: false,
    isHighBurst: false,
    isHighRange: false,
    skillOrder: 'Q > W > E',
    keystoneId: 8010,
    primaryTree: 'Precisión',
    secondaryTree: 'Inspiración',
  };
};

/**
 * Sincroniza dinámicamente el catálogo oficial de campeones de Riot Data Dragon
 * Garantiza que cualquier campeón recién lanzado sea indexado por su clave numérica
 */
export const syncOfficialChampionCatalog = async (patch?: string): Promise<number> => {
  const targetPatch = patch || getCurrentPatchSync();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${targetPatch}/data/es_ES/champion.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        let loaded = 0;
        Object.values(data.data).forEach((raw: any) => {
          const numId = parseInt(raw.key, 10);
          if (!isNaN(numId)) {
            if (!CHAMPION_METADATA_MAP[numId]) {
              const tags: string[] = raw.tags || [];
              let combatClass: ChampionMetadata['combatClass'] = 'BRUISER';
              if (tags.includes('Marksman')) combatClass = 'MARKSMAN';
              else if (tags.includes('Mage')) combatClass = 'MAGE';
              else if (tags.includes('Tank')) combatClass = 'TANK';
              else if (tags.includes('Assassin')) combatClass = 'ASSASSIN_AD';
              else if (tags.includes('Support')) combatClass = 'SUPPORT_ENCHANTER';

              const meta: ChampionMetadata = {
                id: raw.id,
                numericId: numId,
                name: raw.name || raw.id,
                role: 'MID',
                damageType: tags.includes('Mage') ? 'AP' : 'AD',
                combatClass,
                hasHardCc: false,
                hasHeavyHealing: false,
                isHighBurst: tags.includes('Assassin') || tags.includes('Mage'),
                isHighRange: tags.includes('Marksman') || tags.includes('Mage'),
                skillOrder: 'Q > W > E',
                keystoneId: tags.includes('Mage') ? 8229 : 8010,
                primaryTree: tags.includes('Mage') ? 'Brujería' : 'Precisión',
                secondaryTree: 'Inspiración',
              };
              CHAMPION_METADATA_MAP[numId] = meta;
              CHAMPION_METADATA_LIST.push(meta);
            }
            if (!LOL_CHAMPIONS.some((c) => c.id === raw.id)) {
              LOL_CHAMPIONS.push({
                id: raw.id,
                name: raw.name || raw.id,
                normalizedName: (raw.name || raw.id).toLowerCase(),
              });
            }
            loaded++;
          }
        });
        return loaded;
      }
    }
  } catch {
    // Ignore fetch failure in offline/fallback mode
  }
  return CHAMPION_METADATA_LIST.length;
};

/**
 * Valida si un campeón existe oficialmente
 */
export const isValidChampion = (idOrName: number | string): boolean => {
  if (typeof idOrName === 'number') {
    return !!CHAMPION_METADATA_MAP[idOrName];
  }
  return !!getChampionByName(idOrName);
};

