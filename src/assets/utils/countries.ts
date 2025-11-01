import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register the locale
countries.registerLocale(enLocale);

export interface CountryOption {
  code: string;
  name: string;
}

export interface NationalityOption {
  code: string;
  name: string;
}

// Nationality demonym mappings (country code to nationality name)
const nationalityMap: Record<string, string> = {
  AE: 'Emirati',
  AF: 'Afghan',
  AL: 'Albanian',
  DZ: 'Algerian',
  AD: 'Andorran',
  AO: 'Angolan',
  AR: 'Argentine',
  AM: 'Armenian',
  AU: 'Australian',
  AT: 'Austrian',
  AZ: 'Azerbaijani',
  BS: 'Bahamian',
  BH: 'Bahraini',
  BD: 'Bangladeshi',
  BB: 'Barbadian',
  BY: 'Belarusian',
  BE: 'Belgian',
  BZ: 'Belizean',
  BJ: 'Beninese',
  BT: 'Bhutanese',
  BO: 'Bolivian',
  BA: 'Bosnian',
  BW: 'Motswana',
  BR: 'Brazilian',
  BN: 'Bruneian',
  BG: 'Bulgarian',
  BF: 'Burkinabe',
  BI: 'Burundian',
  KH: 'Cambodian',
  CM: 'Cameroonian',
  CA: 'Canadian',
  CV: 'Cape Verdean',
  CF: 'Central African',
  TD: 'Chadian',
  CL: 'Chilean',
  CN: 'Chinese',
  CO: 'Colombian',
  KM: 'Comoran',
  CG: 'Congolese',
  CD: 'Congolese',
  CR: 'Costa Rican',
  HR: 'Croatian',
  CU: 'Cuban',
  CY: 'Cypriot',
  CZ: 'Czech',
  DK: 'Danish',
  DJ: 'Djiboutian',
  DM: 'Dominican',
  DO: 'Dominican',
  EC: 'Ecuadorean',
  EG: 'Egyptian',
  SV: 'Salvadoran',
  GQ: 'Equatorial Guinean',
  ER: 'Eritrean',
  EE: 'Estonian',
  ET: 'Ethiopian',
  FJ: 'Fijian',
  FI: 'Finnish',
  FR: 'French',
  GA: 'Gabonese',
  GM: 'Gambian',
  GE: 'Georgian',
  DE: 'German',
  GH: 'Ghanaian',
  GR: 'Greek',
  GD: 'Grenadian',
  GT: 'Guatemalan',
  GN: 'Guinean',
  GW: 'Guinea-Bissauan',
  GY: 'Guyanese',
  HT: 'Haitian',
  HN: 'Honduran',
  HU: 'Hungarian',
  IS: 'Icelandic',
  IN: 'Indian',
  ID: 'Indonesian',
  IR: 'Iranian',
  IQ: 'Iraqi',
  IE: 'Irish',
  IL: 'Israeli',
  IT: 'Italian',
  CI: 'Ivorian',
  JM: 'Jamaican',
  JP: 'Japanese',
  JO: 'Jordanian',
  KZ: 'Kazakhstani',
  KE: 'Kenyan',
  KI: 'I-Kiribati',
  KP: 'North Korean',
  KR: 'South Korean',
  KW: 'Kuwaiti',
  KG: 'Kyrgyzstani',
  LA: 'Laotian',
  LV: 'Latvian',
  LB: 'Lebanese',
  LS: 'Mosotho',
  LR: 'Liberian',
  LY: 'Libyan',
  LI: 'Liechtensteiner',
  LT: 'Lithuanian',
  LU: 'Luxembourgish',
  MK: 'Macedonian',
  MG: 'Malagasy',
  MW: 'Malawian',
  MY: 'Malaysian',
  MV: 'Maldivan',
  ML: 'Malian',
  MT: 'Maltese',
  MH: 'Marshallese',
  MR: 'Mauritanian',
  MU: 'Mauritian',
  MX: 'Mexican',
  FM: 'Micronesian',
  MD: 'Moldovan',
  MC: 'Monacan',
  MN: 'Mongolian',
  ME: 'Montenegrin',
  MA: 'Moroccan',
  MZ: 'Mozambican',
  MM: 'Burmese',
  NA: 'Namibian',
  NR: 'Nauruan',
  NP: 'Nepalese',
  NL: 'Dutch',
  NZ: 'New Zealander',
  NI: 'Nicaraguan',
  NE: 'Nigerien',
  NG: 'Nigerian',
  NO: 'Norwegian',
  OM: 'Omani',
  PK: 'Pakistani',
  PW: 'Palauan',
  PS: 'Palestinian',
  PA: 'Panamanian',
  PG: 'Papua New Guinean',
  PY: 'Paraguayan',
  PE: 'Peruvian',
  PH: 'Filipino',
  PL: 'Polish',
  PT: 'Portuguese',
  QA: 'Qatari',
  RO: 'Romanian',
  RU: 'Russian',
  RW: 'Rwandan',
  KN: 'Kittitian',
  LC: 'Saint Lucian',
  VC: 'Saint Vincentian',
  WS: 'Samoan',
  SM: 'Sammarinese',
  ST: 'Sao Tomean',
  SA: 'Saudi',
  SN: 'Senegalese',
  RS: 'Serbian',
  SC: 'Seychellois',
  SL: 'Sierra Leonean',
  SG: 'Singaporean',
  SK: 'Slovak',
  SI: 'Slovenian',
  SB: 'Solomon Islander',
  SO: 'Somali',
  ZA: 'South African',
  SS: 'South Sudanese',
  ES: 'Spanish',
  LK: 'Sri Lankan',
  SD: 'Sudanese',
  SR: 'Surinamese',
  SZ: 'Swazi',
  SE: 'Swedish',
  CH: 'Swiss',
  SY: 'Syrian',
  TW: 'Taiwanese',
  TJ: 'Tajikistani',
  TZ: 'Tanzanian',
  TH: 'Thai',
  TL: 'Timorese',
  TG: 'Togolese',
  TO: 'Tongan',
  TT: 'Trinidadian',
  TN: 'Tunisian',
  TR: 'Turkish',
  TM: 'Turkmen',
  TV: 'Tuvaluan',
  UG: 'Ugandan',
  UA: 'Ukrainian',
  GB: 'British',
  US: 'American',
  UY: 'Uruguayan',
  UZ: 'Uzbekistani',
  VU: 'Ni-Vanuatu',
  VA: 'Vatican',
  VE: 'Venezuelan',
  VN: 'Vietnamese',
  YE: 'Yemeni',
  ZM: 'Zambian',
  ZW: 'Zimbabwean',
};

