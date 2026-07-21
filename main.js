const { chromium } = require("@playwright/test");
const config = require("./config/config");
const { sendTelegramMessage } = require("./utils/telegram");

const notifiedShows = new Set();

async function scrollToTop(page) {
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    await page.waitForTimeout(1500);
}

async function scrollDown(page) {

    await page.mouse.wheel(0, 900);

    await page.waitForTimeout(1200);
}

async function theatreExists(page, theatreName) {

    console.log("----------------------------------------");
    console.log(`Searching Theatre : ${theatreName}`);

    for (let i = 0; i < 40; i++) {

        const theatre = page.getByText(theatreName, {
            exact: false
        });

        if (await theatre.count() > 0) {

            console.log(`✅ Theatre Found : ${theatreName}`);

            await theatre.first().scrollIntoViewIfNeeded();

            await page.waitForTimeout(1000);

            return true;
        }

        await scrollDown(page);
    }

    console.log(`❌ Theatre Not Found : ${theatreName}`);

    return false;
}
async function checkShow(page, theatreName, theatreConfig) {

    const found = await theatreExists(page, theatreName);

    if (!found) {
        return null;
    }

    // Fixed show (Gokulam / Kaveri)

    if (theatreConfig.showTime) {

        console.log(`Checking Show : ${theatreConfig.showTime}`);

        const button = page.getByRole("button", {
            name: new RegExp(theatreConfig.showTime, "i")
        });

        if (await button.count() > 0) {

            console.log(`🎉 Booking Open : ${theatreName}`);

            return {
                theatre: theatreName,
                show: theatreConfig.showTime
            };
        }

        console.log(`❌ ${theatreConfig.showTime} Not Open`);

        return null;
    }

    // Morning shows (06:00–10:00)

    const morningShows = [
        "06:00 AM",
        "06:30 AM",
        "07:00 AM",
        "07:30 AM",
        "08:00 AM",
        "08:30 AM",
        "09:00 AM",
        "09:05 AM",
        "09:10 AM",
        "09:15 AM",
        "09:20 AM",
        "09:25 AM",
        "09:30 AM",
        "09:35 AM",
        "09:40 AM",
        "09:45 AM",
        "09:50 AM",
        "09:55 AM",
        "10:00 AM"
    ];

    for (const show of morningShows) {
        console.log(`Checking Show : ${show}`);

        const button = page.getByRole("button", {
            name: new RegExp(show, "i")
        });

        if (await button.count() > 0) {
            console.log(`🎉 Booking Open : ${theatreName}`);
            return {
                theatre: theatreName,
                show
            };
        }
    }

    console.log(`❌ No morning show open for ${theatreName}`);
    return null;
}

async function startMonitoring() {
    console.log("🚀 JanaMonitor Started...");

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    while (true) {
        try {
            await page.goto(config.movie.url, {
                waitUntil: "networkidle"
            });

            await scrollToTop(page);

            console.log("");
            console.log("======================================");
            console.log("Checking Theatre Availability...");
            console.log(new Date().toLocaleString());
            console.log("======================================");

            let bookingFound = false;

            for (const theatre of config.theatres) {
                const result = await checkShow(
                    page,
                    theatre.name,
                    theatre
                );

                if (result) {
                    bookingFound = true;
                    const key = `${result.theatre}-${result.show}`;

                    if (!notifiedShows.has(key)) {
                        notifiedShows.add(key);

                        await sendTelegramMessage(
`🎉 JanaMonitor Alert

Movie : ${config.movie.name}

🏢 Theatre : ${result.theatre}

🕒 Show : ${result.show}

Booking is Available.

${config.movie.url}`
                        );

                        console.log("📨 Telegram Sent");
                    }
                }
            }

            if (!bookingFound) {
                console.log("");
                console.log("❌ Booking NOT OPEN");
                console.log("Checked All Configured Theatres");
                console.log("");
            }
        } catch (error) {
            console.log("❌ Error :", error.message);
        }

        console.log("");
        console.log(`Waiting ${config.checkInterval / 1000} Seconds...`);
        console.log("");

        await page.waitForTimeout(config.checkInterval);
    }
}

startMonitoring();