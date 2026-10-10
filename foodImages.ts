/**
 * Curated, authentic food photography mapping for SmartPlate
 * Matches specific Indian dishes with high-quality, relevant food photos.
 */

export interface FoodImageMapping {
  keywords: string[];
  imageUrl: string;
  altText: string;
  illustrative: boolean;
}

export const FOOD_IMAGE_CATALOG: FoodImageMapping[] = [
  // Rice and dal / South Indian Meals
  {
    keywords: ['rice and dal', 'sambar rice', 'dal', 'sambar', 'rasam', 'curd rice', 'south indian meals', 'thali', 'meals'],
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    altText: 'Traditional South Indian cooked meal with rice, dal, sambar, and poriyal in stainless steel dishes',
    illustrative: true,
  },
  // Vegetable Biryani
  {
    keywords: ['vegetable biryani', 'veg biryani', 'veg dum biryani', 'dum biryani', 'pulao', 'ghee rice'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    altText: 'Aromatic vegetable dum biryani garnished with fried onions, cashews, and fresh coriander',
    illustrative: true,
  },
  // Chicken / Meat Biryani
  {
    keywords: ['chicken biryani', 'mutton biryani', 'hyderabadi biryani', 'meat biryani'],
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    altText: 'Steaming hot dum biryani cooked with traditional spices and saffron rice',
    illustrative: true,
  },
  // Fish Curry & Seafood
  {
    keywords: ['fish curry', 'fish', 'seafood', 'meen kulambu', 'curry house'],
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    altText: 'Traditional South Indian fish curry simmered in tamarind and aromatic coconut gravy',
    illustrative: true,
  },
  // Parotta / Roti / Chapati
  {
    keywords: ['parotta', 'paratha', 'kothu parotta', 'malabar parotta'],
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
    altText: 'Flaky layered South Indian parottas served with rich vegetable salna',
    illustrative: true,
  },
  {
    keywords: ['chapati', 'roti', 'phulka', 'naan', 'wheat bread'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
    altText: 'Fresh hot whole wheat chapatis stacked with curry',
    illustrative: true,
  },
  // Idli & Dosa
  {
    keywords: ['idli', 'idly', 'steamed idli', 'vada'],
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    altText: 'Soft steamed South Indian idlis with coconut chutney and piping hot sambar',
    illustrative: true,
  },
  {
    keywords: ['dosa', 'dosai', 'masala dosa', 'crispy dosa'],
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    altText: 'Golden brown crispy masala dosa rolled with spiced potato filling',
    illustrative: true,
  },
  // Bakery and Breads
  {
    keywords: ['bakery', 'bread', 'bun', 'buns', 'loaf', 'pastry', 'cakes', 'sweets'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    altText: 'Assortment of freshly baked whole wheat bread loaves, buns and bakery rolls',
    illustrative: true,
  },
  // Fresh Fruits
  {
    keywords: ['fruit', 'fruits', 'bananas', 'apples', 'oranges', 'pazhamudir', 'produce'],
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    altText: 'Crates of freshly harvested assorted fruits including bananas, apples, and citrus',
    illustrative: true,
  },
  // Fresh Vegetables
  {
    keywords: ['vegetable', 'vegetables', 'greens', 'tomatoes', 'potatoes', 'beans'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    altText: 'Fresh farm-harvested crisp vegetables ready for community kitchen cooking',
    illustrative: true,
  },
  // Dairy & Chilled Products
  {
    keywords: ['dairy', 'milk', 'curd', 'paneer', 'yogurt', 'butter', 'aavin'],
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800&auto=format&fit=crop&q=80',
    altText: 'Refrigerated pasteurized dairy pouches, fresh milk bottles, and packaged paneer',
    illustrative: true,
  },
  // Packaged shelf-stable goods
  {
    keywords: ['packaged', 'grains', 'cereal', 'pulses', 'dry rations', 'groceries'],
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    altText: 'Shelf-stable packaged grains, pulses, and sealed dry food packages',
    illustrative: true,
  },
];

// Fallbacks by Category
export const CATEGORY_FALLBACK_IMAGES: Record<string, { imageUrl: string; altText: string }> = {
  'Cooked meals': {
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    altText: 'Freshly prepared hot cooked meals in food-grade insulated catering trays',
  },
  'Rice & prepared dishes': {
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    altText: 'Steaming hot seasoned rice and vegetable biryani dish',
  },
  'Bakery products': {
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    altText: 'Unsold fresh bakery loaves, sweet buns and whole wheat dinner rolls',
  },
  'Fruits & vegetables': {
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    altText: 'Fresh wholesale produce and raw seasonal fruits',
  },
  'Dairy & chilled': {
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800&auto=format&fit=crop&q=80',
    altText: 'Chilled pasteurized dairy products and curd packages',
  },
  'Packaged food': {
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    altText: 'Non-perishable sealed food rations and shelf-stable packaged items',
  },
};

/**
 * Intelligent helper to find the most accurate image for any dish name or description.
 */
export function getFoodImage(
  nameOrDesc: string = '',
  category: string = 'Cooked meals',
  existingUrl?: string
): { imageUrl: string; altText: string; illustrative: boolean } {
  // If an existing verified photo is already provided, use it
  if (existingUrl && existingUrl.startsWith('http') && !existingUrl.includes('placeholder')) {
    return {
      imageUrl: existingUrl,
      altText: nameOrDesc || 'Verified food batch photograph',
      illustrative: false,
    };
  }

  const query = nameOrDesc.toLowerCase();

  for (const item of FOOD_IMAGE_CATALOG) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return {
        imageUrl: item.imageUrl,
        altText: item.altText,
        illustrative: true,
      };
    }
  }

  // Category fallback
  const fallback = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES['Cooked meals'];
  return {
    imageUrl: fallback.imageUrl,
    altText: fallback.altText,
    illustrative: true,
  };
}
