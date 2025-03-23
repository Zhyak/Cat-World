export interface Cat {
  id: string;
  name: string;
  imageUrl: string;
  birthday: Date;
  favoriteToy: string;
  description: string;
  breed: string;
  furColor: string;
  ownerName: string;
  personalityTraits: string[];
  funFacts: string[];
  createdAt: Date;
}

export const PERSONALITY_TRAITS = [
  'Juguetón',
  'Tranquilo',
  'Cariñoso',
  'Independiente',
  'Curioso',
  'Tímido',
  'Sociable',
  'Energético'
];