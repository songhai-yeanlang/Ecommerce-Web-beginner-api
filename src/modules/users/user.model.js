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

const findByEmail = async (email) => {
    const sql = `
        SELECT id, name, email, is_verified
        FROM users
        WHERE email = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
};

const updateVerificationToken = async (id, verificationToken, verificationExpires) => {
    const sql = `UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?`;
    await pool.query(sql, [verificationToken, verificationExpires, id]);
};

const findForLogin = async (email) => {
    const sql = `
        SELECT id, name, email, password, role, is_verified, is_active
        FROM users
        WHERE email = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
};

const findById = async (id) => {
    const sql = `
        SELECT id, name, email, role, is_verified, is_active, address, phone, bio
        FROM users
        WHERE id = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

const findPasswordById = async (id) => {
    const sql = `SELECT password FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

const updatePassword = async (id, newPasswordHash) => {
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    await pool.query(sql, [newPasswordHash, id]);
};

const deleteProfile = async (id) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    await pool.query(sql, [id]);
};

const updateProfile = async (data) => {
    let sql = `UPDATE users SET name = ?, address = ?, phone = ?, bio = ? WHERE id = ?`;
    let params = [data.name, data.address, data.phone, data.bio, data.id];
    let [row] = await pool.query(sql, params);
    return row;
};

const updateToken = async (id, token) => {
    const sql = `UPDATE users SET token = ? WHERE id = ?`;
    await pool.query(sql, [token, id]);
};

const findTokenById = async (id) => {
    const sql = `SELECT token FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

module.exports = {
    register,
    findByVerificationToken,
    markEmailAsVerified,
    findByEmail,
    updateVerificationToken,
    findForLogin,
    findById,
    findPasswordById,
    updatePassword,
    deleteProfile,
    updateProfile,
    updateToken,
    findTokenById
};