// Preferred countries for default selection
export const PREFERRED_COUNTRIES = ['AE', 'EG', 'SA'];

// Get all countries with their ISO codes
export const getCountries = (
  preferredCodes: string[] = PREFERRED_COUNTRIES,
): CountryOption[] => {
  const countryObj = countries.getNames('en', { select: 'official' });
  const allCountries = Object.entries(countryObj).map(([code, name]) => ({
    code,
    name,
  }));

  // Separate preferred and other countries
  const preferred = allCountries
    .filter((country) => preferredCodes.includes(country.code))
    .sort((a, b) => {
      // Sort preferred countries by their order in preferredCodes
      return preferredCodes.indexOf(a.code) - preferredCodes.indexOf(b.code);
    });

  const others = allCountries
    .filter((country) => !preferredCodes.includes(country.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...preferred, ...others];
};

// Get nationalities with proper demonyms
export const getNationalities = (
  preferredCodes: string[] = PREFERRED_COUNTRIES,
): NationalityOption[] => {
  const countryObj = countries.getNames('en', { select: 'official' });
  const allNationalities = Object.entries(countryObj).map(
    ([code, countryName]) => ({
      code,
      name: nationalityMap[code] || countryName, // Fallback to country name if no mapping exists
    }),
  );

  // Separate preferred and other nationalities
  const preferred = allNationalities
    .filter((nationality) => preferredCodes.includes(nationality.code))
    .sort((a, b) => {
      // Sort preferred nationalities by their order in preferredCodes
      return preferredCodes.indexOf(a.code) - preferredCodes.indexOf(b.code);
    });

  const others = allNationalities
    .filter((nationality) => !preferredCodes.includes(nationality.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...preferred, ...others];
};
