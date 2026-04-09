// scripts/scrapeClient.ts
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";

const MAX_PAGES   = 20;
const CONCURRENCY = 3;
const TIMEOUT_MS  = 8000;

const CONTENT_TAGS = ["h1","h2","h3","h4","p","li","td","th","blockquote","figcaption"];
const SKIP_SELECTORS = ["script","style","noscript","iframe","nav","footer",".cookie-banner","#cookie-notice"];

interface PageContent { url: string; title: string; text: string; html: string; }
interface BrandColours { primaryColor: string; accentColor: string; textColor: string; bgColor: string; }
interface ClientConfig {
  id: string; name: string; url: string; scrapedAt: string; botName: string;
  primaryColor: string; accentColor: string; textColor: string; bgColor: string;
  greeting: string; quickReplies: { label: string; value: string }[];
  content: string; pages: { url: string; title: string }[];
}

function cleanText(text: string): string { return text.replace(/\s+/g, " ").trim(); }

function isSameDomain(base: string, link: string): boolean {
  try {
    const a = new URL(base).hostname.replace(/^www\./, "");
    const b = new URL(link).hostname.replace(/^www\./, "");
    return a === b;
  } catch { return false; }
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    const url = new URL(href, base);
    url.hash = ""; url.search = "";
    if (["mailto:","tel:","javascript:"].some(p => url.href.startsWith(p))) return null;
    if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|mp4|zip|doc|docx)$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

function isValidHex(color: string): boolean { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color); }

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
  if (r > 240 && g > 240 && b > 240) return null;
  if (r < 15 && g < 15 && b < 15) return null;
  if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return null;
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function extractColoursFromCSS(css: string): string[] {
  const colours: string[] = [];
  const hexMatches = css.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
  hexMatches.forEach(c => { if (isValidHex(c)) colours.push(c.toLowerCase()); });
  const rgbMatches = css.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+[^)]*\)/g) || [];
  rgbMatches.forEach(c => { const hex = rgbToHex(c); if (hex) colours.push(hex); });
  return colours;
}

function scoreColour(hex: string): number {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  if (r > 235 && g > 235 && b > 235) return -100;
  if (r < 10 && g < 10 && b < 10) return -100;
  if (Math.abs(r-g) < 25 && Math.abs(g-b) < 25) return -50;
  // Skip common UI colours - red notifications, orange warnings
  if (r > 220 && g < 80 && b < 80) return -30;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const saturation = max === 0 ? 0 : (max-min)/max;
  // Wider brightness range - dont penalise dark brand colours like forest green
  const brightness = (r+g+b)/(3*255);
  const brightScore = brightness > 0.08 ? 1 - Math.abs(brightness - 0.35) : 0;
  return saturation * 0.6 + brightScore * 0.4;
}

function shiftColour(hex: string): string {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + 30);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + 20);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) - 10);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function extractBrandColours(pages: PageContent[]): BrandColours {
  const allColours: Map<string, number> = new Map();

  pages.forEach(page => {
    const $ = cheerio.load(page.html);

    const inlineStyles = $("[style]").map((_,el) => $(el).attr("style") || "").get().join(" ");
    extractColoursFromCSS(inlineStyles).forEach(c => {
      allColours.set(c, (allColours.get(c) || 0) + 2);
    });

    $("style").each((_,el) => {
      extractColoursFromCSS($(el).text()).forEach(c => {
        allColours.set(c, (allColours.get(c) || 0) + 1);
      });
    });

    $("button, a, h1, h2, header, nav, .btn, [class*='btn'], [class*='button'], [class*='primary']").each((_,el) => {
      extractColoursFromCSS($(el).attr("style")||"").forEach(c => {
        allColours.set(c, (allColours.get(c) || 0) + 3);
      });
    });
  });

  // Filter out bad colours first
  const valid = Array.from(allColours.entries()).filter(([colour]) => scoreColour(colour) > 0);

  // Sort purely by frequency — most used = brand colour
  const byFrequency = valid.sort((a, b) => b[1] - a[1]);

  console.log("\n🎨 Detected colours (by frequency):");
  byFrequency.slice(0, 5).forEach(([c, freq]) => console.log(`   ${c} (used: ${freq}x, score: ${scoreColour(c).toFixed(2)})`));

  const primary = byFrequency[0]?.[0] || "#2563eb";

  return {
    primaryColor: primary,
    accentColor: shiftColour(primary),
    textColor: "#ffffff",
    bgColor: "#0f172a",
  };
}

