const Login = require("../models/LoginSchema");

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Admin Login Logic
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username === DEFAULT_ADMIN_USERNAME &&
      password === DEFAULT_ADMIN_PASSWORD
    ) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { username: DEFAULT_ADMIN_USERNAME },
      });
    }

    // Find the admin user in the database
    const user = await Login.findOne({ username, password });

    if (user) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: { username: user.username }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// Optional: Change Admin Password
const updateAdminPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    await Login.findOneAndUpdate({ username }, { password: newPassword });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

module.exports = { adminLogin, updateAdminPassword };
