export interface Cat {
  id: string;
  name: string;
  imageUrl: string;
  birthday: Date;
  favoriteToy: string;
  breed: string;
  furColor: string;
  ownerName: string;
  description: string;
  personalityTraits: string[];
  funFacts: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewCat = Omit<Cat, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateCat = Partial<NewCat>;

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