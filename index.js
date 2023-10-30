const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
var fs = require("fs");

const newsLimit = 5;

const getNews = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  console.log("Browser initialization...");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  console.log("Loading page...");
  await page.goto("https://russianemirates.com/news/uae-news/", {
    waitUntil: "domcontentloaded",
  });
  const expression = "//div[@class='info_block wow fadeInUp flex_item']";
  const baseURL = "https://russianemirates.com";

  const elements = await page.$x(expression);
  await page.waitForXPath(expression, { timeout: 3000 });
  const latestFiveNews = [];
  console.log("Parsing in progress...");
  for (let i = 0; i < elements.length && i < newsLimit; i++) {
    let news = await page.evaluate((el) => el.innerHTML, elements[i]);
    let $ = cheerio.load(news);
    const title = $("div.ib_head").text().trim();
    const description = $("div.ib_text p").text().trim();
    const date = $("span.die-miniatqr-bottom-time-views").text().trim();
    const picture = $("div.ib_pict img").attr("src");
    const link = $("a").attr("href");
    latestFiveNews.push({
      title,
      description,
      date,
      link: `${baseURL}${link}`,
      picture: `${baseURL}${picture}`,
    });
    console.log(`Parsing completed status - ${i + 1}/${newsLimit}`);
  }
  await browser.close();

  var json = JSON.stringify(latestFiveNews);
  console.log("Writing to file...");
  fs.writeFile("data/latest-news.json", json, "utf8", function (err) {
    if (err) throw err;
    console.log("Scrapping process completed!");
  });
};

// Start the scraping
getNews();
