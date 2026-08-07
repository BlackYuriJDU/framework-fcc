/**
 * Phone normalization.
 * Returns cleaned digits only, or null if invalid.
 */
export function normalizePhone(value) {
  if (!value) return null;

  const digits = String(value).replace(/\D/g, "");

  // Brazilian mobile: 11 digits (55 + DDD2 + 9 + number7)
  // Brazilian landline: 10 digits (55 + DDD2 + 8 digits)
  // Without country code: 10-11 digits
  if (digits.length === 13 && digits.startsWith("55")) {
    return digits; // +55 (DDD) 9xxxx-xxxx
  }
  if (digits.length === 12 && digits.startsWith("55")) {
    return digits; // +55 (DDD) xxxx-xxxx
  }
  if (digits.length === 11 && !digits.startsWith("55")) {
    return `55${digits}`; // Add country code
  }
  if (digits.length === 10 && !digits.startsWith("55")) {
    return `55${digits}`; // Add country code
  }

  // Too short or too long — not a valid Brazilian phone
  return null;
}

/**
 * Instagram username normalization.
 * Returns @username or null.
 */
export function normalizeInstagram(value) {
  if (!value) return null;

  const str = String(value).trim();

  // Extract from full URL
  const urlMatch = str.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i
  );
  if (urlMatch) {
    const username = urlMatch[1].split(/[/?#]/)[0].replace(/^@/, "").trim();
    if (isValidInstagramUsername(username)) {
      return `@${username}`;
    }
    return null;
  }

  // Already @username format
  let username = str.replace(/^@/, "").trim();
  if (isValidInstagramUsername(username)) {
    return `@${username}`;
  }

  return null;
}

function isValidInstagramUsername(username) {
  if (!username || username.length < 2 || username.length > 30) return false;

  const invalid = [
    "reel", "reels", "p", "explore", "popular",
    "stories", "accounts", "direct", "about", "tags",
    "oauth", "oauth2", "login", "signup", "register",
    "blog", "help", "support", "api", "press",
  ];

  return !invalid.includes(username.toLowerCase());
}

/**
 * URL normalization.
 */
export function normalizeUrl(value) {
  if (!value) return null;

  let url = String(value).trim();

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/**
 * Business name normalization.
 */
export function normalizeName(value) {
  if (!value) return "";

  return String(value)
    .trim()
    .replace(/\s*\(@[^)]+\)\s*/g, "")      // Remove (@username)
    .replace(/\s*[|•·–-]\s*(Instagram|Facebook|Tripadvisor).*$/gi, "")
    .replace(/\s*Instagram photos and videos.*$/gi, "")
    .replace(/\s*See Instagram photos and videos.*$/gi, "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .trim();
}

/**
 * City normalization.
 */
const CITY_MAP = {
  "sao paulo": "São Paulo",
  "sp": "São Paulo",
  "sp city": "São Paulo",
  "sampa": "São Paulo",
  "rio de janeiro": "Rio de Janeiro",
  "rj": "Rio de Janeiro",
  "belo horizonte": "Belo Horizonte",
  "bh": "Belo Horizonte",
  "salvador": "Salvador",
  "soteropolis": "Salvador",
  "fortaleza": "Fortaleza",
  "curitiba": "Curitiba",
  "recife": "Recife",
  "porto alegre": "Porto Alegre",
  "poa": "Porto Alegre",
  "brasilia": "Brasília",
  "bsb": "Brasília",
  "goiania": "Goiânia",
  "manaus": "Manaus",
  "belem": "Belém",
  "natal": "Natal",
  "joao pessoa": "João Pessoa",
  "jp": "João Pessoa",
  "maceio": "Maceió",
  "aracaju": "Aracaju",
  "florianopolis": "Florianópolis",
  "floripa": "Florianópolis",
  "santos": "Santos",
  "campinas": "Campinas",
  "ribeirao preto": "Ribeirão Preto",
  "uberlandia": "Uberlândia",
  "londrina": "Londrina",
  "maringa": "Maringá",
  "joinville": "Joinville",
  "cuiaba": "Cuiabá",
  "campo grande": "Campo Grande",
  "teresina": "Teresina",
  "sao luis": "São Luís",
  "palmas": "Palmas",
  "vitoria": "Vitória",
};

export function normalizeCity(value) {
  if (!value) return null;

  const normalized = String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  return CITY_MAP[normalized] || value.trim();
}

/**
 * State normalization — returns uppercase UF.
 */
const STATE_MAP = {
  acre: "AC", alagoas: "AL", amapa: "AP", "amapá": "AP",
  amazonas: "AM", bahia: "BA", "bahia": "BA",
  ceara: "CE", "ceará": "CE",
  "distrito federal": "DF", "distrito federal": "DF",
  "espirito santo": "ES", "espírito santo": "ES",
  goias: "GO", "goiás": "GO",
  maranhao: "MA", "maranhão": "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA", "pará": "PA",
  paraiba: "PB", "paraíba": "PB",
  parana: "PR", "paraná": "PR",
  pernambuco: "PE",
  piaui: "PI", "piauí": "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO", "rondônia": "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP", "são paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

export function normalizeState(value) {
  if (!value) return null;

  const normalized = String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  // Already a valid UF
  if (/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i.test(normalized)) {
    return normalized.toUpperCase();
  }

  return STATE_MAP[normalized] || null;
}

/**
 * Normalize all contact fields of a lead object.
 */
export function normalizeLead(lead) {
  if (!lead || typeof lead !== "object") return lead;

  return {
    ...lead,
    nome: normalizeName(lead.nome || ""),
    instagram: normalizeInstagram(lead.instagram || lead.fonte || ""),
    telefone: normalizePhone(lead.telefone || lead.whatsapp || ""),
    whatsapp: normalizePhone(lead.whatsapp || lead.telefone || ""),
    cidade: normalizeCity(lead.cidade || ""),
    estado: normalizeState(lead.estado || ""),
    site: normalizeUrl(lead.site || ""),
    fonte: normalizeUrl(lead.fonte || ""),
  };
}

export default {
  normalizePhone,
  normalizeInstagram,
  normalizeUrl,
  normalizeName,
  normalizeCity,
  normalizeState,
  normalizeLead,
};
