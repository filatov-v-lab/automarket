const getPool = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  try {
    const { rows } = await getPool().query(
      `SELECT pk, name, description, maker,
              price::float8 AS price,
              stock, units, img, "catId", props
       FROM "Product"
       WHERE "isActive" = true
       ORDER BY pk
       LIMIT $1`,
      [limit]
    );

    res.json({ data: { items: rows } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
