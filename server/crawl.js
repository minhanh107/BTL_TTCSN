// crawl.js — CommonJS + Puppeteer v22 (no waitForTimeout)

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const CATEGORY_PAGES = {
  "Nước hoa nam": "https://www.thegioinuochoa.com.vn/nuoc-hoa-nam",
  "Nước hoa nữ": "https://www.thegioinuochoa.com.vn/nuoc-hoa-nu",
  "Nước hoa unisex": "https://www.thegioinuochoa.com.vn/nuoc-hoa-unisex",
  "Nước hoa niche": "https://www.thegioinuochoa.com.vn/nuoc-hoa-niche"
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parsePrice(str) {
  if (!str) return null;
  const n = str.replace(/[^\d]/g, "");
  return n ? parseInt(n, 10) : null;
}

async function getHTML(page, url) {
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  // waitForTimeout bị remove → dùng sleep
  await sleep(1500);

  return await page.content();
}

// =========================================================
// Product crawler
// =========================================================
async function crawlProduct(page, url, categoryName) {
  console.log(" → Crawling product:", url);

  const html = await getHTML(page, url);
  const $ = cheerio.load(html);

  // NAME
  let name =
    $('script[type="application/ld+json"]').html()?.match(/"name":\s*"([^"]+)"/)?.[1] ||
    $(".fw-semibold").first().text().trim();

  // DESCRIPTION
  let description =
    $("#collapseThree .accordion-body").html() ||
    $("#collapseThree .accordion-body").text();

  // IMAGES
  const images = [];
  $(".img_other img").each((i, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src) images.push(src);
  });

  // VARIANTS
  const variants = [];
  $(".priceItem").each((i, el) => {
		const a = $(el);
	
		const volume = a.find("strong").text().trim();
	
		// clone rồi remove strong để còn lại chỉ giá thôi
		const priceText = a.clone().find("strong").remove().end().text().trim();
	
		const priceMatch = priceText.match(/\d[\d.]+/);
		const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, ""), 10) : null;
	
		variants.push({
			sku: a.attr("title") || null,
			volume,
			price,
			stock: 0
		});
	});
	

  // ATTRIBUTES
  const attributes = {};
  
  // Mapping từ tiếng Việt sang key tiếng Anh
  const attributeMapping = {
    "Nhãn hiệu": "brand",
    "Giới tính": "gender",
    "Xuất xứ": "origin",
    "Nồng độ": "concentration",
    "Nhà pha chế": "perfumer",
    "Nhóm hương": "scentGroup",
    "Phong cách": "style"
  };
  
  // Lấy HTML của phần thông tin sản phẩm (có thể có nhiều thẻ p)
  let infoHtml = "";
  $("#collapseOne .accordion-body p").each((i, el) => {
    const html = $(el).html() || "";
    // Chỉ lấy phần có chứa <strong> (phần thông tin thuộc tính)
    if (html.includes("<strong>")) {
      infoHtml += html;
    }
  });
  
  // Nếu không tìm thấy trong p, thử lấy toàn bộ accordion-body
  if (!infoHtml) {
    infoHtml = $("#collapseOne .accordion-body").html() || "";
  }
  
  // Parse các dòng có format: <strong>Key</strong> : Value<br>
  const lines = infoHtml.split(/<br\s*\/?>/i);
  
  lines.forEach(line => {
    // Tìm pattern: <strong>Key</strong> : Value (có thể có khoảng trắng)
    const match = line.match(/<strong>([^<]+)<\/strong>\s*:\s*([^<]*)/);
    if (match) {
      const vietnameseKey = match[1].trim();
      let value = match[2].trim();
      
      // Bỏ qua nếu value rỗng hoặc chỉ có khoảng trắng
      if (!value || value === "&nbsp;") return;
      
      // Map key tiếng Việt sang key tiếng Anh
      const englishKey = attributeMapping[vietnameseKey];
      if (englishKey) {
        // Decode HTML entities (như &amp; → &)
        value = value
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ")
          .trim();
        
        if (value) {
          attributes[englishKey] = value;
        }
      }
    }
  });

  return {
    name,
    description,
    categoryName,
    attributes,
    variants,
    images,
    originUrl: url,
    isActive: true,
    crawledAt: new Date().toISOString()
  };
}

// =========================================================
// Category crawler
// =========================================================
async function crawlCategory(page, name, url) {
  console.log(`\n===== Crawling Category: ${name} =====`);

  const html = await getHTML(page, url);
  const $ = cheerio.load(html);

  const productLinks = [];

  $("#product-grid .col a.product-item-thumb").each((i, el) => {
    if (productLinks.length >= 6) return false;
    const href = $(el).attr("href");
    if (!href) return;
    productLinks.push("https://www.thegioinuochoa.com.vn" + href);
  });

  console.log(" → Found", productLinks.length, "products.");

  const results = [];

  for (const link of productLinks) {
    const product = await crawlProduct(page, link, name);
    results.push(product);

    // avoid bot detection
    await sleep(800);
  }

  return results;
}

// =========================================================
// MAIN
// =========================================================
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "Accept-Language": "vi,en-US;q=0.8"
  });

  const all = [];

  for (const [name, url] of Object.entries(CATEGORY_PAGES)) {
    const items = await crawlCategory(page, name, url);
    all.push(...items);
  }

  fs.writeFileSync("crawled_products.json", JSON.stringify(all, null, 2), "utf8");
  console.log("\n🎉 DONE → crawled_products.json");

  await browser.close();
})();
