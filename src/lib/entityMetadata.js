const ENTITY_METADATA_RAW = {
  "Banco de Costa Rica": {
    website: "https://www.bancobcr.com/",
    domain: "bancobcr.com",
    logoKey: "banco-de-costa-rica",
  },
  "Banco Nacional de Costa Rica": {
    website: "https://www.bncr.fi.cr/",
    domain: "bncr.fi.cr",
    logoKey: "banco-nacional",
  },
  "Banco Popular y de Desarrollo Comunal": {
    website: "https://www.bancopopular.fi.cr/",
    domain: "bancopopular.fi.cr",
    logoKey: "banco-popular",
  },
  "Banco BAC San José S.A.": {
    website: "https://www.baccredomatic.com/es-cr",
    domain: "baccredomatic.com",
    logoKey: "bac",
  },
  "Banco BCT S.A.": {
    website: "https://bancobct.com/",
    domain: "bancobct.com",
    logoKey: "bct",
  },
  "Banco Davivienda (Costa Rica) S.A": {
    website: "https://www.davivienda.cr/",
    domain: "davivienda.cr",
    logoKey: "davivienda",
  },
  "Banco General (Costa Rica) S.A.": {
    website: "https://www.bgeneral.com/",
    domain: "bgeneral.com",
    logoKey: "banco-general",
  },
  "Banco Improsa S.A.": {
    website: "https://www.grupoimprosa.com/",
    domain: "grupoimprosa.com",
    logoKey: "banco-improsa",
  },
  "Banco Lafise S.A.": {
    website: "https://www.lafise.com/",
    domain: "lafise.com",
    logoKey: "lafise",
  },
  "Banco Promérica S.A.": {
    website: "https://promerica.fi.cr/",
    domain: "promerica.fi.cr",
    logoKey: "promerica",
  },
  "DAVIBANK de Costa Rica S.A.": {
    website: "https://www.davibank.com/",
    domain: "davibank.com",
    logoKey: "davibank",
  },
  "Financiera Cafsa S.A.": {
    website: "https://www.cafsa.fi.cr/",
    domain: "cafsa.fi.cr",
    logoKey: "cafsa",
  },
  "Financiera MultiMoney S.A.": {
    website: "https://multimoney.com/cr",
    domain: "multimoney.com",
    logoKey: "multimoney",
  },
  "Grupo Mutual Alajuela - La Vivienda de Ahorro y Préstamo": {
    website: "https://www.grupomutual.fi.cr/",
    domain: "grupomutual.fi.cr",
    logoKey: "grupo-mutual",
  },
  "Coope-ANDE N°1 R.L.": {
    website: "https://www.coopeande1.com/",
    domain: "coopeande1.com",
    logoKey: "coope-ande",
  },
  "Coopecaja R.L.": {
    website: "https://coopecaja.fi.cr/",
    domain: "coopecaja.fi.cr",
    logoKey: "coopecaja",
  },
  "Cooperativa COOCIQUE R.L.": {
    website: "https://coocique.fi.cr/",
    domain: "coocique.fi.cr",
    logoKey: "coocique",
  },
  "Cooperativa CREDECOOP R.L.": {
    website: "https://www.credecoop.fi.cr/",
    domain: "credecoop.fi.cr",
    logoKey: "credecoop",
  },
  "Cooperativa Nacional de Educadores R.L. (COOPENAE)": {
    website: "https://www.coopenae.fi.cr/",
    domain: "coopenae.fi.cr",
    logoKey: "coopenae",
  },
  "Airpak Casa de Cambio": {
    website: "https://airpak.com/",
    domain: "airpak.com",
    logoKey: "airpak",
  },
  "ARI Casa de Cambio Internacional S.A.": {
    website: "https://ari.cr/",
    domain: "ari.cr",
    logoKey: "ari",
  },
  "Casa de Cambio Global Exchange": {
    website: "https://www.globalexchange.co.cr/es/",
    domain: "globalexchange.co.cr",
    logoKey: "global-exchange",
  },
  "Casa de Cambio Teledolar S. A.": {
    website: "https://teledolar.com/",
    domain: "teledolar.com",
    logoKey: "teledolar",
  },
  "BN Valores S.A., Puesto de Bolsa": {
    website: "https://www.bnvalores.com/",
    domain: "bnvalores.com",
    logoKey: "bn-valores",
  },
  "Popular Valores, Puesto de Bolsa": {
    website: "https://www.bancopopular.fi.cr/popular-valores",
    domain: "bancopopular.fi.cr",
    logoKey: "popular-valores",
  },
  "PRIVAL Securities Puesto de Bolsa S.A": {
    website: "https://prival.com/",
    domain: "prival.com",
    logoKey: "prival",
  },
};

function normalizeEntityName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ENTITY_METADATA = Object.fromEntries(
  Object.entries(ENTITY_METADATA_RAW).map(([name, meta]) => [normalizeEntityName(name), meta])
);

function getFaviconUrl(website) {
  if (!website) return null;
  try {
    const url = new URL(website);
    return `${url.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export function getEntityMetadata(name) {
  const metadata = ENTITY_METADATA[normalizeEntityName(name)] ?? null;
  if (!metadata) {
    return {
      website: null,
      domain: null,
      logoKey: null,
      localLogo: null,
      faviconUrl: null,
    };
  }

  const localLogo = metadata.logoKey ? [
    `/logos/entities/${metadata.logoKey}.svg`,
    `/logos/entities/${metadata.logoKey}.png`,
    `/logos/entities/${metadata.logoKey}.webp`,
    `/logos/entities/${metadata.logoKey}.jpg`,
  ] : [];
  const faviconUrl = getFaviconUrl(metadata.website);

  return {
    ...metadata,
    localLogo,
    faviconUrl,
  };
}

export function getEntityInitials(name) {
  return name
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
