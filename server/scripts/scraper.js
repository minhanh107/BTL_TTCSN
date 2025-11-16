const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Base URL
const BASE_URL = 'https://www.thegioinuochoa.com.vn';

// Category URLs mapping
const CATEGORY_URLS = {
  'nuoc-hoa-nam': 'https://www.thegioinuochoa.com.vn/nuoc-hoa-nam',
  'nuoc-hoa-nu': 'https://www.thegioinuochoa.com.vn/nuoc-hoa-nu',
  'nuoc-hoa-unisex': 'https://www.thegioinuochoa.com.vn/nuoc-hoa-unisex',
  'nuoc-hoa-niche': 'https://www.thegioinuochoa.com.vn/nuoc-hoa-niche'
};

// Delay function to avoid overwhelming the server
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch HTML content
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

// Extract product links from listing page
async function extractProductLinks(listingUrl, maxPages = 10) {
  const productLinks = new Set();
  let page = 1;
  
  while (page <= maxPages) {
    const url = page === 1 ? listingUrl : `${listingUrl}?page=${page}`;
    console.log(`Fetching page ${page} from ${url}`);
    
    const html = await fetchHTML(url);
    if (!html) break;
    
    const $ = cheerio.load(html);
    const productGrid = $('#product-grid');
    
    if (productGrid.length === 0) {
      console.log(`No product grid found on page ${page}, stopping...`);
      break;
    }
    
    // Extract product links
    productGrid.find('a.product-item-thumb').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        productLinks.add(fullUrl);
      }
    });
    
    // Check if there's a next page
    const hasNextPage = $('.pagination a').filter((i, elem) => {
      return $(elem).text().includes('Trang sau') || $(elem).text().includes('Next');
    }).length > 0;
    
    if (!hasNextPage && page > 1) {
      console.log(`No next page found, stopping at page ${page}`);
      break;
    }
    
    page++;
    await delay(2000); // Wait 2 seconds between page requests
  }
  
  return Array.from(productLinks);
}

// Extract product name from JSON-LD
function extractProductName($) {
  try {
    const jsonLdScript = $('script[type="application/ld+json"]').first().html();
    if (jsonLdScript) {
      const jsonData = JSON.parse(jsonLdScript);
      if (jsonData.name) {
        return jsonData.name.trim();
      }
    }
  } catch (error) {
    console.error('Error extracting product name from JSON-LD:', error.message);
  }
  
  // Fallback: try to get from page title or h1
  const title = $('h1').first().text().trim() || $('title').text().trim();
  return title;
}

