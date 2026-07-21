class BookMyShowPage {

    constructor(page) {
        this.page = page;
    }

    async checkBookingAvailable(theatreName, showTime) {

        console.log("=================================");
        console.log(`Searching Theatre : ${theatreName}`);
        console.log(`Checking Show     : ${showTime}`);
        console.log("=================================");

        const theatre = this.page
            .getByLabel("grid")
            .getByText(theatreName);

        if (await theatre.count() === 0) {

            console.log(`❌ Theatre NOT FOUND : ${theatreName}`);

            return {
                available: false,
                theatre: theatreName,
                show: showTime
            };
        }

        console.log(`✅ Theatre FOUND : ${theatreName}`);

        await theatre.first().scrollIntoViewIfNeeded();

        await this.page.waitForTimeout(1000);

        const buttons = this.page.getByRole("button", {
            name: new RegExp(`^${showTime}`)
        });

        const count = await buttons.count();

        if (count === 0) {

            console.log(`❌ ${showTime} Booking NOT OPEN`);

            return {
                available: false,
                theatre: theatreName,
                show: showTime
            };
        }

        for (let i = 0; i < count; i++) {

            const button = buttons.nth(i);

            if (!(await button.isVisible()))
                continue;

            console.log("");
            console.log("🎉 BOOKING OPEN");
            console.log(`🏢 Theatre : ${theatreName}`);
            console.log(`🕒 Show    : ${showTime}`);
            console.log("");

            return {
                available: true,
                theatre: theatreName,
                show: showTime
            };
        }

        console.log(`❌ ${showTime} Booking NOT OPEN`);

        return {
            available: false,
            theatre: theatreName,
            show: showTime
        };
    }

}

module.exports = BookMyShowPage;