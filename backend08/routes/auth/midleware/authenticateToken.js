const jwt = require('jsonwebtoken');
const secretKey = 'kunciRahasiaYangSama';

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ada' });
  }
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format token tidak valid' });
  }

  const tokenValue = tokenParts[1];

  jwt.verify(tokenValue, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }
    const { id_register_pegawai, username } = decoded; // Mengganti userId dengan id_register_pegawai
    req.user = { id_register_pegawai, username }; // Mengganti userId dengan id_register_pegawai
    next();
  });
}

module.exports = authenticateToken;
