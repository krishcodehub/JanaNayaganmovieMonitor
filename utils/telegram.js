const axios = require("axios");
const config = require("../config/config");

async function sendTelegramMessage(message) {

    try {

        const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;

        await axios.post(url, {
            chat_id: config.telegram.chatId,
            text: message
        });

        console.log("✅ Telegram message sent.");

    } catch (error) {

        console.error("❌ Telegram Error:", error.message);

    }

}

module.exports = {
    sendTelegramMessage
};