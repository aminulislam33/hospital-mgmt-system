const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
const twilio = require('twilio');
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

async function handleUserLOgin(req, res) {
    const { phoneNumber } = req.body;
    try {
        await client.verify
            .v2.services(TWILIO_SERVICE_SID)
            .verifications.create({
                to: `+91${phoneNumber}`,
                channel: 'sms',
            });

        req.session.phoneNumber = phoneNumber;
        req.session.isVerified = false;

        console.log(req.session)

        return res.status(200).render("verify-otp")
    } catch (error) {
        console.log(error)
    }
};

async function handleUserOTP(req, res) {
    const { otp } = req.body;

    const { phoneNumber } = req.session;

    if (!phoneNumber) {
        return res.render("verify-otp", { message: "Phone number not found in session" });
    }

    try {
        const verifiedResponse = await client.verify
            .v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: `+91${phoneNumber}`,
                code: otp,
            });

        if (!verifiedResponse) {
            return res.render("verify-otp", { message: "Invalid OTP" });
        }

        req.session.isVerified = true;

        return res.redirect("/");
    } catch (error) {
        console.log(error);
        return res.render("verify-otp", { message: "An error occurred during OTP verification" });
    }
}

module.exports = {
    handleUserLOgin,
    handleUserOTP
}