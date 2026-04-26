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

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe una cuenta con este correo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name.trim(), normalizedEmail, passwordHash],
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [
      normalizedEmail,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = result.rows[0];

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = createToken(safeUser);

    return res.json({ user: safeUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

app.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        user_id AS "userId",
        type,
        concept,
        category,
        amount,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        is_recurring AS "isRecurring",
        recurring_day AS "recurringDay",
        recurring_parent_id AS "recurringParentId",
        is_shopping_movement AS "isShoppingMovement",
        created_automatically AS "createdAutomatically"
      FROM movements
      WHERE user_id = $1
      ORDER BY date DESC`,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener movimientos' });
  }
});

app.post('/api/movements', authMiddleware, async (req, res) => {
  try {
    const {
      type,
      concept,
      category,
      amount,
      date,
      isRecurring = false,
      recurringDay = null,
      recurringParentId = null,
      isShoppingMovement = false,
      createdAutomatically = false,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO movements (
        user_id, type, concept, category, amount, date,
        is_recurring, recurring_day, recurring_parent_id,
        is_shopping_movement, created_automatically
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING 
        id,
        user_id AS "userId",
        type,
        concept,
        category,
        amount,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        is_recurring AS "isRecurring",
        recurring_day AS "recurringDay",
        recurring_parent_id AS "recurringParentId",
        is_shopping_movement AS "isShoppingMovement",
        created_automatically AS "createdAutomatically"`,
      [
        req.user.id,
        type,
        concept,
        category,
        amount,
        date,
        isRecurring,
        recurringDay,
        recurringParentId,
        isShoppingMovement,
        createdAutomatically,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear movimiento' });
  }
});

app.put('/api/movements/:id', authMiddleware, async (req, res) => {
  try {
    const {
      type,
      concept,
      category,
      amount,
      date,
      isRecurring = false,
      recurringDay = null,
      recurringParentId = null,
      isShoppingMovement = false,
      createdAutomatically = false,
    } = req.body;

    const result = await pool.query(
      `UPDATE movements
       SET type = $1,
           concept = $2,
           category = $3,
           amount = $4,
           date = $5,
           is_recurring = $6,
           recurring_day = $7,
           recurring_parent_id = $8,
           is_shopping_movement = $9,
           created_automatically = $10
       WHERE id = $11 AND user_id = $12
       RETURNING
        id,
        user_id AS "userId",
        type,
        concept,
        category,
        amount,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        is_recurring AS "isRecurring",
        recurring_day AS "recurringDay",
        recurring_parent_id AS "recurringParentId",
        is_shopping_movement AS "isShoppingMovement",
        created_automatically AS "createdAutomatically"`,
      [
        type,
        concept,
        category,
        amount,
        date,
        isRecurring,
        recurringDay,
        recurringParentId,
        isShoppingMovement,
        createdAutomatically,
        req.params.id,
        req.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar movimiento' });
  }
});

app.delete('/api/movements/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM movements WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    return res.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar movimiento' });
  }
});

const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`EasyBudget API escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  });
