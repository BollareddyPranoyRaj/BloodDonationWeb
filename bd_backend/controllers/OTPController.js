const OTP = require("../models/otpModel");
const nodemailer = require("nodemailer");

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otpValue = generateOTP();

    // Save OTP to database (will auto-delete after 5 mins due to TTL index in Schema)
    await OTP.findOneAndUpdate(
      { email },
      { otp: otpValue, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Configure Email Transporter (Example using Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Add this to your .env
        pass: process.env.EMAIL_PASS, // Add this to your .env
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Blood Donation Verification Code",
      text: `Your OTP for registration is: ${otpValue}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, otp });

    if (record) {
      await OTP.deleteOne({ _id: record._id }); // Delete after successful verification
      res.status(200).json({ verified: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ verified: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

module.exports = { sendOTP, verifyOTP };