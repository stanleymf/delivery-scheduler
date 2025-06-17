export interface PostalCodeArea {
  code: string;
  area: string;
  city: string;
  state?: string;
  country: string;
  description?: string;
}

export interface CountryPostalCodes {
  country: string;
  areas: PostalCodeArea[];
}

export const singaporePostalCodes: PostalCodeArea[] = [
  // Central Singapore - CBD & Business Districts
  { code: "01", area: "Raffles Place", city: "Singapore", country: "Singapore", description: "Raffles Place Financial District (e.g. 010001)" },
  { code: "02", area: "Anson, Tanjong Pagar", city: "Singapore", country: "Singapore", description: "Anson & Tanjong Pagar Business District (e.g. 020001)" },
  { code: "03", area: "Queenstown, Tiong Bahru", city: "Singapore", country: "Singapore", description: "Queenstown & Tiong Bahru (e.g. 030001)" },
  { code: "04", area: "Telok Blangah, Harbourfront", city: "Singapore", country: "Singapore", description: "Telok Blangah & Harbourfront (e.g. 040001)" },
  { code: "05", area: "Pasir Panjang, Hong Leong Garden", city: "Singapore", country: "Singapore", description: "Pasir Panjang & Hong Leong Garden (e.g. 050001)" },
  { code: "06", area: "High Street, Beach Road", city: "Singapore", country: "Singapore", description: "High Street & Beach Road (e.g. 060001)" },
  { code: "07", area: "Middle Road, Golden Mile", city: "Singapore", country: "Singapore", description: "Middle Road & Golden Mile (e.g. 070001)" },
  { code: "08", area: "Little India", city: "Singapore", country: "Singapore", description: "Little India (e.g. 080001)" },
  { code: "09", area: "Orchard, Cairnhill, River Valley", city: "Singapore", country: "Singapore", description: "Orchard Road Shopping District (e.g. 090001)" },
  { code: "10", area: "Ardmore, Bukit Timah, Holland Road", city: "Singapore", country: "Singapore", description: "Ardmore & Bukit Timah (e.g. 100001)" },
  { code: "11", area: "Watten Estate, Novena, Thomson", city: "Singapore", country: "Singapore", description: "Watten Estate & Novena (e.g. 110001)" },
  
  // Residential Towns
  { code: "12", area: "Clementi", city: "Singapore", country: "Singapore", description: "Clementi (e.g. 120101)" },
  { code: "13", area: "Clementi", city: "Singapore", country: "Singapore", description: "Clementi West (e.g. 130101)" },
  { code: "14", area: "Clementi", city: "Singapore", country: "Singapore", description: "Clementi Central (e.g. 140101)" },
  { code: "15", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah (e.g. 150001)" },
  { code: "16", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah Central (e.g. 160001)" },
  { code: "17", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah West (e.g. 170001)" },
  { code: "18", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah East (e.g. 180001)" },
  { code: "19", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah South (e.g. 190001)" },
  { code: "20", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah North (e.g. 200001)" },
  { code: "21", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah Central (e.g. 210001)" },
  { code: "22", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah West (e.g. 220001)" },
  { code: "23", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah East (e.g. 230001)" },
  { code: "24", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah South (e.g. 240001)" },
  { code: "25", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah North (e.g. 250001)" },
  { code: "26", area: "Bukit Merah", city: "Singapore", country: "Singapore", description: "Bukit Merah Central (e.g. 260001)" },
  { code: "27", area: "Queenstown", city: "Singapore", country: "Singapore", description: "Queenstown (e.g. 270101)" },
  { code: "28", area: "Queenstown", city: "Singapore", country: "Singapore", description: "Queenstown Central (e.g. 280101)" },
  { code: "29", area: "Queenstown", city: "Singapore", country: "Singapore", description: "Queenstown West (e.g. 290101)" },
  { code: "30", area: "Queenstown", city: "Singapore", country: "Singapore", description: "Queenstown East (e.g. 300101)" },
  { code: "31", area: "Toa Payoh", city: "Singapore", country: "Singapore", description: "Toa Payoh (e.g. 310101)" },
  { code: "32", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa (e.g. 320101)" },
  { code: "33", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa Central (e.g. 330101)" },
  { code: "34", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa West (e.g. 340101)" },
  { code: "35", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa East (e.g. 350101)" },
  { code: "36", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa South (e.g. 360101)" },
  { code: "37", area: "Kallang/Whampoa", city: "Singapore", country: "Singapore", description: "Kallang/Whampoa North (e.g. 370101)" },
  { code: "38", area: "Geylang", city: "Singapore", country: "Singapore", description: "Geylang (e.g. 380101)" },
  { code: "39", area: "Geylang", city: "Singapore", country: "Singapore", description: "Geylang Central (e.g. 390101)" },
  { code: "40", area: "Geylang", city: "Singapore", country: "Singapore", description: "Geylang West (e.g. 400101)" },
  { code: "41", area: "Geylang", city: "Singapore", country: "Singapore", description: "Geylang East (e.g. 410101)" },
  { code: "42", area: "Geylang", city: "Singapore", country: "Singapore", description: "Geylang South (e.g. 420101)" },
  { code: "43", area: "Marine Parade", city: "Singapore", country: "Singapore", description: "Marine Parade (e.g. 430101)" },
  { code: "44", area: "Marine Parade", city: "Singapore", country: "Singapore", description: "Marine Parade Central (e.g. 440101)" },
  { code: "45", area: "Marine Parade", city: "Singapore", country: "Singapore", description: "Marine Parade West (e.g. 450101)" },
  { code: "46", area: "Bedok", city: "Singapore", country: "Singapore", description: "Bedok North (e.g. 460001)" },
  { code: "47", area: "Bedok", city: "Singapore", country: "Singapore", description: "Bedok South (e.g. 470001)" },
  { code: "48", area: "Bedok", city: "Singapore", country: "Singapore", description: "Bedok Reservoir (e.g. 480001)" },
  { code: "49", area: "Bedok", city: "Singapore", country: "Singapore", description: "Bedok Central (e.g. 490001)" },
  { code: "50", area: "Bedok", city: "Singapore", country: "Singapore", description: "Bedok West (e.g. 500001)" },
  { code: "51", area: "Pasir Ris", city: "Singapore", country: "Singapore", description: "Pasir Ris (e.g. 510101)" },
  { code: "52", area: "Tampines", city: "Singapore", country: "Singapore", description: "Tampines (e.g. 520101)" },
  { code: "53", area: "Hougang", city: "Singapore", country: "Singapore", description: "Hougang (e.g. 530101)" },
  { code: "54", area: "Sengkang", city: "Singapore", country: "Singapore", description: "Sengkang (e.g. 540101)" },
  { code: "55", area: "Serangoon", city: "Singapore", country: "Singapore", description: "Serangoon (e.g. 550101)" },
  { code: "56", area: "Ang Mo Kio", city: "Singapore", country: "Singapore", description: "Ang Mo Kio Town (e.g. 560101)" },
  { code: "57", area: "Bishan", city: "Singapore", country: "Singapore", description: "Bishan (e.g. 570101)" },
  { code: "58", area: "Bukit Timah", city: "Singapore", country: "Singapore", description: "Bukit Timah (e.g. 580101)" },
  { code: "59", area: "Bukit Timah", city: "Singapore", country: "Singapore", description: "Bukit Timah Central (e.g. 590101)" },
  { code: "60", area: "Jurong East", city: "Singapore", country: "Singapore", description: "Jurong East (e.g. 600101)" },
  { code: "61", area: "Jurong East", city: "Singapore", country: "Singapore", description: "Jurong East Central (e.g. 610101)" },
  { code: "62", area: "Jurong East", city: "Singapore", country: "Singapore", description: "Jurong East West (e.g. 620101)" },
  { code: "63", area: "Jurong East", city: "Singapore", country: "Singapore", description: "Jurong East South (e.g. 630101)" },
  { code: "64", area: "Jurong West", city: "Singapore", country: "Singapore", description: "Jurong West (e.g. 640101)" },
  { code: "65", area: "Bukit Batok", city: "Singapore", country: "Singapore", description: "Bukit Batok (e.g. 650101)" },
  { code: "66", area: "Bukit Batok", city: "Singapore", country: "Singapore", description: "Bukit Batok Central (e.g. 660101)" },
  { code: "67", area: "Bukit Panjang", city: "Singapore", country: "Singapore", description: "Bukit Panjang (e.g. 670101)" },
  { code: "68", area: "Choa Chu Kang", city: "Singapore", country: "Singapore", description: "Choa Chu Kang (e.g. 680101)" },
  { code: "69", area: "Choa Chu Kang", city: "Singapore", country: "Singapore", description: "Choa Chu Kang Central (e.g. 690101)" },
  { code: "70", area: "Choa Chu Kang", city: "Singapore", country: "Singapore", description: "Choa Chu Kang West (e.g. 700101)" },
  { code: "71", area: "Choa Chu Kang", city: "Singapore", country: "Singapore", description: "Choa Chu Kang East (e.g. 710101)" },
  { code: "72", area: "Choa Chu Kang", city: "Singapore", country: "Singapore", description: "Choa Chu Kang South (e.g. 720101)" },
  { code: "73", area: "Woodlands", city: "Singapore", country: "Singapore", description: "Woodlands (e.g. 730101)" },
  { code: "74", area: "Woodlands", city: "Singapore", country: "Singapore", description: "Woodlands Central (e.g. 740101)" },
  { code: "75", area: "Sembawang", city: "Singapore", country: "Singapore", description: "Sembawang (e.g. 750101)" },
  { code: "76", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun (e.g. 760101)" },
  { code: "77", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun Central (e.g. 770101)" },
  { code: "78", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun West (e.g. 780101)" },
  { code: "79", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun East (e.g. 790101)" },
  { code: "80", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun South (e.g. 800101)" },
  { code: "81", area: "Yishun", city: "Singapore", country: "Singapore", description: "Yishun North (e.g. 810101)" },
  { code: "82", area: "Punggol", city: "Singapore", country: "Singapore", description: "Punggol (e.g. 820101)" },
  
  // Special Areas
  { code: "018956", area: "Marina Bay", city: "Singapore", country: "Singapore", description: "Marina Bay Financial District" },
  { code: "018957", area: "Marina Bay", city: "Singapore", country: "Singapore", description: "Marina Bay Sands Area" },
  { code: "018958", area: "Marina Bay", city: "Singapore", country: "Singapore", description: "Marina Bay Gardens" },
  { code: "018959", area: "Marina Bay", city: "Singapore", country: "Singapore", description: "Marina Bay Waterfront" },
  { code: "018960", area: "Marina Bay", city: "Singapore", country: "Singapore", description: "Marina Bay Business District" },
  { code: "098269", area: "Sentosa", city: "Singapore", country: "Singapore", description: "Sentosa Island Resort" },
  { code: "098270", area: "Sentosa", city: "Singapore", country: "Singapore", description: "Sentosa Cove" },
  { code: "098271", area: "Sentosa", city: "Singapore", country: "Singapore", description: "Sentosa Beach Area" },
  { code: "819642", area: "Changi Airport", city: "Singapore", country: "Singapore", description: "Changi Airport Terminal 1" },
  { code: "819643", area: "Changi Airport", city: "Singapore", country: "Singapore", description: "Changi Airport Terminal 2" },
  { code: "819644", area: "Changi Airport", city: "Singapore", country: "Singapore", description: "Changi Airport Terminal 3" },
  { code: "819645", area: "Changi Airport", city: "Singapore", country: "Singapore", description: "Changi Airport Terminal 4" },
  { code: "819646", area: "Changi Airport", city: "Singapore", country: "Singapore", description: "Jewel Changi Airport" },
];

export const malaysiaPostalCodes: PostalCodeArea[] = [
  // Kuala Lumpur
  { code: "50000", area: "Kuala Lumpur City Centre", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", description: "KLCC and Petronas Towers Area" },
  { code: "50050", area: "Kuala Lumpur City Centre", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", description: "Bukit Bintang Shopping District" },
  { code: "50100", area: "Kuala Lumpur City Centre", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", description: "Chinatown Area" },
  { code: "50200", area: "Kuala Lumpur City Centre", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", description: "Little India Area" },
  { code: "50300", area: "Kuala Lumpur City Centre", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", description: "Masjid India Area" },
  
  // Petaling Jaya
  { code: "46000", area: "Petaling Jaya", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", description: "Petaling Jaya City Centre" },
  { code: "46100", area: "Petaling Jaya", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", description: "Petaling Jaya Old Town" },
  { code: "46200", area: "Petaling Jaya", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", description: "Petaling Jaya New Town" },
  { code: "46300", area: "Petaling Jaya", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", description: "Petaling Jaya Utara" },
  { code: "46400", area: "Petaling Jaya", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", description: "Petaling Jaya Selatan" },
  
  // Subang Jaya
  { code: "47500", area: "Subang Jaya", city: "Subang Jaya", state: "Selangor", country: "Malaysia", description: "Subang Jaya Town Centre" },
  { code: "47600", area: "Subang Jaya", city: "Subang Jaya", state: "Selangor", country: "Malaysia", description: "Subang Jaya Industrial Area" },
  { code: "47610", area: "Subang Jaya", city: "Subang Jaya", state: "Selangor", country: "Malaysia", description: "Subang Jaya Residential" },
  { code: "47620", area: "Subang Jaya", city: "Subang Jaya", state: "Selangor", country: "Malaysia", description: "Subang Jaya Commercial" },
  
  // Shah Alam
  { code: "40000", area: "Shah Alam", city: "Shah Alam", state: "Selangor", country: "Malaysia", description: "Shah Alam City Centre" },
  { code: "40100", area: "Shah Alam", city: "Shah Alam", state: "Selangor", country: "Malaysia", description: "Shah Alam Industrial Area" },
  { code: "40200", area: "Shah Alam", city: "Shah Alam", state: "Selangor", country: "Malaysia", description: "Shah Alam Residential" },
  { code: "40300", area: "Shah Alam", city: "Shah Alam", state: "Selangor", country: "Malaysia", description: "Shah Alam Commercial" },
  
  // Penang
  { code: "10000", area: "Georgetown", city: "Penang", state: "Penang", country: "Malaysia", description: "Georgetown Heritage Area" },
  { code: "10100", area: "Georgetown", city: "Penang", state: "Penang", country: "Malaysia", description: "Georgetown Commercial" },
  { code: "10200", area: "Georgetown", city: "Penang", state: "Penang", country: "Malaysia", description: "Georgetown Residential" },
  { code: "10300", area: "Bayan Lepas", city: "Penang", state: "Penang", country: "Malaysia", description: "Bayan Lepas Industrial Area" },
  { code: "10400", area: "Bayan Lepas", city: "Penang", state: "Penang", country: "Malaysia", description: "Bayan Lepas Free Trade Zone" },
  
  // Johor Bahru
  { code: "80000", area: "Johor Bahru", city: "Johor Bahru", state: "Johor", country: "Malaysia", description: "Johor Bahru City Centre" },
  { code: "80100", area: "Johor Bahru", city: "Johor Bahru", state: "Johor", country: "Malaysia", description: "Johor Bahru Commercial" },
  { code: "80200", area: "Johor Bahru", city: "Johor Bahru", state: "Johor", country: "Malaysia", description: "Johor Bahru Residential" },
  { code: "80300", area: "Johor Bahru", city: "Johor Bahru", state: "Johor", country: "Malaysia", description: "Johor Bahru Industrial" },
];

export const postalCodeData: CountryPostalCodes[] = [
  {
    country: "Singapore",
    areas: singaporePostalCodes
  },
  {
    country: "Malaysia", 
    areas: malaysiaPostalCodes
  }
];

export function getPostalCodesByCountry(country: string): PostalCodeArea[] {
  const countryData = postalCodeData.find(data => data.country === country);
  return countryData ? countryData.areas : [];
}

export function getPostalCodesByCity(country: string, city: string): PostalCodeArea[] {
  const countryData = postalCodeData.find(data => data.country === country);
  if (!countryData) return [];
  
  return countryData.areas.filter(area => area.city === city);
}

export function getPostalCodesByArea(country: string, area: string): PostalCodeArea[] {
  const countryData = postalCodeData.find(data => data.country === country);
  if (!countryData) return [];
  
  return countryData.areas.filter(postalCode => postalCode.area === area);
}

export function searchPostalCodes(query: string): PostalCodeArea[] {
  const allPostalCodes = postalCodeData.flatMap(data => data.areas);
  
  return allPostalCodes.filter(postalCode => 
    postalCode.code.includes(query) ||
    postalCode.area.toLowerCase().includes(query.toLowerCase()) ||
    postalCode.city.toLowerCase().includes(query.toLowerCase()) ||
    postalCode.description?.toLowerCase().includes(query.toLowerCase())
  );
}

export function getUniqueCities(country: string): string[] {
  const countryData = postalCodeData.find(data => data.country === country);
  if (!countryData) return [];
  
  return [...new Set(countryData.areas.map(area => area.city))];
}

export function getUniqueAreas(country: string): string[] {
  const countryData = postalCodeData.find(data => data.country === country);
  if (!countryData) return [];
  
  return [...new Set(countryData.areas.map(area => area.area))];
} 