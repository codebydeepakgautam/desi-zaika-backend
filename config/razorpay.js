const Razorpay = require("razorpay");

console.log("=================================");
console.log("RAZORPAY CONFIG");
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log(
  "SECRET EXISTS:",
  Boolean(process.env.RAZORPAY_KEY_SECRET)
);
console.log("=================================");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay API keys are missing in .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;