async function scrapePage(url: string): Promise<{ content: PageContent | null; links: string[] }> {
  try {
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZempotisBot/1.0)" },
      maxRedirects: 3,
    });
    const $ = cheerio.load(res.data);
    $(SKIP_SELECTORS.join(", ")).remove();
    const title = $("title").text().trim() || $("h1").first().text().trim() || url;
    const sections: string[] = [];
    CONTENT_TAGS.forEach(tag => {
      $(tag).each((_,el) => { const text = cleanText($(el).text()); if (text.length > 20) sections.push(text); });
    });
    const text = [...new Set(sections)].join("\n").slice(0, 3000);
    const links: string[] = [];
    $("a[href]").each((_,el) => {
      const href = $(el).attr("href");
      if (href) { const n = normalizeUrl(url, href); if (n && isSameDomain(url,n)) links.push(n); }
    });
    return { content: { url, title, text, html: res.data }, links };
  } catch (err) {
    console.warn(`  ⚠ Skipped ${url}: ${(err as Error).message}`);
    return { content: null, links: [] };
  }
}

async function crawlSite(startUrl: string): Promise<PageContent[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const results: PageContent[] = [];
  console.log(`\n🔍 Crawling ${startUrl}...\n`);
  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const batch = queue.splice(0, CONCURRENCY).filter(u => !visited.has(u));
    if (!batch.length) continue;
    batch.forEach(u => visited.add(u));
    const settled = await Promise.all(batch.map(scrapePage));
    for (const { content, links } of settled) {
      if (!content || content.text.length < 50) continue;
      results.push(content);
      console.log(`  ✓ ${content.title.slice(0,60)}`);
      links.forEach(link => { if (!visited.has(link) && !queue.includes(link)) queue.push(link); });
    }
  }
  console.log(`\n✅ Scraped ${results.length} pages\n`);
  return results;
}

function buildConfig(id: string, url: string, pages: PageContent[]): ClientConfig {
  const allContent = pages.map(p => `=== ${p.title} ===\n${p.text}`).join("\n\n").slice(0, 15000);
  const companyName = pages[0]?.title?.split(/[|\-–—]/)[0].trim().slice(0, 50) || id;
  const colours = extractBrandColours(pages);
  console.log(`\n✅ Brand colours detected:`);
  console.log(`   Primary:  ${colours.primaryColor}`);
  console.log(`   Accent:   ${colours.accentColor}`);
  return {
    id, name: companyName, url,
    scrapedAt: new Date().toISOString(),
    botName: "AI Assistant",
    primaryColor: colours.primaryColor,
    accentColor: colours.accentColor,
    textColor: colours.textColor,
    bgColor: colours.bgColor,
    greeting: `Hi there! 👋 I'm the AI assistant for ${companyName}. How can I help you today?`,
    quickReplies: [
      { label: "What do you offer?",     value: "What services do you offer?"     },
      { label: "How much does it cost?", value: "What are your prices?"           },
      { label: "Book a call",            value: "I'd like to book a consultation" },
      { label: "Get in touch",           value: "How can I contact you?"          },
    ],
    content: allContent,
    pages: pages.map(p => ({ url: p.url, title: p.title })),
  };
}

async function main() {
  const [url, clientId] = process.argv.slice(2);
  if (!url || !clientId) {
    console.error("\n❌  Usage: npx ts-node scripts/scrapeClient.ts <url> <client-id>");
    process.exit(1);
  }
  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  const safeId  = clientId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  console.log(`\n🚀 Zempotis Client Scraper`);
  console.log(`   URL:       ${safeUrl}`);
  console.log(`   Client ID: ${safeId}`);
  console.log("─".repeat(50));
  const pages = await crawlSite(safeUrl);
  if (!pages.length) { console.error("❌  No pages scraped."); process.exit(1); }
  const config = buildConfig(safeId, safeUrl, pages);
  const dir = path.join(process.cwd(), "data", "clients");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, `${safeId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
  console.log(`\n🎉 Saved to: data/clients/${safeId}.json`);
  console.log(`\n📋 Give your client this embed code:\n`);
  console.log(`   <script src="https://zempotis.com/chatbot.js?client=${safeId}" async></script>\n`);
}

main().catch(err => { console.error(err); process.exit(1); });