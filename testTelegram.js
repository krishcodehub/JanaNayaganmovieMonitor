const { sendTelegramMessage } = require("./utils/telegram");

async function test() {
    await sendTelegramMessage(
        "✅ JanaMonitor is connected successfully!\n\nTelegram notification test passed."
    );
}

test();