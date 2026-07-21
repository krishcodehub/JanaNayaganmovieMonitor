const { chromium } = require("@playwright/test");
const config = require("./config/config");
const { sendTelegramMessage } = require("./utils/telegram");

const notifiedTheatres = new Set();

async function theatreExists(page, theatreName) {

    console.log("---------------------------------------");
    console.log(`Searching : ${theatreName}`);

    const theatre = page
        .getByLabel("grid")
        .getByText(theatreName);

    const count = await theatre.count();

    if (count > 0) {

        console.log(`✅ ${theatreName} Listed`);

        if (!notifiedTheatres.has(theatreName)) {

            notifiedTheatres.add(theatreName);

            await sendTelegramMessage(
`🎉 JanaMonitor Alert

Movie : ${config.movie.name}
Date : ${config.movie.date}

🏢 Theatre Listed

${theatreName}

${config.movie.url}`
            );

            console.log("📨 Telegram Sent");
        }
        else {
            console.log("ℹ️ Already Notified");
        }

        return true;
    }

    console.log(`❌ ${theatreName} Not Listed`);

    return false;
}

async function startMonitoring() {

    console.log("🚀 JanaMonitor Started");
console.log("Running latest code - headless mode");

const browser = await chromium.launch({
    headless: true
});

    const page = await browser.newPage();

    while (true) {

        try {

            await page.goto(config.movie.url, {
                waitUntil: "domcontentloaded"
            });

            console.log("");
            console.log("======================================");
            console.log(new Date().toLocaleString());
            console.log("Checking Theatre Availability...");
            console.log("======================================");

            for (const theatre of config.theatres) {

                await theatreExists(page, theatre.name);

            }

        }
        catch (e) {

            console.log("Error :", e.message);

        }

        console.log("");
        console.log(`Waiting ${config.checkInterval / 1000} Seconds...`);
        console.log("");

        await page.waitForTimeout(config.checkInterval);

    }

}

startMonitoring();