require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Attribute = require('../models/Attribute');
const { MONGO_URI } = require('../config');

// Category slug mapping
const CATEGORY_MAPPING = {
  'nuoc-hoa-nam': {
    name: 'Nước hoa Nam',
    slug: 'nuoc-hoa-nam'
  },
  'nuoc-hoa-nu': {
    name: 'Nước hoa Nữ',
    slug: 'nuoc-hoa-nu'
  },
  'nuoc-hoa-unisex': {
    name: 'Nước hoa Unisex',
    slug: 'nuoc-hoa-unisex'
  },
  'nuoc-hoa-niche': {
    name: 'Nước hoa Niche',
    slug: 'nuoc-hoa-niche'
  }
};

// Cache for categories and attributes
const categoryCache = new Map();
const attributeCache = new Map();

// Get or create category
async function getOrCreateCategory(categorySlug) {
  if (categoryCache.has(categorySlug)) {
    return categoryCache.get(categorySlug);
  }

  const categoryInfo = CATEGORY_MAPPING[categorySlug];
  if (!categoryInfo) {
    throw new Error(`Unknown category slug: ${categorySlug}`);
  }

  let category = await Category.findOne({ slug: categoryInfo.slug });
  
  if (!category) {
    category = new Category({
      name: categoryInfo.name,
      slug: categoryInfo.slug,
      isActive: true
    });
    await category.save();
    console.log(`✅ Created category: ${categoryInfo.name}`);
  }

  categoryCache.set(categorySlug, category);
  return category;
}

// Get or create attribute
async function getOrCreateAttribute(type, value) {
  if (!value || value.trim() === '' || value === '&nbsp;') {
    return null;
  }

  const cacheKey = `${type}:${value}`;
  if (attributeCache.has(cacheKey)) {
    return attributeCache.get(cacheKey);
  }

  let attribute = await Attribute.findOne({ type, value: value.trim() });
  
  if (!attribute) {
    attribute = new Attribute({
      type,
      value: value.trim(),
      isActive: true
    });
    await attribute.save();
    console.log(`✅ Created attribute: ${type} = ${value.trim()}`);
  }

  attributeCache.set(cacheKey, attribute);
  return attribute;
}

// Process a single product
async function processProduct(productData) {
  try {
    // Get or create category
    const category = await getOrCreateCategory(productData.categorySlug);
    
    // Build attributes object with ObjectIds
    const attributes = {};
    
    if (productData.attributes.brand) {
      attributes.brand = await getOrCreateAttribute('brand', productData.attributes.brand);
    }
    
    if (productData.attributes.gender) {
      attributes.gender = await getOrCreateAttribute('gender', productData.attributes.gender);
    }
    
    if (productData.attributes.origin) {
      attributes.origin = await getOrCreateAttribute('origin', productData.attributes.origin);
    }
    
    if (productData.attributes.concentration) {
      attributes.concentration = await getOrCreateAttribute('concentration', productData.attributes.concentration);
    }
    
    if (productData.attributes.perfumer) {
      attributes.perfumer = await getOrCreateAttribute('perfumer', productData.attributes.perfumer);
    }
    
    if (productData.attributes.scentGroup) {
      attributes.scentGroup = await getOrCreateAttribute('scentGroup', productData.attributes.scentGroup);
    }
    
    // Style is a string, not an ObjectId
    if (productData.attributes.style) {
      attributes.style = productData.attributes.style;
    }

    // Check if product already exists (by name)
    const existingProduct = await Product.findOne({ name: productData.name });
    
    if (existingProduct) {
      console.log(`⏭️  Skipping existing product: ${productData.name}`);
      return { skipped: true, product: existingProduct };
    }

    // Create product
    const product = new Product({
      name: productData.name,
      description: productData.description || '',
      category: category._id,
      attributes,
      variants: productData.variants || [],
      images: productData.images || [],
      isActive: productData.isActive !== false
    });

    await product.save();
    console.log(`✅ Imported product: ${productData.name}`);
    return { skipped: false, product };
  } catch (error) {
    console.error(`❌ Error processing product ${productData.name}:`, error.message);
    return { error: error.message };
  }
}

// Import products from JSON file
async function importFromFile(filePath) {
  try {
    console.log(`\n📂 Reading file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContent);
    
    if (!Array.isArray(products)) {
      throw new Error('JSON file must contain an array of products');
    }

    console.log(`📦 Found ${products.length} products to import\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] Processing: ${product.name}`);
      
      const result = await processProduct(product);
      
      if (result.error) {
        errorCount++;
      } else if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${products.length}`);

    return { successCount, skippedCount, errorCount, total: products.length };
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get file path from command line argument or use default
    const filePath = process.argv[2] || path.join(__dirname, 'scraped_all_products.json');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      console.log('\nUsage: node scripts/importScrapedData.js [path_to_json_file]');
      console.log('Example: node scripts/importScrapedData.js scripts/scraped_all_products.json');
      process.exit(1);
    }

    // Import products
    await importFromFile(filePath);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Import completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  importFromFile,
  processProduct,
  getOrCreateCategory,
  getOrCreateAttribute
};

