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
  /** List price in fillér. Discounted when `salePercent` is set. */
  priceCents: number;
  isAvailable?: boolean;
  /** Percent off the list price. Marks the item as on sale. */
  salePercent?: number;
  imageUrl?: string;
  /** EU major allergens present in the dish. */
  allergens: string[];
  /** Estimated nutrition for one serving. */
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface SeedRestaurant {
  key: string;
  name: string;
  description: string;
  cuisine: string;
  /** Average guest rating, one decimal place, between 0.0 and 5.0. */
  rating: number;
  address: string;
  imageUrl: string;
  menu: SeedMenuItem[];
}

const RESTAURANTS: SeedRestaurant[] = [
  {
    key: 'bella-napoli',
    name: 'Bella Napoli',
    description:
      'Fatüzelésű nápolyi pizzák és friss tészta, minden reggel házilag készítve.',
    cuisine: 'Olasz',
    rating: 4.8,
    address: '12 Király utca, Budapest',
    imageUrl: '/images/restaurants/bella-napoli.webp',
    menu: [
      {
        key: 'margherita',
        name: 'Pizza Margherita',
        description: 'San Marzano paradicsom, fior di latte, bazsalikom és olívaolaj.',
        priceCents: 349_000,
        imageUrl: '/images/foods/pizza-margherita.webp',
        allergens: ['glutén', 'tej'],
        caloriesKcal: 810,
        proteinGrams: 34,
        carbsGrams: 96,
        fatGrams: 26,
      },
      {
        key: 'diavola',
        name: 'Pizza Diavola',
        description: 'Csípős szalámi, paradicsom, mozzarella és chiliolaj.',
        priceCents: 399_000,
        salePercent: 20,
        imageUrl: '/images/foods/pizza-diavola.webp',
        allergens: ['glutén', 'tej'],
        caloriesKcal: 920,
        proteinGrams: 40,
        carbsGrams: 94,
        fatGrams: 40,
      },
      {
        key: 'quattro-formaggi',
        name: 'Quattro Formaggi',
        description: 'Mozzarella, gorgonzola, parmezán és fontina.',
        priceCents: 429_000,
        imageUrl: '/images/foods/quattro-formaggi-pizza-001.webp',
        allergens: ['glutén', 'tej'],
        caloriesKcal: 990,
        proteinGrams: 44,
        carbsGrams: 86,
        fatGrams: 50,
      },
      {
        key: 'carbonara',
        name: 'Spaghetti Carbonara',
        description: 'Guanciale, tojássárgája, pecorino romano és fekete bors.',
        priceCents: 369_000,
        imageUrl: '/images/foods/spaghetti-carbonara.webp',
        allergens: ['glutén', 'tojás', 'tej'],
        caloriesKcal: 760,
        proteinGrams: 30,
        carbsGrams: 74,
        fatGrams: 36,
      },
      {
        key: 'tiramisu',
        name: 'Tiramisù',
        description: 'Mascarpone krém, eszpresszóban áztatott babapiskóta és kakaó.',
        priceCents: 189_000,
        salePercent: 15,
        imageUrl: '/images/foods/tiramisu.webp',
        allergens: ['glutén', 'tojás', 'tej'],
        caloriesKcal: 430,
        proteinGrams: 8,
        carbsGrams: 44,
        fatGrams: 24,
      },
    ],
  },
  {
    key: 'tokyo-ramen-bar',
    name: 'Tokyo Ramen Bar',
    description:
      'Lassan főzött alaplevek, kézzel húzott tészták és japán utcai klasszikusok.',
    cuisine: 'Japán',
    rating: 4.6,
    address: '7 Dob utca, Budapest',
    imageUrl: '/images/restaurants/tokyo-ramen-bar.webp',
    menu: [
      {
        key: 'tonkotsu',
        name: 'Tonkotsu Ramen',
        description: '18 órán át főzött sertéscsont-leves, chashu, ajitama és nori.',
        priceCents: 429_000,
        imageUrl: '/images/foods/tonkotsu-ramen.webp',
        allergens: ['glutén', 'tojás', 'szója', 'szezámmag'],
        caloriesKcal: 790,
        proteinGrams: 38,
        carbsGrams: 84,
        fatGrams: 30,
      },
      {
        key: 'shoyu',
        name: 'Shoyu Ramen',
        description: 'Szójaszószos csirkealaplé, bambuszrügy és újhagyma.',
        priceCents: 399_000,
        imageUrl: '/images/foods/shoyu-ramen.webp',
        allergens: ['glutén', 'szója', 'szezámmag'],
        caloriesKcal: 650,
        proteinGrams: 28,
        carbsGrams: 88,
        fatGrams: 14,
      },
      {
        key: 'gyoza',
        name: 'Pork Gyoza (6 pcs)',
        description: 'Serpenyőben sült gombócok ponzu mártással.',
        priceCents: 219_000,
        salePercent: 20,
        imageUrl: '/images/foods/pork-gyoza.webp',
        allergens: ['glutén', 'szója', 'szezámmag'],
        caloriesKcal: 390,
        proteinGrams: 16,
        carbsGrams: 40,
        fatGrams: 18,
      },
      {
        key: 'karaage',
        name: 'Chicken Karaage',
        description: 'Ropogós, pácolt csirkecomb yuzu majonézzel.',
        priceCents: 249_000,
        imageUrl: '/images/foods/chicken-karaage.webp',
        allergens: ['glutén', 'tojás', 'szója'],
        caloriesKcal: 540,
        proteinGrams: 34,
        carbsGrams: 26,
        fatGrams: 32,
      },
      {
        key: 'matcha-mochi',
        name: 'Matcha Mochi',
        description: 'Puha rizssütemény matcha krémmel.',
        priceCents: 169_000,
        isAvailable: false,
        imageUrl: '/images/foods/matcha-mochi.webp',
        allergens: ['tej'],
        caloriesKcal: 290,
        proteinGrams: 5,
        carbsGrams: 46,
        fatGrams: 9,
      },
    ],
  },
  {
    key: 'burger-district',
    name: 'Burger District',
    description:
      'Szárazérlelt marhából készült smash burgerek, ropogós hasábburgonya és sűrű turmixok.',
    cuisine: 'Amerikai',
    rating: 3.9,
    address: '45 Andrássy út, Budapest',
    imageUrl: '/images/restaurants/burger-district.webp',
    menu: [
      {
        key: 'classic-smash',
        name: 'Classic Smash Burger',
        description: 'Dupla marhapogácsa, cheddar, savanyú uborka és házi szósz.',
        priceCents: 389_000,
        salePercent: 15,
        imageUrl: '/images/foods/classic-smash-burger.webp',
        allergens: ['glutén', 'tojás', 'tej', 'mustár'],
        caloriesKcal: 910,
        proteinGrams: 50,
        carbsGrams: 44,
        fatGrams: 58,
      },
      {
        key: 'bbq-bacon',
        name: 'BBQ Bacon Burger',
        description: 'Marhapogácsa, füstölt bacon, hagymakarikák és BBQ-szósz.',
        priceCents: 429_000,
        imageUrl: '/images/foods/bbq-bacon-burger.webp',
        allergens: ['glutén', 'tej', 'mustár'],
        caloriesKcal: 990,
        proteinGrams: 52,
        carbsGrams: 50,
        fatGrams: 62,
      },
      {
        key: 'veggie',
        name: 'Crispy Veggie Burger',
        description: 'Csicseriborsó-pogácsa, avokádó, paradicsom és vegán aioli.',
        priceCents: 349_000,
        imageUrl: '/images/foods/crispy-veggie-burger.webp',
        allergens: ['glutén'],
        caloriesKcal: 640,
        proteinGrams: 18,
        carbsGrams: 72,
        fatGrams: 28,
      },
      {
        key: 'fries',
        name: 'Truffle Fries',
        description: 'Kézzel vágott hasábburgonya, szarvasgombaolaj és parmezán.',
        priceCents: 169_000,
        salePercent: 25,
        imageUrl: '/images/foods/truffle-fries.webp',
        allergens: ['tej'],
        caloriesKcal: 490,
        proteinGrams: 9,
        carbsGrams: 44,
        fatGrams: 32,
      },
      {
        key: 'milkshake',
        name: 'Vanilla Milkshake',
        description: 'Madagaszkári vaníliafagylalt és tejszínhab.',
        priceCents: 179_000,
        imageUrl: '/images/foods/vanilla-milkshake.webp',
        allergens: ['tej'],
        caloriesKcal: 560,
        proteinGrams: 11,
        carbsGrams: 70,
        fatGrams: 24,
      },
    ],
  },
  {
    key: 'green-bowl',
    name: 'Green Bowl',
    description:
      'Friss, szezonális tálak és saláták, növényi fehérjében gazdagon.',
    cuisine: 'Egészséges',
    rating: 4.9,
    address: '3 Szent István tér, Budapest',
    imageUrl: '/images/restaurants/green-bowl.webp',
    menu: [
      {
        key: 'buddha-bowl',
        name: 'Buddha Bowl',
        description: 'Quinoa, sült édesburgonya, csicseriborsó és tahini.',
        priceCents: 369_000,
        salePercent: 20,
        imageUrl: '/images/foods/buddha-bowl.webp',
        allergens: ['szezámmag'],
        caloriesKcal: 630,
        proteinGrams: 20,
        carbsGrams: 80,
        fatGrams: 22,
      },
      {
        key: 'poke-salmon',
        name: 'Salmon Poke',
        description: 'Sushirizs, pácolt lazac, edamame és mangó.',
        priceCents: 459_000,
        imageUrl: '/images/foods/salmon-poke.webp',
        allergens: ['hal', 'szója', 'szezámmag'],
        caloriesKcal: 590,
        proteinGrams: 34,
        carbsGrams: 64,
        fatGrams: 18,
      },
      {
        key: 'caesar',
        name: 'Chicken Caesar Salad',
        description: 'Grillezett csirke, római saláta, kruton és parmezán.',
        priceCents: 329_000,
        imageUrl: '/images/foods/caesar-salad.webp',
        allergens: ['glutén', 'tojás', 'hal', 'tej'],
        caloriesKcal: 550,
        proteinGrams: 38,
        carbsGrams: 16,
        fatGrams: 36,
      },
      {
        key: 'smoothie',
        name: 'Green Smoothie',
        description: 'Spenót, banán, alma, gyömbér és zabtej.',
        priceCents: 169_000,
        imageUrl: '/images/foods/green-smoothie.webp',
        allergens: ['glutén'],
        caloriesKcal: 190,
        proteinGrams: 4,
        carbsGrams: 38,
        fatGrams: 3,
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

/** Rounds a discounted forint price to the nearest 10 Ft, stored as fillér. */
function toMenuItemData(item: Omit<SeedMenuItem, 'key'>) {
  const { salePercent, priceCents, isAvailable, imageUrl, ...rest } = item;
  const base = {
    ...rest,
    isAvailable: isAvailable ?? true,
    imageUrl: imageUrl ?? null,
  };

  if (!salePercent) {
    return {
      ...base,
      priceCents,
      isOnSale: false,
      compareAtPriceCents: null,
    };
  }

  const discountedForint =
    Math.round((priceCents / 100) * ((100 - salePercent) / 100) / 10) * 10;

  return {
    ...base,
    priceCents: discountedForint * 100,
    isOnSale: true,
    compareAtPriceCents: priceCents,
  };
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
        const data = toMenuItemData(item);
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
