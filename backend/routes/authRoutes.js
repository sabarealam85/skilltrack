const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const admin = require("../firebaseAdmin");

const authenticateToken = require("../middleware/authMiddleware");

// ======================================================
// EMAIL TRANSPORTER
// ======================================================

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// ======================================================
// GENERATE EMAIL OTP
// ======================================================

const generateEmailOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// ======================================================
// SEND EMAIL OTP
// ======================================================

router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    const existingUser = await pool.query(
      `
      SELECT user_id
      FROM public.users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const otp = generateEmailOTP();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pool.query(
      `
      DELETE FROM public.email_verification_otps
      WHERE LOWER(email) = LOWER($1)
      `,
      [cleanEmail]
    );

    await pool.query(
      `
      INSERT INTO public.email_verification_otps
      (
        email,
        otp_hash,
        expires_at,
        attempts,
        verified
      )
      VALUES
      ($1, $2, $3, 0, FALSE)
      `,
      [
        cleanEmail,
        otpHash,
        expiresAt
      ]
    );

    await emailTransporter.sendMail({
      from: `"SkillTrack Account Verification" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your SkillTrack verification code",

      text:
        `Your SkillTrack verification OTP is ${otp}.\n\n` +
        `This OTP is valid for 10 minutes.\n\n` +
        `If you did not request this verification, please ignore this email.`,

     html: `
  <div
    style="
      font-family: Arial, sans-serif;
      max-width: 560px;
      margin: auto;
      padding: 24px;
      color: #17324d;
    "
  >

    <h2 style="color:#1769aa;">
      SkillTrack
    </h2>

    <p>
      Use the verification code below to complete your SkillTrack account setup.
    </p>

    <div
      style="
        font-size:30px;
        font-weight:700;
        letter-spacing:8px;
        padding:18px;
        background:#f3f7fb;
        border-radius:10px;
        text-align:center;
        margin:20px 0;
      "
    >
      ${otp}
    </div>

    <p>
      This code expires in <strong>10 minutes</strong>.
    </p>

    <p style="color:#66788a;font-size:13px;">
      If you did not request this code, you can safely ignore this email.
    </p>

  </div>
`,
    });

    return res.json({
      message: "OTP sent successfully to your email"
    });

  } catch (error) {
    console.error(
      "Send email OTP error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to send OTP. Please try again."
    });
  }
});

// ======================================================
// VERIFY EMAIL OTP
// ======================================================