// Extract product attributes from accordion
function extractAttributes($) {
  const attributes = {
    brand: null,
    gender: null,
    origin: null,
    concentration: null,
    perfumer: null,
    scentGroup: null,
    style: null
  };
  
  try {
    const accordionBody = $('#collapseOne .accordion-body');
    if (accordionBody.length > 0) {
      const html = accordionBody.html();
      const text = accordionBody.text();
      
      // Extract brand (Nhãn hiệu)
      const brandMatch = html.match(/<strong>Nhãn hiệu\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                        text.match(/Nhãn hiệu\s*:\s*([^\n]+)/i);
      if (brandMatch) {
        attributes.brand = brandMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
      
      // Extract gender (Giới tính)
      const genderMatch = html.match(/<strong>Giới tính\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                         text.match(/Giới tính\s*:\s*([^\n]+)/i);
      if (genderMatch) {
        attributes.gender = genderMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
      
      // Extract origin (Xuất xứ)
      const originMatch = html.match(/<strong>Xuất xứ\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                         text.match(/Xuất xứ\s*:\s*([^\n]+)/i);
      if (originMatch) {
        attributes.origin = originMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
      
      // Extract concentration (Nồng độ)
      const concentrationMatch = html.match(/<strong>Nồng độ\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                                text.match(/Nồng độ\s*:\s*([^\n]+)/i);
      if (concentrationMatch) {
        attributes.concentration = concentrationMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
      
      // Extract perfumer (Nhà pha chế)
      const perfumerMatch = html.match(/<strong>Nhà pha chế\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                            text.match(/Nhà pha chế\s*:\s*([^\n]+)/i);
      if (perfumerMatch) {
        const perfumer = perfumerMatch[1].trim().replace(/<br\s*\/?>/, '');
        if (perfumer && perfumer !== '' && perfumer !== '&nbsp;') {
          attributes.perfumer = perfumer;
        }
      }
      
      // Extract scent group (Nhóm hương)
      const scentGroupMatch = html.match(/<strong>Nhóm hương\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                              text.match(/Nhóm hương\s*:\s*([^\n]+)/i);
      if (scentGroupMatch) {
        attributes.scentGroup = scentGroupMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
      
      // Extract style (Phong cách)
      const styleMatch = html.match(/<strong>Phong cách\s*<\/strong>\s*:\s*([^<\n]+)/i) ||
                        text.match(/Phong cách\s*:\s*([^\n]+)/i);
      if (styleMatch) {
        attributes.style = styleMatch[1].trim().replace(/<br\s*\/?>/, '');
      }
    }
  } catch (error) {
    console.error('Error extracting attributes:', error.message);
  }
  
  return attributes;
}

// Extract product description
function extractDescription($) {
  try {
    const descriptionSection = $('#collapseThree .accordion-body');
    if (descriptionSection.length > 0) {
      // Get all text content, preserving structure
      let description = '';
      descriptionSection.find('p, h2, h3').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text) {
          description += text + '\n\n';
        }
      });
      return description.trim();
    }
  } catch (error) {
    console.error('Error extracting description:', error.message);
  }
  return '';
}

// Extract product images
function extractImages($) {
  const images = [];
  
  try {
    // Get additional images from img_other div first (these are usually higher quality)
    $('.img_other img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && src.trim() && !images.includes(src.trim())) {
        images.push(src.trim());
      }
    });
    
    // Get main image from JSON-LD
    const jsonLdScript = $('script[type="application/ld+json"]').first().html();
    if (jsonLdScript) {
      const jsonData = JSON.parse(jsonLdScript);
      if (jsonData.image) {
        if (Array.isArray(jsonData.image)) {
          jsonData.image.forEach(img => {
            if (img && !images.includes(img)) {
              images.push(img);
            }
          });
        } else if (typeof jsonData.image === 'string' && !images.includes(jsonData.image)) {
          images.push(jsonData.image);
        }
      }
    }
    
    // Also check for main product image in product detail
    $('.product-detail img, .product-image img, .main-product-image img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && src.includes('item_product') && !images.includes(src)) {
        images.push(src);
      }
    });
  } catch (error) {
    console.error('Error extracting images:', error.message);
  }
  
  return images;
}

// Extract product variants
function extractVariants($) {
  const variants = [];
  
  try {
    // Extract from priceItem buttons
    $('.priceItem').each((i, elem) => {
      const $elem = $(elem);
      const html = $elem.html();
      
      // Extract volume from <strong> tag
      const volumeMatch = html.match(/<strong>([^<]+)<\/strong>/);
      const volume = volumeMatch ? volumeMatch[1].trim() : '';
      
      // Extract price from text after <br> or from the text content
      const text = $elem.text().trim();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      // Price is usually on the second line or after the volume
      let priceText = '';
      if (lines.length >= 2) {
        priceText = lines[1];
      } else if (lines.length === 1) {
        // Try to extract price from the single line
        priceText = lines[0].replace(volume, '').trim();
      }
      
      // Clean price: remove dots and non-digits, keep only numbers
      priceText = priceText.replace(/\./g, '').replace(/[^\d]/g, '');
      const price = parseInt(priceText, 10);
      
      if (volume && !isNaN(price) && price > 0) {
        variants.push({
          volume: volume,
          price: price,
          stock: 0 // Default stock, can be updated later
        });
      }
    });
    
    // If no variants found from priceItem, try to get from JSON-LD
    if (variants.length === 0) {
      const jsonLdScript = $('script[type="application/ld+json"]').first().html();
      if (jsonLdScript) {
        const jsonData = JSON.parse(jsonLdScript);
        if (jsonData.offers && jsonData.offers.price) {
          // Try to extract volume from product name or page
          const productName = jsonData.name || '';
          const volumeMatch = productName.match(/(\d+\s*ML\s*[A-Z]+)/i) || 
                             productName.match(/(\d+\s*ML)/i);
          const volume = volumeMatch ? volumeMatch[1] : 'Standard';
          
          variants.push({
            volume: volume,
            price: parseInt(jsonData.offers.price, 10),
            stock: 0
          });
        }
      }
    }
  } catch (error) {
    console.error('Error extracting variants:', error.message);
  }
  
  return variants;
}

// Scrape a single product page
async function scrapeProduct(productUrl, categorySlug) {
  console.log(`Scraping product: ${productUrl}`);
  
  const html = await fetchHTML(productUrl);
  if (!html) {
    return null;
  }
  
  const $ = cheerio.load(html);
  
  const product = {
    name: extractProductName($),
    description: extractDescription($),
    categorySlug: categorySlug, // Will need to map to category ObjectId later
    attributes: extractAttributes($),
    variants: extractVariants($),
    images: extractImages($),
    isActive: true
  };
  
  // Validate required fields
  if (!product.name || product.variants.length === 0) {
    console.warn(`Skipping product due to missing required data: ${productUrl}`);
    return null;
  }
  
  return product;
}

// Main scraping function
async function scrapeCategory(categorySlug, categoryUrl, maxPages = 10) {
  console.log(`\n=== Starting to scrape category: ${categorySlug} ===`);
  
  // Extract product links
  const productLinks = await extractProductLinks(categoryUrl, maxPages);
  console.log(`Found ${productLinks.length} products in category ${categorySlug}`);
  
  // Scrape each product
  const products = [];
  for (let i = 0; i < productLinks.length; i++) {
    const link = productLinks[i];
    console.log(`\n[${i + 1}/${productLinks.length}] Processing: ${link}`);
    
    const product = await scrapeProduct(link, categorySlug);
    if (product) {
      products.push(product);
    }
    
    // Delay between requests
    await delay(3000); // Wait 3 seconds between product requests
  }
  
  return products;
}

// Main execution
async function main() {
  const allProducts = [];
  
  // Scrape all categories
  for (const [categorySlug, categoryUrl] of Object.entries(CATEGORY_URLS)) {
    try {
      const products = await scrapeCategory(categorySlug, categoryUrl, 10);
      allProducts.push(...products);
      
      // Save intermediate results
      const outputFile = path.join(__dirname, `scraped_${categorySlug}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf8');
      console.log(`\nSaved ${products.length} products to ${outputFile}`);
      
      // Longer delay between categories
      await delay(5000);
    } catch (error) {
      console.error(`Error scraping category ${categorySlug}:`, error.message);
    }
  }
  
  // Save all products to a single file
  const allProductsFile = path.join(__dirname, 'scraped_all_products.json');
  fs.writeFileSync(allProductsFile, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`\n=== Scraping complete! ===`);
  console.log(`Total products scraped: ${allProducts.length}`);
  console.log(`Saved to: ${allProductsFile}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  scrapeCategory,
  scrapeProduct,
  extractProductLinks
};

