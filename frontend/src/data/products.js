export const productCategories = [
  "Flyy-Tees", 
  "Flyy-Hoodies", 
  "Flyy-Sweaters", 
  "Flyy-Jackets", 
  "Flyy-Shorts", 
  "Flyy-Trousers"
];

export const collections = [
  { title: "New Arrivals", tag: "Just landed", image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/6aa52fe63_generated_19cea5a8.png", href: "#featured-products" },
  { title: "Trending", tag: "Street luxury", image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", href: "#featured-products" },
  { title: "Accessories", tag: "Final details", image: "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eb69a86b4_generated_23860402.png", href: "#featured-products" },
  { title: "Limited Edition", tag: "Rare release", image: "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", href: "#featured-products" }
];

export const products = [
  {
    id: "onyx-flight-bomber",
    name: "Onyx Flight Bomber",
    category: "Flyy-Jackets",
    brand: "AstonnyFlyy",
    price: 240,
    discountPrice: 198,
    description: "A structured luxury bomber built for movement, attitude, and elevated street presence.",
    images: ["https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", "https://media.base44.com/images/public/6a2c25958136d9426eca8288/6aa52fe63_generated_19cea5a8.png"],
    video: "",
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
    id: "noir-sculpt-dress",
    name: "Noir Sculpt Dress",
    category: "Dresses",
    brand: "AstonnyFlyy",
    price: 320,
    discountPrice: null,
    description: "A clean sculptural silhouette with editorial energy and all-night confidence.",
    images: ["https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png", "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"],
    video: "",
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
    id: "aureate-runner-sneaker",
    name: "Aureate Runner Sneaker",
    category: "Sneakers",
    brand: "AstonnyFlyy",
    price: 210,
    discountPrice: 175,
    description: "A premium sneaker shaped for city speed, studio detail, and everyday statement styling.",
    images: ["https://media.base44.com/images/public/6a2c25958136d9426eca8288/7548f3882_generated_45604660.png", "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"],
    video: "",
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
    id: "midnight-axis-watch",
    name: "Midnight Axis Watch",
    category: "Watches",
    brand: "AstonnyFlyy",
    price: 420,
    discountPrice: null,
    description: "A sharp black-metal timepiece with quiet luxury detailing and a modern urban profile.",
    images: ["https://media.base44.com/images/public/6a2c25958136d9426eca8288/314c2c788_generated_a67c64d2.png", "https://media.base44.com/images/public/6a2c25958136d9426eca8288/eb69a86b4_generated_23860402.png"],
    video: "",
    sizes: ["One Size"],
    colors: ["Black Steel", "Gold"],
    sku: "AF-WCH-004",
    tags: ["accessories", "luxury", "gift"],
    stockStatus: "Limited Stock",
    featured: true,
    newArrival: false,
    bestseller: true
  }
];

export const impactStats = [
  { value: 50000, suffix: "+", label: "Community Members" },
  { value: 100000, suffix: "+", label: "Products Sold" },
  { value: 30, suffix: "+", label: "Countries Reached" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" }
];