router.post("/verify-email-otp", async (req, res) => {
  try {
    const {
      email,
      otp
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOTP = otp.trim();

    if (!/^\d{6}$/.test(cleanOTP)) {
      return res.status(400).json({
        message: "OTP must be a 6-digit number"
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        otp_hash,
        expires_at,
        attempts,
        verified
      FROM public.email_verification_otps
      WHERE LOWER(email) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message:
          "No OTP request found. Please request a new OTP."
      });
    }

    const record = result.rows[0];

    if (record.verified) {
      return res.json({
        message: "Email is already verified"
      });
    }

    if (
      new Date(record.expires_at) < new Date()
    ) {
      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP."
      });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({
        message:
          "Too many incorrect attempts. Please request a new OTP."
      });
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(cleanOTP)
      .digest("hex");

    if (otpHash !== record.otp_hash) {
      await pool.query(
        `
        UPDATE public.email_verification_otps
        SET attempts = attempts + 1
        WHERE id = $1
        `,
        [record.id]
      );

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    await pool.query(
      `
      UPDATE public.email_verification_otps
      SET verified = TRUE
      WHERE id = $1
      `,
      [record.id]
    );

    return res.json({
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error(
      "Verify email OTP error:",
      error
    );

    return res.status(500).json({
      message: "Unable to verify OTP"
    });
  }
});

// ======================================================
// SIGN UP
// ======================================================

router.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      email,
      date_of_birth,
      location,
      phone,
      password
    } = req.body;

    if (
      !name ||
      !email ||
      !date_of_birth ||
      !location ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email, date of birth, location, phone and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanLocation = location.trim();
    const cleanPhone = phone.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        message:
          "Please enter a valid 10-digit phone number"
      });
    }

    // --------------------------------------------------
    // CHECK EMAIL OTP VERIFICATION
    // --------------------------------------------------

    const verificationResult = await pool.query(
      `
      SELECT
        id,
        verified,
        expires_at
      FROM public.email_verification_otps
      WHERE LOWER(email) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        message:
          "Please verify your email with OTP before creating the account."
      });
    }

    const verification =
      verificationResult.rows[0];

    if (!verification.verified) {
      return res.status(400).json({
        message:
          "Please verify your email with OTP before creating the account."
      });
    }

    // --------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT user_id
      FROM public.users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message:
          "An account with this email already exists"
      });
    }

    // --------------------------------------------------
    // GENERATE UNIQUE TRAINEE / LOGIN ID
    // --------------------------------------------------

    const traineeIdResult = await pool.query(
      `
      SELECT trainee_id
      FROM public.trainees
      WHERE trainee_id ~ '^ST[0-9]+$'
      ORDER BY
        CAST(
          SUBSTRING(trainee_id FROM 3)
          AS INTEGER
        ) DESC
      LIMIT 1
      `
    );

    let nextNumber = 10001;

    if (traineeIdResult.rows.length > 0) {
      const lastId =
        traineeIdResult.rows[0].trainee_id;

      const lastNumber = parseInt(
        lastId.substring(2),
        10
      );

      if (!Number.isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    let traineeId = `ST${nextNumber}`;

    while (true) {
      const idCheck = await pool.query(
        `
        SELECT trainee_id
        FROM public.trainees
        WHERE trainee_id = $1
        LIMIT 1
        `,
        [traineeId]
      );

      if (idCheck.rows.length === 0) {
        break;
      }

      nextNumber++;

      traineeId = `ST${nextNumber}`;
    }

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // --------------------------------------------------
    // TRANSACTION
    // --------------------------------------------------

    await client.query("BEGIN");

    // --------------------------------------------------
    // CREATE TRAINEE
    // --------------------------------------------------

    const traineeResult = await client.query(
      `
      INSERT INTO public.trainees
      (
        trainee_id,
        name,
        email,
        phone,
        date_of_birth,
        location,
        identity_verified
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, FALSE)
      RETURNING
        trainee_id,
        name,
        email,
        phone,
        date_of_birth,
        location,
        identity_verified
      `,
      [
        traineeId,
        cleanName,
        cleanEmail,
        cleanPhone,
        date_of_birth,
        cleanLocation
      ]
    );

    const trainee =
      traineeResult.rows[0];

    // --------------------------------------------------
    // CREATE USER LOGIN ACCOUNT
    // --------------------------------------------------

    const userResult = await client.query(
      `
      INSERT INTO public.users
      (
        name,
        email,
        password,
        role,
        trainee_id
      )
      VALUES
      ($1, $2, $3, 'user', $4)
      RETURNING
        user_id,
        name,
        email,
        role,
        trainee_id
      `,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        trainee.trainee_id
      ]
    );

    const user =
      userResult.rows[0];

    await client.query("COMMIT");

    // --------------------------------------------------
    // REMOVE USED OTP RECORD
    // --------------------------------------------------

    await pool.query(
      `
      DELETE FROM public.email_verification_otps
      WHERE LOWER(email) = LOWER($1)
      `,
      [cleanEmail]
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      message:
        "Account created successfully",

      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,

        trainee_id:
          user.trainee_id,

        traineeId:
          user.trainee_id,

        loginId:
          user.trainee_id
      }
    });

  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create account"
    });

  } finally {
    client.release();
  }
});

// ======================================================
// LOGIN
// ======================================================

// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const {
      loginId,
      password
    } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        message: "Login ID and password are required"
      });
    }

    const cleanLoginId = loginId.trim();

    const result = await pool.query(
      `
      SELECT
        user_id,
        name,
        email,
        password,
        role,
        trainee_id,
        admin_id
      FROM public.users
      WHERE
        (
          role = 'user'
          AND trainee_id::text = $1
        )
        OR
        (
          role = 'admin'
          AND LOWER(admin_id) = LOWER($1)
        )
      LIMIT 1
      `,
      [cleanLoginId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid Login ID or password"
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Login ID or password"
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        trainee_id: user.trainee_id,
        admin_id: user.admin_id
      },
      process.env.JWT_SECRET || "skilltrack-secret-key",
      {
        expiresIn: "1d"
      }
    );

    return res.json({
      message: "Login successful",

      token,

      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,

        trainee_id: user.trainee_id,
        traineeId: user.trainee_id,

        admin_id: user.admin_id,
        adminId: user.admin_id
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
});

// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post("/forgot-password", async (req, res) => {
  try {
    const {
      loginId,
      email
    } = req.body;

    if (!loginId || !email) {
      return res.status(400).json({
        message:
          "Login ID and email are required"
      });
    }

    const cleanLoginId =
      loginId.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT
        user_id,
        email,
        trainee_id,
        admin_id,
        role
      FROM public.users
      WHERE
        LOWER(email) = LOWER($1)
        AND (
          trainee_id::text = $2
          OR (
            role = 'admin'
            AND LOWER(admin_id) = LOWER($2)
          )
        )
      LIMIT 1
      `,
      [
        cleanEmail,
        cleanLoginId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Login ID and email do not match our records."
      });
    }

    const user =
      result.rows[0];

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );

    await pool.query(
      `
      DELETE FROM public.password_reset_tokens
      WHERE user_id = $1
      AND used = FALSE
      `,
      [user.user_id]
    );

    await pool.query(
      `
      INSERT INTO public.password_reset_tokens
      (
        user_id,
        token_hash,
        expires_at,
        used
      )
      VALUES
      ($1, $2, $3, FALSE)
      `,
      [
        user.user_id,
        tokenHash,
        expiresAt
      ]
    );

    return res.json({
      message:
        "Identity verified successfully",

      resetToken,

      expiresIn: 900
    });

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error"
    });
  }
});

