import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Idempotent seed: every record gets a deterministic UUID derived from a
 * stable key, so re-running the seed updates rows instead of duplicating
 * them and never touches existing orders.
 */

const BCRYPT_SALT_ROUNDS = 12;

const DEMO_USER = {
  name: 'Demo Customer',
  email: 'demo@example.com',
  password: 'Demo1234!',
};

interface SeedMenuItem {
  key: string;
  name: string;
  description: string;
  priceCents: number;
  isAvailable?: boolean;
}

interface SeedRestaurant {
  key: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  menu: SeedMenuItem[];
}

const RESTAURANTS: SeedRestaurant[] = [
  {
    key: 'bella-napoli',
    name: 'Bella Napoli',
    description:
      'Wood-fired Neapolitan pizzas and fresh pasta made from scratch every morning.',
    cuisine: 'Italian',
    address: '12 Király utca, Budapest',
    menu: [
      {
        key: 'margherita',
        name: 'Pizza Margherita',
        description: 'San Marzano tomato, fior di latte, basil, olive oil.',
        priceCents: 1190,
      },
      {
        key: 'diavola',
        name: 'Pizza Diavola',
        description: 'Spicy salami, tomato, mozzarella, chili oil.',
        priceCents: 1390,
      },
      {
        key: 'quattro-formaggi',
        name: 'Quattro Formaggi',
        description: 'Mozzarella, gorgonzola, parmigiano and fontina.',
        priceCents: 1450,
      },
      {
        key: 'carbonara',
        name: 'Spaghetti Carbonara',
        description: 'Guanciale, egg yolk, pecorino romano, black pepper.',
        priceCents: 1290,
      },
      {
        key: 'tiramisu',
        name: 'Tiramisù',
        description: 'Mascarpone cream, espresso-soaked savoiardi, cocoa.',
        priceCents: 650,
      },
    ],
  },
  {
    key: 'tokyo-ramen-bar',
    name: 'Tokyo Ramen Bar',
    description:
      'Slow-simmered broths, hand-pulled noodles and Japanese street food classics.',
    cuisine: 'Japanese',
    address: '7 Dob utca, Budapest',
    menu: [
      {
        key: 'tonkotsu',
        name: 'Tonkotsu Ramen',
        description: '18-hour pork bone broth, chashu, ajitama, nori.',
        priceCents: 1590,
      },
      {
        key: 'shoyu',
        name: 'Shoyu Ramen',
        description: 'Soy-based chicken broth, bamboo shoots, scallions.',
        priceCents: 1450,
      },
      {
        key: 'gyoza',
        name: 'Pork Gyoza (6 pcs)',
        description: 'Pan-fried dumplings with ponzu dipping sauce.',
        priceCents: 790,
      },
      {
        key: 'karaage',
        name: 'Chicken Karaage',
        description: 'Crispy marinated chicken thighs, yuzu mayo.',
        priceCents: 890,
      },
      {
        key: 'matcha-mochi',
        name: 'Matcha Mochi',
        description: 'Soft rice cakes filled with matcha cream.',
        priceCents: 550,
        isAvailable: false,
      },
    ],
  },
  {
    key: 'burger-district',
    name: 'Burger District',
    description:
      'Smash burgers from dry-aged beef, crispy fries and thick milkshakes.',
    cuisine: 'American',
    address: '45 Andrássy út, Budapest',
    menu: [
      {
        key: 'classic-smash',
        name: 'Classic Smash Burger',
        description: 'Double beef patty, cheddar, pickles, house sauce.',
        priceCents: 1350,
      },
      {
        key: 'bbq-bacon',
        name: 'BBQ Bacon Burger',
        description: 'Beef patty, smoked bacon, onion rings, BBQ sauce.',
        priceCents: 1550,
      },
      {
        key: 'veggie',
        name: 'Crispy Veggie Burger',
        description: 'Chickpea patty, avocado, tomato, vegan aioli.',
        priceCents: 1250,
      },
      {
        key: 'fries',
        name: 'Truffle Fries',
        description: 'Hand-cut fries, truffle oil, parmesan.',
        priceCents: 590,
      },
      {
        key: 'milkshake',
        name: 'Vanilla Milkshake',
        description: 'Madagascar vanilla ice cream, whipped cream.',
        priceCents: 620,
      },
    ],
  },
  {
    key: 'green-bowl',
    name: 'Green Bowl',
    description:
      'Fresh, seasonal bowls and salads packed with plant-based protein.',
    cuisine: 'Healthy',
    address: '3 Szent István tér, Budapest',
    menu: [
      {
        key: 'buddha-bowl',
        name: 'Buddha Bowl',
        description: 'Quinoa, roasted sweet potato, chickpeas, tahini.',
        priceCents: 1290,
      },
      {
        key: 'poke-salmon',
        name: 'Salmon Poke',
        description: 'Sushi rice, marinated salmon, edamame, mango.',
        priceCents: 1590,
      },
      {
        key: 'caesar',
        name: 'Chicken Caesar Salad',
        description: 'Grilled chicken, romaine, croutons, parmesan.',
        priceCents: 1190,
      },
      {
        key: 'smoothie',
        name: 'Green Smoothie',
        description: 'Spinach, banana, apple, ginger, oat milk.',
        priceCents: 590,
      },
    ],
  },
];

const ID_NAMESPACE = 'mini-food-seed';

/** Deterministic, RFC 4122 compliant (version 5 style) UUID from a key. */
function stableId(key: string): string {
  const hex = createHash('sha1')
    .update(`${ID_NAMESPACE}:${key}`)
    .digest('hex')
    .slice(0, 32)
    .split('');
  hex[12] = '5'; // version
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16); // variant
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

async function seedDemoUser(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(
    DEMO_USER.password,
    BCRYPT_SALT_ROUNDS,
  );
  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash,
    },
  });
}

async function seedRestaurants(prisma: PrismaClient): Promise<void> {
  for (const { key, menu, ...restaurant } of RESTAURANTS) {
    const restaurantId = stableId(`restaurant:${key}`);

    await prisma.$transaction(async (tx) => {
      await tx.restaurant.upsert({
        where: { id: restaurantId },
        update: restaurant,
        create: { id: restaurantId, ...restaurant },
      });

      for (const { key: itemKey, ...item } of menu) {
        const data = { ...item, isAvailable: item.isAvailable ?? true };
        const menuItemId = stableId(`menu-item:${key}:${itemKey}`);
        await tx.menuItem.upsert({
          where: { id: menuItemId },
          update: data,
          create: { id: menuItemId, restaurantId, ...data },
        });
      }
    });
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await seedDemoUser(prisma);
    await seedRestaurants(prisma);

    const menuItemCount = RESTAURANTS.reduce((n, r) => n + r.menu.length, 0);
    console.log(
      `Seeded ${RESTAURANTS.length} restaurants, ${menuItemCount} menu items ` +
        `and demo user ${DEMO_USER.email} / ${DEMO_USER.password}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
