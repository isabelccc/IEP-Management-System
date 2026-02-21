import { pool } from '../config/database.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const result = await pool.query(
            `SELECT id, email, password_hash, is_active, first_name, last_name, role
            FROM users
            WHERE email = $1`, [email.toLowerCase().trim()]
        )
        if (result.rows.length === 0) {
            // don’t reveal whether email exists
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = result.rows[0]
        if (!user.is_active) {
            return res.status(403).json({ error: "Account is disabled" });
        }
        const match = await bcrypt.compare(password, user.password_hash)
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });

        }
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
            },
            message: "Login successful"
        });





    } catch (err) {
        console.error("login error:", err);
        return res.status(500).json({ error: "Server error" });
    }

}

export const logout = async (req, res) => {

    try {
        res.clearCookie("token");
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


}

export const getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
            `SELECT id, email, role, is_active, first_name, last_name
             FROM users
             WHERE id = $1`,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error: "Account is disabled" });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        return res.status(500).json({ error: err.message });
    }
}