require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Attribute = require('../models/Attribute');
const { MONGO_URI } = require('../config');

// Category name mapping to slug
const CATEGORY_SLUG_MAP = {
  'Nước hoa nam': 'nuoc-hoa-nam',
  'Nước hoa nữ': 'nuoc-hoa-nu',
  'Nước hoa unisex': 'nuoc-hoa-unisex',
  'Nước hoa niche': 'nuoc-hoa-niche'
};

// Cache để lưu ObjectId đã tạo (tránh query lại database)
const cache = {
  categories: new Map(), // key: categoryName -> value: ObjectId
  attributes: new Map()  // key: "type:value" -> value: ObjectId
};

// Helper: Convert category name to slug
function categoryNameToSlug(categoryName) {
  return CATEGORY_SLUG_MAP[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
}

// Get or create category (with cache)
async function getOrCreateCategory(categoryName) {
  // Check cache first
  if (cache.categories.has(categoryName)) {
    return cache.categories.get(categoryName);
  }

  const slug = categoryNameToSlug(categoryName);
  
  // Try to find existing category
  let category = await Category.findOne({ 
    $or: [
      { name: categoryName },
      { slug: slug }
    ]
  });
  
  // Create if not exists
  if (!category) {
    category = new Category({
      name: categoryName,
      slug: slug,
      isActive: true
    });
    await category.save();
    console.log(`✅ Created category: ${categoryName} (${slug})`);
  } else {
    console.log(`📦 Found existing category: ${categoryName}`);
  }

  // Store in cache
  cache.categories.set(categoryName, category._id);
  return category._id;
}

// Get or create attribute (with cache)
async function getOrCreateAttribute(type, value) {
  // Skip if value is empty or null
  if (!value || value.trim() === '' || value === '&nbsp;') {
    return null;
  }

  const cacheKey = `${type}:${value.trim()}`;
  
  // Check cache first
  if (cache.attributes.has(cacheKey)) {
    return cache.attributes.get(cacheKey);
  }

  // Try to find existing attribute
  let attribute = await Attribute.findOne({ 
    type: type,
    value: value.trim()
  });
  
  // Create if not exists
  if (!attribute) {
    attribute = new Attribute({
      type: type,
      value: value.trim(),
      isActive: true
    });
    await attribute.save();
    console.log(`✅ Created attribute: ${type} = ${value.trim()}`);
  } else {
    console.log(`📦 Found existing attribute: ${type} = ${value.trim()}`);
  }

  // Store in cache
  cache.attributes.set(cacheKey, attribute._id);
  return attribute._id;
}

// Process a single product
async function processProduct(productData, index, total) {
  try {
    console.log(`\n[${index + 1}/${total}] Processing: ${productData.name}`);

    // Get or create category
    const categoryId = await getOrCreateCategory(productData.categoryName);
    
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

    // Check if product already exists (by name or originUrl)
    const existingProduct = await Product.findOne({
      $or: [
        { name: productData.name },
        { originUrl: productData.originUrl }
      ]
    });
    
    if (existingProduct) {
      console.log(`⏭️  Skipping existing product: ${productData.name}`);
      return { skipped: true, product: existingProduct };
    }

    // Prepare variants
    const variants = (productData.variants || []).map(variant => ({
      volume: variant.volume,
      price: variant.price
    }));

    // Create product
    const product = new Product({
      name: productData.name,
      description: productData.description || '',
      category: categoryId,
      attributes,
      variants: variants,
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

// Main function
async function main() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read crawled products file
    const filePath = path.join(__dirname, '../crawled_products.json');
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      console.log('\nPlease make sure crawled_products.json exists in the server directory.');
      process.exit(1);
    }

    console.log(`📂 Reading file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContent);
    
    if (!Array.isArray(products)) {
      throw new Error('JSON file must contain an array of products');
    }

    console.log(`📦 Found ${products.length} products to import\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const result = await processProduct(product, i, products.length);
      
      if (result.error) {
        errorCount++;
      } else if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Import Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${products.length}`);
    console.log(`\n💾 Cache Statistics:`);
    console.log(`   📁 Categories cached: ${cache.categories.size}`);
    console.log(`   🏷️  Attributes cached: ${cache.attributes.size}`);
    console.log(`${'='.repeat(60)}\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Import completed!');
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
  getOrCreateCategory,
  getOrCreateAttribute,
  processProduct
};

