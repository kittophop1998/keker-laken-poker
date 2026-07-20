/**
 * Single source of truth for the eight creatures in the deck.
 * The Thai `name` is the wire value — it must match ANIMALS in pages/api/socketio.ts.
 */

export interface Creature {
  /** Wire value. Matches the server's ANIMALS list. */
  name: string;
  en: string;
  image: string;
  /** Category shown as a small symbol on the card face. */
  category: 'แมลง' | 'แมง' | 'สัตว์เลี้ยงลูกด้วยนม' | 'สัตว์ครึ่งบกครึ่งน้ำ';
  /** Card tint — pairs with the silhouette, never the only identifier. */
  tint: string;
}

export const CREATURES: Creature[] = [
  { name: 'แมลงสาบ', en: 'Cockroach', image: '/Cockroach.png', category: 'แมลง', tint: '#7B5A3E' },
  { name: 'หนู', en: 'Rat', image: '/Rat.png', category: 'สัตว์เลี้ยงลูกด้วยนม', tint: '#756E62' },
  { name: 'แมลงเขียว', en: 'Cricket', image: '/Cricket.png', category: 'แมลง', tint: '#5F7A3A' },
  { name: 'แมงมุม', en: 'Spider', image: '/Spider.png', category: 'แมง', tint: '#302E28' },
  { name: 'แมลงวัน', en: 'Fly', image: '/Fly.png', category: 'แมลง', tint: '#4D7D91' },
  { name: 'ค้างคาว', en: 'Bat', image: '/Bat.png', category: 'สัตว์เลี้ยงลูกด้วยนม', tint: '#74649A' },
  { name: 'กบ', en: 'Frog', image: '/Frog.png', category: 'สัตว์ครึ่งบกครึ่งน้ำ', tint: '#6B8E5A' },
  { name: 'แมงป่อง', en: 'Scorpion', image: '/Scorpion.png', category: 'แมง', tint: '#B84A3A' },
];

export const CREATURE_NAMES = CREATURES.map((c) => c.name);

const BY_NAME = new Map(CREATURES.map((c) => [c.name, c]));

export const getCreature = (name: string): Creature => BY_NAME.get(name) ?? CREATURES[0];
export const creatureImage = (name: string): string => getCreature(name).image;
