export interface Product {
  id: string;
  type: 'affiliate' | 'physical' | 'digital';
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  // Affiliate
  amazonUrl?: string;
  externalPrice?: string;
  externalRating?: number;
  externalReviewCount?: number;
  // Physical
  variants?: { id: string; size: string; material: string; stock: number; sku: string; priceOverride?: number }[];
  // Digital
  fileFormats?: string[];
  previewImageUrl?: string;
  downloadLimit?: number;
}

export const products: Product[] = [
  // Affiliate products
  {
    id: 'aff-1',
    type: 'affiliate',
    title: 'Cricut Maker 3',
    slug: 'cricut-maker-3',
    description: 'The ultimate smart cutting machine for all your DIY projects. Cuts 300+ materials with precision and ease.',
    price: 0,
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'],
    tags: ['cutting machine', 'craft tools', 'electronics'],
    isActive: true,
    amazonUrl: 'https://amazon.com/dp/example',
    externalPrice: '£349.99',
    externalRating: 4.7,
    externalReviewCount: 2841,
  },
  {
    id: 'aff-2',
    type: 'affiliate',
    title: 'Professional Craft Knife Set',
    slug: 'professional-craft-knife-set',
    description: 'Precision craft knife set with 40 blades. Perfect for intricate stencil cutting and paper crafts.',
    price: 0,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
    tags: ['tools', 'knives', 'precision'],
    isActive: true,
    amazonUrl: 'https://amazon.com/dp/example2',
    externalPrice: '£18.99',
    externalRating: 4.5,
    externalReviewCount: 1203,
  },
  {
    id: 'aff-3',
    type: 'affiliate',
    title: 'Self-Healing Cutting Mat A3',
    slug: 'self-healing-cutting-mat',
    description: 'Double-sided A3 cutting mat with grid lines. Essential surface protection for all stencil work.',
    price: 0,
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'],
    tags: ['tools', 'cutting mat', 'surface'],
    isActive: true,
    amazonUrl: 'https://amazon.com/dp/example3',
    externalPrice: '£12.99',
    externalRating: 4.6,
    externalReviewCount: 567,
  },
  {
    id: 'aff-4',
    type: 'affiliate',
    title: 'Stencil Brush Set (12 Pack)',
    slug: 'stencil-brush-set',
    description: 'Natural bristle stencil brushes in 12 sizes. Ideal for smooth, even paint application.',
    price: 0,
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'],
    tags: ['tools', 'brushes', 'painting'],
    isActive: true,
    amazonUrl: 'https://amazon.com/dp/example4',
    externalPrice: '£14.99',
    externalRating: 4.3,
    externalReviewCount: 892,
  },
  // Physical products
  {
    id: 'phy-1',
    type: 'physical',
    title: 'Mandala Flower Stencil',
    slug: 'mandala-flower-stencil',
    description: 'Hand-designed mandala flower pattern. Laser cut from durable 190 micron Mylar. Reusable and easy to clean.',
    price: 8.99,
    compareAtPrice: 12.99,
    images: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop'],
    tags: ['mandala', 'flower', 'wall art'],
    isActive: true,
    variants: [
      { id: 'v1', size: 'A4', material: 'Mylar 190μ', stock: 45, sku: 'MF-A4-M190' },
      { id: 'v2', size: 'A3', material: 'Mylar 190μ', stock: 30, sku: 'MF-A3-M190' },
      { id: 'v3', size: 'A2', material: 'Mylar 350μ', stock: 15, sku: 'MF-A2-M350', priceOverride: 14.99 },
    ],
  },
  {
    id: 'phy-2',
    type: 'physical',
    title: 'Geometric Triangle Pattern',
    slug: 'geometric-triangle-pattern',
    description: 'Modern geometric triangle repeat pattern. Perfect for accent walls, furniture, and fabric painting.',
    price: 7.99,
    images: ['https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop'],
    tags: ['geometric', 'modern', 'repeat pattern'],
    isActive: true,
    variants: [
      { id: 'v4', size: 'A4', material: 'Mylar 190μ', stock: 60, sku: 'GT-A4-M190' },
      { id: 'v5', size: 'A3', material: 'Mylar 190μ', stock: 25, sku: 'GT-A3-M190' },
    ],
  },
  {
    id: 'phy-3',
    type: 'physical',
    title: 'Botanical Leaf Border',
    slug: 'botanical-leaf-border',
    description: 'Delicate botanical leaf border stencil. Beautiful for furniture edges, picture frames, and card making.',
    price: 6.99,
    images: ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop'],
    tags: ['botanical', 'leaf', 'border'],
    isActive: true,
    variants: [
      { id: 'v6', size: '30cm strip', material: 'Mylar 190μ', stock: 50, sku: 'BL-30-M190' },
      { id: 'v7', size: '60cm strip', material: 'Mylar 190μ', stock: 35, sku: 'BL-60-M190' },
    ],
  },
  {
    id: 'phy-4',
    type: 'physical',
    title: 'Art Deco Fan Stencil',
    slug: 'art-deco-fan-stencil',
    description: 'Elegant art deco fan motif. Creates stunning repeat patterns on walls, fabrics, and furniture.',
    price: 9.99,
    images: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop'],
    tags: ['art deco', 'vintage', 'fan'],
    isActive: true,
    variants: [
      { id: 'v8', size: 'A4', material: 'Mylar 190μ', stock: 40, sku: 'AD-A4-M190' },
      { id: 'v9', size: 'A3', material: 'Mylar 350μ', stock: 20, sku: 'AD-A3-M350', priceOverride: 15.99 },
    ],
  },
  // Digital products
  {
    id: 'dig-1',
    type: 'digital',
    title: 'Wildflower Meadow SVG Bundle',
    slug: 'wildflower-meadow-svg',
    description: 'Beautiful wildflower collection with 12 individual designs. Perfect for Cricut, Silhouette, and laser cutters.',
    price: 4.99,
    compareAtPrice: 7.99,
    images: ['https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=400&fit=crop'],
    tags: ['wildflower', 'nature', 'bundle'],
    isActive: true,
    fileFormats: ['SVG', 'PNG', 'DXF'],
    downloadLimit: 5,
  },
  {
    id: 'dig-2',
    type: 'digital',
    title: 'Celestial Moon & Stars SVG',
    slug: 'celestial-moon-stars-svg',
    description: 'Dreamy celestial design featuring moon phases and stars. Ideal for wall art, t-shirts, and nursery decor.',
    price: 3.49,
    images: ['https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=400&fit=crop'],
    tags: ['celestial', 'moon', 'stars', 'nursery'],
    isActive: true,
    fileFormats: ['SVG', 'PNG', 'DXF'],
    downloadLimit: 5,
  },
  {
    id: 'dig-3',
    type: 'digital',
    title: 'Kitchen Herb Labels SVG Set',
    slug: 'kitchen-herb-labels-svg',
    description: '24 kitchen herb label designs with decorative borders. Perfect for pantry organisation and gift jars.',
    price: 5.99,
    images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop'],
    tags: ['kitchen', 'herbs', 'labels', 'organisation'],
    isActive: true,
    fileFormats: ['SVG', 'PNG'],
    downloadLimit: 5,
  },
  {
    id: 'dig-4',
    type: 'digital',
    title: 'Boho Rainbow Collection SVG',
    slug: 'boho-rainbow-svg',
    description: '8 boho rainbow designs in multiple styles. Great for nursery art, baby shower decor, and crafting.',
    price: 3.99,
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'],
    tags: ['boho', 'rainbow', 'nursery', 'baby'],
    isActive: true,
    fileFormats: ['SVG', 'PNG', 'DXF'],
    downloadLimit: 5,
  },
];

export const getProductsByType = (type: Product['type']) => products.filter(p => p.type === type && p.isActive);
export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
