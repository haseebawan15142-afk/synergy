/**
 * Selected Clientele — Company Profile 2026.
 * Logos sourced from the official profile grid (high-DPI WebP).
 */
export type ClientLogo = {
  name: string;
  slug: string;
  logo: string;
};

export const clienteleHeadline = "Empowering success across industries";

export const clienteleIntro =
  "A diverse portfolio of leading organizations who trust Synergy for reliable, secure, and innovative technology — relationships built over decades of delivery.";

export const clients: ClientLogo[] = [
  { name: "State Bank of Pakistan", slug: "state-bank-of-pakistan", logo: "/images/clients/state-bank-of-pakistan.webp" },
  { name: "Meezan Bank", slug: "meezan-bank", logo: "/images/clients/meezan-bank.webp" },
  { name: "Standard Chartered", slug: "standard-chartered", logo: "/images/clients/standard-chartered.webp" },
  { name: "United Bank Limited", slug: "ubl", logo: "/images/clients/ubl.webp" },
  { name: "NADRA", slug: "nadra", logo: "/images/clients/nadra.webp" },
  { name: "MOL Group", slug: "mol-group", logo: "/images/clients/mol-group.webp" },
  { name: "MCB Islamic Bank", slug: "mcb-islamic", logo: "/images/clients/mcb-islamic.webp" },
  { name: "Bank of Punjab", slug: "bank-of-punjab", logo: "/images/clients/bank-of-punjab.webp" },
  { name: "Askari Bank", slug: "askari-bank", logo: "/images/clients/askari-bank.webp" },
  { name: "Bank Makramah Limited", slug: "bank-makramah", logo: "/images/clients/bank-makramah.webp" },
  { name: "Bank of Khyber", slug: "bank-of-khyber", logo: "/images/clients/bank-of-khyber.webp" },
  { name: "Berger Paints Pakistan", slug: "berger", logo: "/images/clients/berger.webp" },
  { name: "Fatima Group", slug: "fatima-group", logo: "/images/clients/fatima-group.webp" },
  { name: "NRSP", slug: "nrsp", logo: "/images/clients/nrsp.webp" },
  { name: "MCB Bank", slug: "mcb", logo: "/images/clients/mcb.webp" },
  { name: "Allied Bank", slug: "allied-bank", logo: "/images/clients/allied-bank.webp" },
  { name: "Soneri Bank", slug: "soneri-bank", logo: "/images/clients/soneri-bank.webp" },
  { name: "Mobilink Microfinance Bank", slug: "mobilink-microfinance-bank", logo: "/images/clients/mobilink-microfinance-bank.webp" },
  { name: "Aga Khan Development Network", slug: "akdn", logo: "/images/clients/akdn.webp" },
  { name: "Zarai Taraqiati Bank Limited", slug: "ztbl", logo: "/images/clients/ztbl.webp" },
  { name: "Celerity Logistics", slug: "celerity", logo: "/images/clients/celerity.webp" },
  { name: "NRSP Microfinance Bank", slug: "nrsp-microfinance-bank", logo: "/images/clients/nrsp-microfinance-bank.webp" },
  { name: "Engro Corporation", slug: "engro", logo: "/images/clients/engro.webp" },
  { name: "Sui Northern Gas Pipelines", slug: "sngpl", logo: "/images/clients/sngpl.webp" },
  { name: "K-Electric", slug: "k-electric", logo: "/images/clients/k-electric.webp" },
  { name: "Pakistan Customs", slug: "pakistan-customs", logo: "/images/clients/pakistan-customs.webp" },
  { name: "DG Cement", slug: "dg-cement", logo: "/images/clients/dg-cement.webp" },
  { name: "National Telecommunication Corporation", slug: "ntc", logo: "/images/clients/ntc.webp" },
  { name: "Jazz", slug: "jazz", logo: "/images/clients/jazz.webp" },
  { name: "Zong 4G", slug: "zong", logo: "/images/clients/zong.webp" },
  { name: "FFBL", slug: "ffbl", logo: "/images/clients/ffbl.webp" },
  { name: "PTCL", slug: "ptcl", logo: "/images/clients/ptcl.webp" },
  { name: "KTrade Securities", slug: "ktrade", logo: "/images/clients/ktrade.webp" },
  { name: "Jahangir Siddiqui & Co.", slug: "js-group", logo: "/images/clients/js-group.webp" },
  { name: "Ghani Global Holdings", slug: "ghani", logo: "/images/clients/ghani.webp" },
  { name: "Bank AL Habib", slug: "bank-al-habib", logo: "/images/clients/bank-al-habib.webp" },
  { name: "National Bank of Oman", slug: "national-bank-of-oman", logo: "/images/clients/national-bank-of-oman.webp" },
  { name: "1LINK", slug: "1link", logo: "/images/clients/1link.webp" },
  { name: "Sindh Bank", slug: "sindh-bank", logo: "/images/clients/sindh-bank.webp" },
  { name: "McDonald's", slug: "mcdonalds", logo: "/images/clients/mcdonalds.webp" },
  { name: "National Bank of Pakistan", slug: "nbp", logo: "/images/clients/nbp.webp" },
  { name: "PARCO", slug: "parco", logo: "/images/clients/parco.webp" },
];

/** Split into N columns for Arcana-style vertical marquees */
export function splitClientColumns(list: ClientLogo[] = clients, columnCount = 3) {
  const columns: ClientLogo[][] = Array.from({ length: columnCount }, () => []);
  list.forEach((client, index) => {
    columns[index % columnCount].push(client);
  });
  return columns;
}
