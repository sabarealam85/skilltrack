const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin");

// =========================
// SIGN UP
// =========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await pool.query(
      "SELECT user_id FROM public.users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Account already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO public.users
       (name, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING user_id, name, email, role, trainee_id`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      `SELECT user_id, name, email, password, role, trainee_id
       FROM public.users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        trainee_id: user.trainee_id
      },
      process.env.JWT_SECRET || "skilltrack-secret-key",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        trainee_id: user.trainee_id
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// =========================
// GOOGLE / FACEBOOK FIREBASE SOCIAL LOGIN
// =========================
router.post("/social-login", async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: "Firebase token is required"
      });
    }

    // Verify Firebase ID token
    const decodedToken =
      await admin.auth.verifyIdToken(firebaseToken);

    // Email from Google/Facebook Firebase account
    const email = decodedToken.email || null;

    const name =
      decodedToken.name ||
      decodedToken.email?.split("@")[0] ||
      "SkillTrack User";

    // Email is required for SkillTrack account
    if (!email) {
      console.error("Social login token has no email:", {
        uid: decodedToken.uid,
        provider: decodedToken.firebase?.sign_in_provider,
        identities: decodedToken.firebase?.identities
      });

      return res.status(400).json({
        message:
          "Email not available from social login provider. Please allow email permission."
      });
    }

    // Check whether user already exists
    const existingUser = await pool.query(
      `
      SELECT user_id, name, email, role, trainee_id
      FROM public.users
      WHERE email = $1
      `,
      [email]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // Existing user: keep existing role
      user = existingUser.rows[0];

    } else {
      // New social-login user is always a normal user
      const result = await pool.query(
        `
        INSERT INTO public.users
        (name, email, password, role)
        VALUES ($1, $2, $3, 'user')
        RETURNING user_id, name, email, role, trainee_id
        `,
        [
          name,
          email,
          `firebase:${decodedToken.uid}`
        ]
      );

      user = result.rows[0];
    }

    // Create SkillTrack JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        trainee_id: user.trainee_id || null
      },
      process.env.JWT_SECRET || "skilltrack-secret-key",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Social login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        trainee_id: user.trainee_id || null
      }
    });

  } catch (error) {
    console.error("Social login error:", error);

    res.status(401).json({
      message: "Invalid or expired Firebase login"
    });
  }
});

module.exports = router;