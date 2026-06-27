const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getPool = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: 'Email и пароль обязательны' });

  try {
    const { rows } = await getPool().query(
      `SELECT id, name, email, "passwordHash", role
       FROM "User" WHERE email = $1`,
      [email.toLowerCase()]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Неверный email или пароль' });

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
