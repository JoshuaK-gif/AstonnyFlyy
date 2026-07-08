import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...')

  // 1. Clear existing data
  await prisma.product.deleteMany({})
  await prisma.collection.deleteMany({})
  await prisma.impactStat.deleteMany({})
  await prisma.productProperty.deleteMany({})

  // 2. Seed Products
  const products = [
    {
      name: "Onyx Flight Bomber",
      category: "Jackets",
      brand: "AstonnyFlyy",

      price: 240,
      discountPrice: 198,
      description: "A structured luxury bomber built for movement, attitude, and elevated street presence.",
      images: ["https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", "https://media.base44.com/images/public/6a2c25958136d9426eca8288/6aa52fe63_generated_19cea5a8.png"],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Obsidian", "Stone", "Graphite"],
      sku: "AF-JKT-001",
      tags: ["new", "outerwear", "limited"],
      stockStatus: "In Stock",
      featured: true,
      newArrival: true,
      bestseller: true
    },
    {
      name: "Noir Sculpt Dress",
      category: "Dresses",
      brand: "AstonnyFlyy",

      price: 320,
      discountPrice: null,
      description: "A clean sculptural silhouette with editorial energy and all-night confidence.",
      images: ["https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black", "Ivory"],
      sku: "AF-DRS-002",
      tags: ["women", "evening", "signature"],
      stockStatus: "In Stock",
      featured: true,
      newArrival: false,
      bestseller: false
    },
    {
      name: "Aureate Runner Sneaker",
      category: "Sneakers",
      brand: "AstonnyFlyy",

      price: 210,
      discountPrice: 175,
      description: "A premium sneaker shaped for city speed, studio detail, and everyday statement styling.",
      images: ["https://media.base44.com/images/public/6a2c25958136d9426eca8288/7548f3882_generated_45604660.png", "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"],
      sizes: ["6", "7", "8", "9", "10", "11", "12"],
      colors: ["Cream", "Black", "Gold"],
      sku: "AF-SNK-003",
      tags: ["footwear", "bestseller", "unisex"],
      stockStatus: "In Stock",
      featured: true,
      newArrival: true,
      bestseller: true
    },
    {
      name: "Midnight Axis Watch",
      category: "Watches",
      brand: "AstonnyFlyy",

      price: 420,
      discountPrice: null,
      description: "A sharp black-metal timepiece with quiet luxury detailing and a modern urban profile.",
      images: ["https://media.base44.com/images/public/6a2c25958136d9426eca8288/314c2c788_generated_a67c64d2.png", "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eb69a86b4_generated_23860402.png"],
      sizes: ["One Size"],
      colors: ["Black Steel", "Gold"],
      sku: "AF-WCH-004",
      tags: ["accessories", "luxury", "gift"],
      stockStatus: "Limited Stock",
      featured: true,
      newArrival: false,
      bestseller: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }
  console.log('Seeded products...')

  // 3. Seed Collections
  const collections = [
    { title: "New Arrivals", tag: "Just landed", image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/6aa52fe63_generated_19cea5a8.png", href: "/shop?collection=New+Arrivals" },
    { title: "Trending", tag: "Street luxury", image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", href: "/shop?collection=Trending" },
    { title: "Accessories", tag: "Final details", image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eb69a86b4_generated_23860402.png", href: "/shop?collection=Accessories" },
    { title: "Limited Edition", tag: "Rare release", image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", href: "/shop?collection=Limited+Edition" }
  ]

  for (const collection of collections) {
    await prisma.collection.create({ data: collection })
  }
  console.log('Seeded collections...')

  // 4. Seed Impact Stats
  const impactStats = [
    { value: 50000, suffix: "+", label: "Community Members" },
    { value: 100000, suffix: "+", label: "Products Sold" },
    { value: 30, suffix: "+", label: "Countries Reached" },
    { value: 98, suffix: "%", label: "Customer Satisfaction" }
  ]

  for (const stat of impactStats) {
    await prisma.impactStat.create({ data: stat })
  }
  console.log('Seeded impact stats...')

  // 5. Seed Properties
  const properties = [
    { type: 'category', name: 'Jackets', value: 'jackets' },
    { type: 'category', name: 'Dresses', value: 'dresses' },
    { type: 'category', name: 'Sneakers', value: 'sneakers' },
    { type: 'category', name: 'Watches', value: 'watches' },
    { type: 'stockStatus', name: 'In Stock', value: 'in-stock' },
    { type: 'stockStatus', name: 'Limited Stock', value: 'limited-stock' },
    { type: 'stockStatus', name: 'Out of Stock', value: 'out-of-stock' }
  ]

  for (const prop of properties) {
    await prisma.productProperty.create({ data: prop })
  }
  console.log('Seeded properties...')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
