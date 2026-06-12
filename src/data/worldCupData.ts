import { Team, Group, Match, Participant } from '../types';

export const TEAMS_BY_GROUP: { [key: string]: Team[] } = {
  A: [
    { id: 'mex', name: 'México', flag: '🇲🇽', code: 'MEX', codigo: 'MX' },
    { id: 'rsa', name: 'África do Sul', flag: '🇿🇦', code: 'RSA', codigo: 'ZA' },
    { id: 'kor', name: 'Coreia do Sul', flag: '🇰🇷', code: 'KOR', codigo: 'KR' },
    { id: 'cze', name: 'Tchéquia', flag: '🇨🇿', code: 'CZE', codigo: 'CZE' },
  ],
  B: [
    { id: 'can', name: 'Canadá', flag: '🇨🇦', code: 'CAN', codigo: 'CA' },
    { id: 'bih', name: 'Bósnia e Herzegovina', flag: '🇧🇦', code: 'BIH', codigo: 'BA' },
    { id: 'qat', name: 'Catar', flag: '🇶🇦', code: 'QAT', codigo: 'QA' },
    { id: 'sui', name: 'Suíça', flag: '🇨🇭', code: 'SUI', codigo: 'CH' },
  ],
  C: [
    { id: 'bra', name: 'Brasil', flag: '🇧🇷', code: 'BRA', codigo: 'BR' },
    { id: 'mar', name: 'Marrocos', flag: '🇲🇦', code: 'MAR', codigo: 'MA' },
    { id: 'hti', name: 'Haiti', flag: '🇭🇹', code: 'HTI', codigo: 'HT' },
    { id: 'sco', name: 'Escócia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO', codigo: 'GB-SCT' },
  ],
  D: [
    { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', code: 'USA', codigo: 'US' },
    { id: 'par', name: 'Paraguai', flag: '🇵🇾', code: 'PAR', codigo: 'PY' },
    { id: 'aus', name: 'Austrália', flag: '🇦🇺', code: 'AUS', codigo: 'AU' },
    { id: 'tur', name: 'Turquia', flag: '🇹🇷', code: 'TUR', codigo: 'TR' },
  ],
  E: [
    { id: 'ger', name: 'Alemanha', flag: '🇩🇪', code: 'GER', codigo: 'DE' },
    { id: 'cuw', name: 'Curaçao', flag: '🇨🇼', code: 'CUW', codigo: 'CW' },
    { id: 'civ', name: 'Costa do Marfim', flag: '🇨🇮', code: 'CIV', codigo: 'CI' },
    { id: 'ecu', name: 'Equador', flag: '🇪🇨', code: 'ECU', codigo: 'EC' },
  ],
  F: [
    { id: 'ned', name: 'Holanda', flag: '🇳🇱', code: 'NED', codigo: 'NL' },
    { id: 'jpn', name: 'Japão', flag: '🇯🇵', code: 'JPN', codigo: 'JP' },
    { id: 'swe', name: 'Suécia', flag: '🇸🇪', code: 'SWE', codigo: 'SE' },
    { id: 'tun', name: 'Tunísia', flag: '🇹🇳', code: 'TUN', codigo: 'TN' },
  ],
  G: [
    { id: 'bel', name: 'Bélgica', flag: '🇧🇪', code: 'BEL', codigo: 'BE' },
    { id: 'egy', name: 'Egito', flag: '🇪🇬', code: 'EGY', codigo: 'EG' },
    { id: 'irn', name: 'Irã', flag: '🇮🇷', code: 'IRN', codigo: 'IR' },
    { id: 'nzl', name: 'Nova Zelândia', flag: '🇳🇿', code: 'NZL', codigo: 'NZ' },
  ],
  H: [
    { id: 'esp', name: 'Espanha', flag: '🇪🇸', code: 'ESP', codigo: 'ES' },
    { id: 'cpv', name: 'Cabo Verde', flag: '🇨🇻', code: 'CPV', codigo: 'CV' },
    { id: 'ksa', name: 'Arábia Saudita', flag: '🇸🇦', code: 'KSA', codigo: 'SA' },
    { id: 'ury', name: 'Uruguai', flag: '🇺🇾', code: 'URY', codigo: 'UY' },
  ],
  I: [
    { id: 'fra', name: 'França', flag: '🇫🇷', code: 'FRA', codigo: 'FR' },
    { id: 'sen', name: 'Senegal', flag: '🇸🇳', code: 'SEN', codigo: 'SN' },
    { id: 'irq', name: 'Iraque', flag: '🇮🇶', code: 'IRQ', codigo: 'IQ' },
    { id: 'nor', name: 'Noruega', flag: '🇳🇴', code: 'NOR', codigo: 'NO' },
  ],
  J: [
    { id: 'aut', name: 'Áustria', flag: '🇦🇹', code: 'AUT', codigo: 'AT' },
    { id: 'jor', name: 'Jordânia', flag: '🇯🇴', code: 'JOR', codigo: 'JO' },
    { id: 'arg', name: 'Argentina', flag: '🇦🇷', code: 'ARG', codigo: 'AR' },
    { id: 'alg', name: 'Argélia', flag: '🇩🇿', code: 'ALG', codigo: 'DZ' },
  ],
  K: [
    { id: 'por', name: 'Portugal', flag: '🇵🇹', code: 'POR', codigo: 'PT' },
    { id: 'cod', name: 'RD Congo', flag: '🇨🇩', code: 'COD', codigo: 'CD' },
    { id: 'uzb', name: 'Uzbequistão', flag: '🇺🇿', code: 'UZB', codigo: 'UZ' },
    { id: 'col', name: 'Colômbia', flag: '🇨🇴', code: 'COL', codigo: 'CO' },
  ],
  L: [
    { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', codigo: 'GB-ENG' },
    { id: 'hrv', name: 'Croácia', flag: '🇭🇷', code: 'HRV', codigo: 'HR' },
    { id: 'gha', name: 'Gana', flag: '🇬🇭', code: 'GHA', codigo: 'GH' },
    { id: 'pan', name: 'Panamá', flag: '🇵🇦', code: 'PAN', codigo: 'PA' },
  ],
};

const STADIUMS_AND_CITIES = [
  { stadium: 'Estádio Azteca', city: 'Cidade do México, MEX' },
  { stadium: 'MetLife Stadium', city: 'Nova York / Nova Jersey, EUA' },
  { stadium: 'SoFi Stadium', city: 'Los Angeles, EUA' },
  { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta, EUA' },
  { stadium: 'AT&T Stadium', city: 'Dallas, EUA' },
  { stadium: 'Hard Rock Stadium', city: 'Miami, EUA' },
  { stadium: 'BC Place', city: 'Vancouver, CAN' },
  { stadium: 'BMO Field', city: 'Toronto, CAN' },
  { stadium: 'Arrowhead Stadium', city: 'Kansas City, EUA' },
  { stadium: 'Gillette Stadium', city: 'Boston, EUA' },
  { stadium: 'Lincoln Financial Field', city: 'Filadélfia, EUA' },
  { stadium: 'NRG Stadium', city: 'Houston, EUA' },
  { stadium: 'Lumen Field', city: 'Seattle, EUA' },
  { stadium: 'Levi\'s Stadium', city: 'São Francisco, EUA' },
  { stadium: 'Estádio BBVA', city: 'Monterrey, MEX' },
  { stadium: 'Estádio Akron', city: 'Guadalajara, MEX' },
];

export const GROUPS: Group[] = Object.keys(TEAMS_BY_GROUP).map((groupName) => ({
  name: groupName,
  teams: TEAMS_BY_GROUP[groupName],
}));

// Programmatically generate authentic, diverse fixtures for the 12 groups so we have 72 matches.
export function generateGroupMatches(): Match[] {
  const matchesInput = [
    // GRUPO A
    { id: 1, grupo: "A", data: "11/06/2026 às 16:00", timeA: "México", timeB: "África do Sul", codigoA: "MX", codigoB: "ZA", golA: null, golB: null },
    { id: 2, grupo: "A", data: "12/06/2026 às 23:30", timeA: "Coreia do Sul", timeB: "Tchéquia", codigoA: "KR", codigoB: "CZE", golA: null, golB: null },
    { id: 3, grupo: "A", data: "18/06/2026 às 13:00", timeA: "Tchéquia", timeB: "África do Sul", codigoA: "CZE", codigoB: "ZA", golA: null, golB: null },
    { id: 4, grupo: "A", data: "18/06/2026 às 22:00", timeA: "México", timeB: "Coreia do Sul", codigoA: "MX", codigoB: "KR", golA: null, golB: null },
    { id: 5, grupo: "A", data: "24/06/2026 às 22:00", timeA: "Tchéquia", timeB: "México", codigoA: "CZE", codigoB: "MX", golA: null, golB: null },
    { id: 6, grupo: "A", data: "24/06/2026 às 22:00", timeA: "África do Sul", timeB: "Coreia do Sul", codigoA: "ZA", codigoB: "KR", golA: null, golB: null },

    // GRUPO B
    { id: 7, grupo: "B", data: "12/06/2026 às 16:00", timeA: "Canadá", timeB: "Bósnia e Herzegovina", codigoA: "CA", codigoB: "BA", golA: null, golB: null },
    { id: 8, grupo: "B", data: "13/06/2026 às 16:00", timeA: "Catar", timeB: "Suíça", codigoA: "QA", codigoB: "CH", golA: null, golB: null },
    { id: 9, grupo: "B", data: "18/06/2026 às 16:00", timeA: "Suíça", timeB: "Bósnia e Herzegovina", codigoA: "CH", codigoB: "BA", golA: null, golB: null },
    { id: 10, grupo: "B", data: "18/06/2026 às 19:00", timeA: "Canadá", timeB: "Catar", codigoA: "CA", codigoB: "QA", golA: null, golB: null },
    { id: 11, grupo: "B", data: "24/06/2026 às 16:00", timeA: "Suíça", timeB: "Canadá", codigoA: "CH", codigoB: "CA", golA: null, golB: null },
    { id: 12, grupo: "B", data: "24/06/2026 às 16:00", timeA: "Bósnia e Herzegovina", timeB: "Catar", codigoA: "BA", codigoB: "QA", golA: null, golB: null },

    // GRUPO C
    { id: 13, grupo: "C", data: "13/06/2026 às 19:00", timeA: "Brasil", timeB: "Marrocos", codigoA: "BR", codigoB: "MA", golA: null, golB: null },
    { id: 14, grupo: "C", data: "13/06/2026 às 22:00", timeA: "Haiti", timeB: "Escócia", codigoA: "HT", codigoB: "GB-SCT", golA: null, golB: null },
    { id: 15, grupo: "C", data: "19/06/2026 às 19:00", timeA: "Escócia", timeB: "Marrocos", codigoA: "GB-SCT", codigoB: "MA", golA: null, golB: null },
    { id: 16, grupo: "C", data: "19/06/2026 às 21:30", timeA: "Brasil", timeB: "Haiti", codigoA: "BR", codigoB: "HT", golA: null, golB: null },
    { id: 17, grupo: "C", data: "24/06/2026 às 19:00", timeA: "Escócia", timeB: "Brasil", codigoA: "GB-SCT", codigoB: "BR", golA: null, golB: null },
    { id: 18, grupo: "C", data: "24/06/2026 às 19:00", timeA: "Marrocos", timeB: "Haiti", codigoA: "MA", codigoB: "HT", golA: null, golB: null },

    // GRUPO D
    { id: 19, grupo: "D", data: "12/06/2026 às 22:00", timeA: "Estados Unidos", timeB: "Paraguai", codigoA: "US", codigoB: "PY", golA: null, golB: null },
    { id: 20, grupo: "D", data: "13/06/2026 às 03:00", timeA: "Austrália", timeB: "Turquia", codigoA: "AU", codigoB: "TR", golA: null, golB: null },
    { id: 21, grupo: "D", data: "19/06/2026 às 11:00", timeA: "Turquia", timeB: "Paraguai", codigoA: "TR", codigoB: "PY", golA: null, golB: null },
    { id: 22, grupo: "D", data: "19/06/2026 às 16:00", timeA: "Estados Unidos", timeB: "Austrália", codigoA: "US", codigoB: "AU", golA: null, golB: null },
    { id: 23, grupo: "D", data: "25/06/2026 às 23:00", timeA: "Turquia", timeB: "Estados Unidos", codigoA: "TR", codigoB: "US", golA: null, golB: null },
    { id: 24, grupo: "D", data: "25/06/2026 às 23:00", timeA: "Paraguai", timeB: "Austrália", codigoA: "PY", codigoB: "AU", golA: null, golB: null },

    // GRUPO E
    { id: 25, grupo: "E", data: "14/06/2026 às 14:00", timeA: "Alemanha", timeB: "Curaçao", codigoA: "DE", codigoB: "CW", golA: null, golB: null },
    { id: 26, grupo: "E", data: "16/06/2026 às 20:00", timeA: "Costa do Marfim", timeB: "Equador", codigoA: "CI", codigoB: "EC", golA: null, golB: null },
    { id: 27, grupo: "E", data: "20/06/2026 às 17:00", timeA: "Alemanha", timeB: "Costa do Marfim", codigoA: "DE", codigoB: "CI", golA: null, golB: null },
    { id: 28, grupo: "E", data: "20/06/2026 às 21:00", timeA: "Equador", timeB: "Curaçao", codigoA: "EC", codigoB: "CW", golA: null, golB: null },
    { id: 29, grupo: "E", data: "25/06/2026 às 17:00", timeA: "Equador", timeB: "Alemanha", codigoA: "EC", codigoB: "DE", golA: null, golB: null },
    { id: 30, grupo: "E", data: "25/06/2026 às 17:00", timeA: "Curaçao", timeB: "Costa do Marfim", codigoA: "CW", codigoB: "CI", golA: null, golB: null },

    // GRUPO F
    { id: 31, grupo: "F", data: "14/06/2026 às 17:00", timeA: "Holanda", timeB: "Japão", codigoA: "NL", codigoB: "JP", golA: null, golB: null },
    { id: 32, grupo: "F", data: "14/06/2026 às 23:30", timeA: "Suécia", timeB: "Tunísia", codigoA: "SE", codigoB: "TN", golA: null, golB: null },
    { id: 33, grupo: "F", data: "20/06/2026 às 01:00", timeA: "Tunísia", timeB: "Japão", codigoA: "TN", codigoB: "JP", golA: null, golB: null },
    { id: 34, grupo: "F", data: "20/06/2026 às 14:00", timeA: "Holanda", timeB: "Suécia", codigoA: "NL", codigoB: "SE", golA: null, golB: null },
    { id: 35, grupo: "F", data: "25/06/2026 às 20:00", timeA: "Tunísia", timeB: "Holanda", codigoA: "TN", codigoB: "NL", golA: null, golB: null },
    { id: 36, grupo: "F", data: "25/06/2026 às 20:00", timeA: "Japão", timeB: "Suécia", codigoA: "JP", codigoB: "SE", golA: null, golB: null },

    // GRUPO G
    { id: 37, grupo: "G", data: "15/06/2026 às 16:00", timeA: "Bélgica", timeB: "Egito", codigoA: "BE", codigoB: "EG", golA: null, golB: null },
    { id: 38, grupo: "G", data: "15/06/2026 às 22:00", timeA: "Irã", timeB: "Nova Zelândia", codigoA: "IR", codigoB: "NZ", golA: null, golB: null },
    { id: 39, grupo: "G", data: "21/06/2026 às 16:00", timeA: "Bélgica", timeB: "Irã", codigoA: "BE", codigoB: "IR", golA: null, golB: null },
    { id: 40, grupo: "G", data: "21/06/2026 às 22:00", timeA: "Nova Zelândia", timeB: "Egito", codigoA: "NZ", codigoB: "EG", golA: null, golB: null },
    { id: 41, grupo: "G", data: "27/06/2026 às 08:00", timeA: "Nova Zelândia", timeB: "Bélgica", codigoA: "NZ", codigoB: "BE", golA: null, golB: null },
    { id: 42, grupo: "G", data: "27/06/2026 às 08:00", timeA: "Egito", timeB: "Irã", codigoA: "EG", codigoB: "IR", golA: null, golB: null },

    // GRUPO H
    { id: 43, grupo: "H", data: "15/06/2026 às 13:00", timeA: "Espanha", timeB: "Cabo Verde", codigoA: "ES", codigoB: "CV", golA: null, golB: null },
    { id: 44, grupo: "H", data: "15/06/2026 às 19:00", timeA: "Arábia Saudita", timeB: "Uruguai", codigoA: "SA", codigoB: "UY", golA: null, golB: null },
    { id: 45, grupo: "H", data: "21/06/2026 às 13:00", timeA: "Espanha", timeB: "Arábia Saudita", codigoA: "ES", codigoB: "SA", golA: null, golB: null },
    { id: 46, grupo: "H", data: "21/06/2026 às 19:00", timeA: "Uruguai", timeB: "Cabo Verde", codigoA: "UY", codigoB: "CV", golA: null, golB: null },
    { id: 47, grupo: "H", data: "26/06/2026 às 21:00", timeA: "Uruguai", timeB: "Espanha", codigoA: "UY", codigoB: "ES", golA: null, golB: null },
    { id: 48, grupo: "H", data: "26/06/2026 às 21:00", timeA: "Cabo Verde", timeB: "Arábia Saudita", codigoA: "CV", codigoB: "SA", golA: null, golB: null },

    // GRUPO I
    { id: 49, grupo: "I", data: "16/06/2026 às 16:00", timeA: "França", timeB: "Senegal", codigoA: "FR", codigoB: "SN", golA: null, golB: null },
    { id: 50, grupo: "I", data: "16/06/2026 às 19:00", timeA: "Iraque", timeB: "Noruega", codigoA: "IQ", codigoB: "NO", golA: null, golB: null },
    { id: 51, grupo: "I", data: "22/06/2026 às 18:00", timeA: "França", timeB: "Iraque", codigoA: "FR", codigoB: "IQ", golA: null, golB: null },
    { id: 52, grupo: "I", data: "22/06/2026 às 21:00", timeA: "Noruega", timeB: "Senegal", codigoA: "NO", codigoB: "SN", golA: null, golB: null },
    { id: 53, grupo: "I", data: "26/06/2026 às 16:00", timeA: "Noruega", timeB: "França", codigoA: "NO", codigoB: "FR", golA: null, golB: null },
    { id: 54, grupo: "I", data: "26/06/2026 às 16:00", timeA: "Senegal", timeB: "Iraque", codigoA: "SN", codigoB: "IQ", golA: null, golB: null },

    // GRUPO J
    { id: 55, grupo: "J", data: "16/06/2026 às 01:00", timeA: "Áustria", timeB: "Jordânia", codigoA: "AT", codigoB: "JO", golA: null, golB: null },
    { id: 56, grupo: "J", data: "16/06/2026 às 22:00", timeA: "Argentina", timeB: "Argélia", codigoA: "AR", codigoB: "DZ", golA: null, golB: null },
    { id: 57, grupo: "J", data: "22/06/2026 às 00:00", timeA: "Jordânia", timeB: "Argélia", codigoA: "JO", codigoB: "DZ", golA: null, golB: null },
    { id: 58, grupo: "J", data: "22/06/2026 às 14:00", timeA: "Argentina", timeB: "Áustria", codigoA: "AR", codigoB: "AT", golA: null, golB: null },
    { id: 59, grupo: "J", data: "27/06/2026 às 23:00", timeA: "Jordânia", timeB: "Argentina", codigoA: "JO", codigoB: "AR", golA: null, golB: null },
    { id: 60, grupo: "J", data: "27/06/2026 às 23:00", timeA: "Argélia", timeB: "Áustria", codigoA: "DZ", codigoB: "AT", golA: null, golB: null },

    // GRUPO K
    { id: 61, grupo: "K", data: "17/06/2026 às 14:00", timeA: "Portugal", timeB: "RD Congo", codigoA: "PT", codigoB: "CD", golA: null, golB: null },
    { id: 62, grupo: "K", data: "17/06/2026 às 23:00", timeA: "Uzbequistão", timeB: "Colômbia", codigoA: "UZ", codigoB: "CO", golA: null, golB: null },
    { id: 63, grupo: "K", data: "23/06/2026 às 14:00", timeA: "Portugal", timeB: "Uzbequistão", codigoA: "PT", codigoB: "UZ", golA: null, golB: null },
    { id: 64, grupo: "K", data: "23/06/2026 às 23:00", timeA: "Colômbia", timeB: "RD Congo", codigoA: "CO", codigoB: "CD", golA: null, golB: null },
    { id: 65, grupo: "K", data: "27/06/2026 às 18:30", timeA: "Colômbia", timeB: "Portugal", codigoA: "CO", codigoB: "PT", golA: null, golB: null },
    { id: 66, grupo: "K", data: "27/06/2026 às 18:30", timeA: "RD Congo", timeB: "Uzbequistão", codigoA: "CD", codigoB: "UZ", golA: null, golB: null },

    // GRUPO L
    { id: 67, grupo: "L", data: "17/06/2026 às 17:00", timeA: "Inglaterra", timeB: "Croácia", codigoA: "GB-ENG", codigoB: "HR", golA: null, golB: null },
    { id: 68, grupo: "L", data: "17/06/2026 às 19:00", timeA: "Gana", timeB: "Panamá", codigoA: "GH", codigoB: "PA", golA: null, golB: null },
    { id: 69, grupo: "L", data: "23/06/2026 às 18:00", timeA: "Panamá", timeB: "Croácia", codigoA: "PA", codigoB: "HR", golA: null, golB: null },
    { id: 70, grupo: "L", data: "25/06/2026 às 17:00", timeA: "Inglaterra", timeB: "Gana", codigoA: "GB-ENG", codigoB: "GH", golA: null, golB: null },
    { id: 71, grupo: "L", data: "27/06/2026 às 18:00", timeA: "Panamá", timeB: "Inglaterra", codigoA: "PA", codigoB: "GB-ENG", golA: null, golB: null },
    { id: 72, grupo: "L", data: "27/06/2026 às 18:00", timeA: "Croácia", timeB: "Gana", codigoA: "HR", codigoB: "GH", golA: null, golB: null }
  ];

  const FIND_TEAM_BY_CODIGO: { [codigo: string]: Team } = {};
  Object.values(TEAMS_BY_GROUP).forEach((teams) => {
    teams.forEach((t) => {
      FIND_TEAM_BY_CODIGO[t.codigo!.toUpperCase()] = t;
    });
  });

  const stadiumList = STADIUMS_AND_CITIES;

  return matchesInput.map((m) => {
    const tA = FIND_TEAM_BY_CODIGO[m.codigoA.toUpperCase()];
    const tB = FIND_TEAM_BY_CODIGO[m.codigoB.toUpperCase()];

    const teamAObj: Team = tA || { id: m.codigoA.toLowerCase(), name: m.timeA, flag: '⚽', code: m.codigoA.toUpperCase(), codigo: m.codigoA };
    const teamBObj: Team = tB || { id: m.codigoB.toLowerCase(), name: m.timeB, flag: '⚽', code: m.codigoB.toUpperCase(), codigo: m.codigoB };

    const parts = m.data.split(" às ");
    const dateParts = parts[0].split("/");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const formattedTime = parts[1];

    const stadiumObj = stadiumList[(m.id - 1) % stadiumList.length];

    return {
      id: `${m.id}`,
      group: m.grupo,
      phase: 'group',
      teamA: teamAObj,
      teamB: teamBObj,
      date: formattedDate,
      time: formattedTime,
      stadium: stadiumObj.stadium,
      city: stadiumObj.city,
      scoreA: null,
      scoreB: null
    };
  });
}

// Generate some knockout stage placeholder matches to allow user to bet on higher phases.
export function generateKnockoutMatches(): Match[] {
  // Knockout stages are vacant initially, awaiting administrator mapping of qualified teams.
  return [];
}

// Default initial participants to populate the ranking with high authenticity (amigos do bolão).
export const MOCK_PARTICIPANTS_NAMES = [
  'Neymar Careca',
  'Galvão Bueno Jr.',
  'Dona Lúcia',
  'Tite de Copas',
  'Marta Rainha',
  'Renato Gaúcho',
  'Luva de Pedreiro',
  'Casimiro Miguel',
  'Milton Neves',
  'Deola do Apito'
];

// Helper to calculate score of a single bet relative to a match result:
// * 5 pontos: placar exato (ex: apostou 2x1 e foi 2x1)
// * 3 pontos: acertou o vencedor/empate e o saldo de gols (ex: apostou 2x1, foi 1x0; ou apostou 1x1, foi 2x2)
// * 1 ponto: acertou o vencedor/empate mas errou o saldo de gols (ex: apostou 2x1, foi 3x0; ou apostou 2x0, foi 2x1)
// * 0 pontos: erro total (apostou vitória de A, deu vitória de B ou empate)
export function calculateBetScore(betScoreA: number | null, betScoreB: number | null, matchScoreA: number | null, matchScoreB: number | null): number {
  if (betScoreA === null || betScoreB === null || matchScoreA === null || matchScoreB === null || matchScoreA === undefined || matchScoreB === undefined) {
    return 0; // Match hasn't happened or user did not bet
  }

  // Exact match
  if (betScoreA === matchScoreA && betScoreB === matchScoreB) {
    return 5;
  }

  // Winner or Draw condition check
  const betResult = Math.sign(betScoreA - betScoreB);
  const matchResult = Math.sign(matchScoreA - matchScoreB);

  if (betResult === matchResult) {
    // Correct outcome! Now check if they got the exact goal difference (saldo de gols)
    const betDiff = betScoreA - betScoreB;
    const matchDiff = matchScoreA - matchScoreB;
    if (betDiff === matchDiff) {
      return 3;
    } else {
      return 1;
    }
  }

  return 0;
}

const COUNTRY_TO_ISO2: { [key: string]: string } = {
  'méxico': 'MX', 'mexico': 'MX',
  'áfrica do sul': 'ZA', 'africa do sul': 'ZA',
  'coreia do sul': 'KR',
  'tchéquia': 'CZ', 'tchequia': 'CZ', 'república tcheca': 'CZ', 'republica tcheca': 'CZ',
  'canadá': 'CA', 'canada': 'CA',
  'bósnia e herzegovina': 'BA', 'bosnia e herzegovina': 'BA',
  'estados unidos': 'US',
  'paraguai': 'PY',
  'haiti': 'HT',
  'escócia': 'GB', 'escocia': 'GB',
  'austrália': 'AU', 'australia': 'AU',
  'turquia': 'TR',
  'brasil': 'BR',
  'marrocos': 'MA',
  'catar': 'QA',
  'suíça': 'CH', 'suica': 'CH',
  'costa do marfim': 'CI',
  'equador': 'EC',
  'alemanha': 'DE',
  'curaçau': 'CW', 'curacao': 'CW',
  'países baixos': 'NL', 'paises baixos': 'NL',
  'japão': 'JP', 'japao': 'JP',
  'suécia': 'SE', 'suecia': 'SE',
  'tunísia': 'TN', 'tunisia': 'TN',
  'arábia saudita': 'SA', 'arabia saudita': 'SA',
  'uruguai': 'UY',
  'espanha': 'ES',
  'cabo verde': 'CV',
  'irã': 'IR', 'irão': 'IR', 'irao': 'IR',
  'nova zelândia': 'NZ', 'nova zelandia': 'NZ',
  'bélgica': 'BE', 'belgica': 'BE',
  'egito': 'EG',
  'frança': 'FR', 'franca': 'FR',
  'jamaica': 'JM',
  'nigéria': 'NG', 'nigeria': 'NG',
  'honduras': 'HN',
  'inglaterra': 'GB',
  'peru': 'PE',
  'itália': 'IT', 'italia': 'IT',
  'argélia': 'DZ', 'argelia': 'DZ',
  'argentina': 'AR',
  'angola': 'AO',
  'portugal': 'PT',
  'albânia': 'AL', 'albania': 'AL',
  'croácia': 'HR', 'croacia': 'HR',
  'irlanda': 'IE',
  'colômbia': 'CO', 'colombia': 'CO',
  'omã': 'OM', 'oma': 'OM',
};

export function getTeamFlagUrl(team: any): string {
  if (!team) return '';
  // Try to find code
  let code = (team.codigo || team.id || '').toUpperCase();
  if (code === 'GB-ENG' || code === 'GB-SCT') {
    code = 'GB';
  }
  if (code.length === 2) {
    return `https://flagsapi.com/${code}/flat/64.png`;
  }
  // Try from name lookup if 3-letter or ID is given
  const nameClean = (team.name || '').toLowerCase().trim();
  const foundCode = COUNTRY_TO_ISO2[nameClean];
  if (foundCode) {
    return `https://flagsapi.com/${foundCode.toUpperCase()}/flat/64.png`;
  }
  // check 3-letter code
  const codeClean = (team.code || '').toUpperCase().trim();
  if (codeClean && codeClean.length === 3) {
    const map3to2: { [key: string]: string } = {
      'BRA': 'BR', 'MEX': 'MX', 'USA': 'US', 'ARG': 'AR', 'FRA': 'FR', 'ESP': 'ES',
      'GER': 'DE', 'POR': 'PT', 'ITA': 'IT', 'ENG': 'GB', 'NED': 'NL', 'BEL': 'BE',
      'ECU': 'EC', 'SWE': 'SE', 'JPN': 'JP', 'MAR': 'MA', 'RSA': 'ZA', 'CMR': 'CM',
      'PER': 'PE', 'POL': 'PL', 'KSA': 'SA', 'CAN': 'CA', 'TUR': 'TR', 'KOR': 'KR',
      'SCO': 'GB', 'NGA': 'NG', 'ALG': 'DZ', 'ROU': 'RO', 'PAN': 'PA', 'TUN': 'TN',
      'CHI': 'CL', 'UZB': 'UZ', 'PAR': 'PY', 'EGY': 'EG', 'IRN': 'IR', 'NOR': 'NO',
      'HON': 'HN', 'AUT': 'AT', 'NZL': 'NZ', 'COL': 'CO', 'UKR': 'UA', 'IRQ': 'IQ',
      'SEN': 'SN', 'VEN': 'VE', 'QAT': 'QA', 'URY': 'UY', 'HRV': 'HR', 'GHA': 'GH',
      'JAM': 'JM', 'BIH': 'BA', 'HTI': 'HT', 'CZE': 'CZ', 'ALB': 'AL', 'ANG': 'AO',
      'CPV': 'CV', 'CIV': 'CI', 'CUW': 'CW', 'IRL': 'IE', 'OMA': 'OM'
    };
    const mapped = map3to2[codeClean];
    if (mapped) {
      return `https://flagsapi.com/${mapped}/flat/64.png`;
    }
  }

  // Fallback of Brazil or empty string (it triggers the error handler cleanly)
  return '';
}
