import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
  }),
);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'easybudget_secret_dev';

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS movements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL,
      concept VARCHAR(150) NOT NULL,
      category VARCHAR(80) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      date DATE NOT NULL,
      is_recurring BOOLEAN DEFAULT false,
      recurring_day INTEGER,
      recurring_parent_id INTEGER,
      is_shopping_movement BOOLEAN DEFAULT false,
      created_automatically BOOLEAN DEFAULT false,
      products JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      month VARCHAR(7) NOT NULL,
      category VARCHAR(80) NOT NULL,
      limit_amount NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'EasyBudget API funcionando' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe una cuenta con este correo' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, name, email`,
      [name.trim(), normalizedEmail, hash],
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({ user, token });
  } catch {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    const token = createToken(safeUser);

    res.json({ user: safeUser, token });
  } catch {
    res.status(500).json({ message: 'Error login' });
  }
});

app.put('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name=$1, email=$2
       WHERE id=$3
       RETURNING id,name,email`,
      [name.trim(), email.trim().toLowerCase(), req.user.id],
    );

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Error actualizando usuario' });
  }
});

app.delete('/api/users/me', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Cuenta eliminada' });
  } catch {
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
});

app.get('/api/movements', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT 
      id,
      user_id AS "userId",
      type,
      concept,
      category,
      amount,
      TO_CHAR(date,'YYYY-MM-DD') AS date,
      is_shopping_movement AS "isShoppingMovement",
      created_automatically AS "createdAutomatically",
      products
     FROM movements
     WHERE user_id=$1
     ORDER BY date DESC`,
    [req.user.id],
  );

  res.json(result.rows);
});

app.post('/api/movements', authMiddleware, async (req, res) => {
  const {
    type,
    concept,
    category,
    amount,
    date,
    isShoppingMovement = false,
    createdAutomatically = false,
    products = [],
  } = req.body;

  const result = await pool.query(
    `INSERT INTO movements
     (user_id,type,concept,category,amount,date,is_shopping_movement,created_automatically,products)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING 
      id,
      user_id AS "userId",
      type,
      concept,
      category,
      amount,
      TO_CHAR(date,'YYYY-MM-DD') AS date,
      is_shopping_movement AS "isShoppingMovement",
      created_automatically AS "createdAutomatically",
      products`,
    [
      req.user.id,
      type,
      concept,
      category,
      amount,
      date,
      isShoppingMovement,
      createdAutomatically,
      JSON.stringify(products),
    ],
  );

  res.json(result.rows[0]);
});

app.put('/api/movements/:id', authMiddleware, async (req, res) => {
  const { type, concept, category, amount, date, products = [] } = req.body;

  const result = await pool.query(
    `UPDATE movements
     SET type=$1,concept=$2,category=$3,amount=$4,date=$5,products=$6
     WHERE id=$7 AND user_id=$8
     RETURNING 
      id,
      user_id AS "userId",
      type,
      concept,
      category,
      amount,
      TO_CHAR(date,'YYYY-MM-DD') AS date,
      products`,
    [type, concept, category, amount, date, JSON.stringify(products), req.params.id, req.user.id],
  );

  res.json(result.rows[0]);
});

app.delete('/api/movements/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM movements WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ message: 'Eliminado' });
});

app.get('/api/budgets', authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT 
      id,
      user_id AS "userId",
      month,
      category,
      limit_amount AS "limit"
     FROM budgets
     WHERE user_id=$1`,
    [req.user.id],
  );

  res.json(result.rows);
});

app.post('/api/budgets', authMiddleware, async (req, res) => {
  const { month, category, limit } = req.body;

  const result = await pool.query(
    `INSERT INTO budgets (user_id,month,category,limit_amount)
     VALUES ($1,$2,$3,$4)
     RETURNING id,user_id AS "userId",month,category,limit_amount AS "limit"`,
    [req.user.id, month, category, limit],
  );

  res.json(result.rows[0]);
});

app.put('/api/budgets/:id', authMiddleware, async (req, res) => {
  const { month, category, limit } = req.body;

  const result = await pool.query(
    `UPDATE budgets
     SET month=$1,category=$2,limit_amount=$3
     WHERE id=$4 AND user_id=$5
     RETURNING id,user_id AS "userId",month,category,limit_amount AS "limit"`,
    [month, category, limit, req.params.id, req.user.id],
  );

  res.json(result.rows[0]);
});

app.delete('/api/budgets/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM budgets WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ message: 'Eliminado' });
});

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
});