// ======================================================
// RESET PASSWORD
// ======================================================

router.post("/reset-password", async (req, res) => {
  try {
    const {
      resetToken,
      newPassword
    } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message:
          "Reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long"
      });
    }

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const tokenResult =
      await pool.query(
        `
        SELECT
          id,
          user_id,
          expires_at,
          used
        FROM public.password_reset_tokens
        WHERE token_hash = $1
        LIMIT 1
        `,
        [tokenHash]
      );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        message:
          "Invalid password reset token."
      });
    }

    const resetRecord =
      tokenResult.rows[0];

    if (resetRecord.used) {
      return res.status(400).json({
        message:
          "This password reset token has already been used."
      });
    }

    if (
      new Date(resetRecord.expires_at) <
      new Date()
    ) {
      return res.status(400).json({
        message:
          "This password reset token has expired. Please start again."
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await pool.query(
      `
      UPDATE public.users
      SET password = $1
      WHERE user_id = $2
      `,
      [
        hashedPassword,
        resetRecord.user_id
      ]
    );

    await pool.query(
      `
      UPDATE public.password_reset_tokens
      SET used = TRUE
      WHERE id = $1
      `,
      [resetRecord.id]
    );

    await pool.query(
      `
      DELETE FROM public.password_reset_tokens
      WHERE user_id = $1
      AND used = FALSE
      `,
      [resetRecord.user_id]
    );

    return res.json({
      message:
        "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error"
    });
  }
});

/// ======================================================
// GOOGLE / FACEBOOK FIREBASE SOCIAL LOGIN
// ======================================================

