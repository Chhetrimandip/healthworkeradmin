const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hash}`);
  return hash;
}

// Change this to whatever password you want to hash
hashPassword('dermatologyadmin');