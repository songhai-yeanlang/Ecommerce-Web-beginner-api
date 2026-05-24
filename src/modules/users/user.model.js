const pool = require('../../shared/configs/db.config');

const register = async (data) => {
    const sql = `
        INSERT INTO users (name, email, password, verification_token, verification_expires, is_verified, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        data.name,
        data.email,
        data.password,
        data.verificationToken,
        data.verificationExpires,
        data.isVerified,
        'user',
        data.isActive
    ];
    const [row] = await pool.query(sql, params);

    return row;
};

const findByVerificationToken = async (verificationToken) => {
    const sql = `
        SELECT id, name, email, is_verified, is_active, verification_expires
        FROM users
        WHERE verification_token = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [verificationToken]);

    return rows[0];
};

const markEmailAsVerified = async (id) => {
    const sql = `
        UPDATE users SET is_verified = 1, is_active = 1, verification_token = NULL,
            verification_expires = NULL
        WHERE id = ?
    `;
    const [row] = await pool.query(sql, [id]);

    return row;
};

module.exports = {
    register,
    findByVerificationToken,
    markEmailAsVerified
};