router.post("/social-login", async (req, res) => {
  try {
    const {
      firebaseToken
    } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: "Firebase token is required"
      });
    }

    const decodedToken =
      await admin.auth.verifyIdToken(
        firebaseToken
      );

    const email =
      decodedToken.email || null;

    const name =
      decodedToken.name ||
      decodedToken.email?.split("@")[0] ||
      "SkillTrack User";

    if (!email) {
      return res.status(400).json({
        message:
          "Email not available from Google. Please allow email permission."
      });
    }

    const existingUser =
      await pool.query(
        `
        SELECT
          user_id,
          name,
          email,
          role,
          trainee_id,
          admin_id
        FROM public.users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [email]
      );

    // ==================================================
    // EXISTING SKILLTRACK ACCOUNT
    // ==================================================

    if (existingUser.rows.length > 0) {
      const user =
        existingUser.rows[0];

      const token =
        jwt.sign(
          {
            user_id:
              user.user_id,

            email:
              user.email,

            role:
              user.role,

            trainee_id:
              user.trainee_id || null,

            admin_id:
              user.admin_id || null
          },

          process.env.JWT_SECRET ||
            "skilltrack-secret-key",

          {
            expiresIn: "1d"
          }
        );

      return res.json({
        status: "LOGIN_SUCCESS",

        message:
          "Google login successful",

        token,

        user: {
          user_id:
            user.user_id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          trainee_id:
            user.trainee_id || null,

          traineeId:
            user.trainee_id || null,

          admin_id:
            user.admin_id || null,

          adminId:
            user.admin_id || null
        }
      });
    }

    // ==================================================
    // NEW GOOGLE USER
    // ==================================================

    return res.json({
      status: "PROFILE_REQUIRED",

      message:
        "Please complete your SkillTrack profile before creating your account.",

      googleProfile: {
        name,
        email,
        firebaseUid:
          decodedToken.uid
      }
    });

  } catch (error) {
    console.error(
      "Social login error:",
      error
    );

    return res.status(401).json({
      message:
        "Invalid or expired Firebase login"
    });
  }
});

// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
  "/change-password",
  authenticateToken,
  async (req, res) => {
    try {
      const userId =
        req.user.user_id;

      const {
        oldPassword,
        newPassword
      } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error:
            "Current password and new password are required"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error:
            "New password must be at least 6 characters"
        });
      }

      const result =
        await pool.query(
          `
          SELECT password
          FROM public.users
          WHERE user_id = $1
          `,
          [userId]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "User not found"
        });
      }

      const user =
        result.rows[0];

      const passwordMatch =
        await bcrypt.compare(
          oldPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          error:
            "Current password is incorrect"
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      await pool.query(
        `
        UPDATE public.users
        SET password = $1
        WHERE user_id = $2
        `,
        [
          hashedPassword,
          userId
        ]
      );

      return res.json({
        message:
          "Password changed successfully"
      });

    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to change password"
      });
    }
  }
);
// ======================================================
// LOGOUT
// ======================================================

router.post(
  "/logout",
  authenticateToken,
  async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const decoded = req.user;

      const expiresAt = new Date(decoded.exp * 1000);

      await pool.query(
        `
        INSERT INTO public.revoked_tokens
        (
          token_hash,
          expires_at
        )
        VALUES
        ($1, $2)
        ON CONFLICT (token_hash) DO NOTHING
        `,
        [
          tokenHash,
          expiresAt
        ]
      );

      return res.json({
        message: "Logout successful"
      });

    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      return res.status(500).json({
        message: "Unable to logout"
      });
    }
  }
);

router.post(
  "/logout",
  authenticateToken,
  async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const expiresAt = new Date(req.user.exp * 1000);

      await pool.query(
        `
        INSERT INTO public.revoked_tokens
        (
          token_hash,
          expires_at
        )
        VALUES
        ($1, $2)
        ON CONFLICT (token_hash) DO NOTHING
        `,
        [tokenHash, expiresAt]
      );

      return res.json({
        message: "Logout successful"
      });

    } catch (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        message: "Unable to logout"
      });
    }
  }
);
module.exports = router;