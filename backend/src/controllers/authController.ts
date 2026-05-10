import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.query()
      .where("email", email)
      .orWhere("username", username)
      .first();

    if (existingUser) {
      return res.status(400).json({ message: "Kullanıcı adı veya e-posta zaten kullanımda." });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.query().insert({
      username,
      email,
      password_hash,
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user as any;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.query().where("email", email).first();

    if (!user) {
      return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
    }

    // Update last login
    await User.query().patchAndFetchById(user.id, { last_login_at: new Date().toISOString() });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user as any;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
