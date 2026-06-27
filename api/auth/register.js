const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getPool = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Все поля обязательны' });

  try {
    const { rows: existing } = await getPool().query(
      `SELECT id FROM "User" WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await getPool().query(
      `INSERT INTO "User" (id, name, email, "passwordHash", role)
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'BUYER')
       RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase(), hash]
    );

    const user = rows[0];
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        token,
        user: { name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
