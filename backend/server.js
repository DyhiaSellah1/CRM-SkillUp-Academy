const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

console.log("Ma DB URL est :", process.env.DATABASE_URL ? "Chargée ✅" : "Vide ❌");

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(cors());
app.use(express.json());

/* =========================
   1. ROUTE SANTÉ
========================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: "Serveur en ligne",
    database: process.env.DATABASE_URL ? "Configurée" : "Non configurée"
  });
});

/* =========================
   2. CONTACTS
========================= */
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, co.name AS company_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL détaillée :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { first_name, last_name, email, company_id } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (first_name, last_name, email, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, company_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création contact :", err.message);
    res.status(500).json({ error: "Erreur lors de la création du contact", details: err.message });
  }
});

/* =========================
   3. ENTREPRISES
========================= */
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération entreprises :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des entreprises", details: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  const { name, industry, city } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Le nom de l'entreprise est obligatoire" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO companies (name, industry, city) VALUES ($1, $2, $3) RETURNING *',
      [name, industry || null, city || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création entreprise :", err.message);
    res.status(500).json({ error: "Erreur lors de la création de l'entreprise", details: err.message });
  }
});

/* =========================
   4. LEADS
========================= */
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.*,
        c.first_name,
        c.last_name,
        ps.label AS stage_label
      FROM leads l
      LEFT JOIN contacts c ON l.contact_id = c.id
      LEFT JOIN pipeline_stages ps ON l.stage_id = ps.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération leads :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des leads", details: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  const { title, amount, contact_id, stage_id, status, source } = req.body;

  if (!title || !contact_id) {
    return res.status(400).json({ error: "Les champs title et contact_id sont obligatoires" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (title, amount, contact_id, stage_id, status, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        amount || 0,
        contact_id,
        stage_id || null,
        status || 'nouveau',
        source || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création lead :", err.message);
    res.status(500).json({ error: "Erreur lors de la création du lead", details: err.message });
  }
});

/* =========================
   5. TÂCHES
========================= */
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.*,
        l.title AS lead_title
      FROM tasks t
      LEFT JOIN leads l ON t.lead_id = l.id
      ORDER BY t.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération tâches :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des tâches", details: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { lead_id, title, due_date } = req.body;

  if (!lead_id || !title) {
    return res.status(400).json({ error: "Les champs lead_id et title sont obligatoires" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (lead_id, title, due_date) VALUES ($1, $2, $3) RETURNING *',
      [lead_id, title, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création tâche :", err.message);
    res.status(500).json({ error: "Erreur lors de la création de la tâche", details: err.message });
  }
});

/* =========================
   6. STATS
========================= */
app.get('/api/stats', async (req, res) => {
  try {
    const [leads, revenue, contacts, tasks] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query('SELECT SUM(amount) FROM leads'),
      pool.query('SELECT COUNT(*) FROM contacts'),
      pool.query('SELECT COUNT(*) FROM tasks')
    ]);

    res.json({
      leads: parseInt(leads.rows[0].count),
      revenue: parseFloat(revenue.rows[0].sum || 0),
      contacts: parseInt(contacts.rows[0].count),
      tasks: parseInt(tasks.rows[0].count)
    });
  } catch (err) {
    console.error("Erreur stats :", err.message);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques", details: err.message });
  }
});

/* Alias utile pour le dashboard frontend */
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [leads, revenue, contacts, tasks] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query('SELECT SUM(amount) FROM leads'),
      pool.query('SELECT COUNT(*) FROM contacts'),
      pool.query('SELECT COUNT(*) FROM tasks')
    ]);

    res.json({
      leads: parseInt(leads.rows[0].count),
      revenue: parseFloat(revenue.rows[0].sum || 0),
      contacts: parseInt(contacts.rows[0].count),
      tasks: parseInt(tasks.rows[0].count)
    });
  } catch (err) {
    console.error("Erreur dashboard stats :", err.message);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques", details: err.message });
  }
});
/* =========================
   7. UTILISATEURS
========================= */
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération utilisateurs :", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération des utilisateurs",
      details: err.message
    });
  }
});

app.post('/api/users', async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !role) {
    return res.status(400).json({
      error: "Les champs full_name, email et role sont obligatoires"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, password || null, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création utilisateur :", err.message);
    res.status(500).json({
      error: "Erreur lors de la création de l'utilisateur",
      details: err.message
    });
  }
});

/* =========================
   8. PIPELINE STAGES
========================= */
app.get('/api/pipeline-stages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pipeline_stages ORDER BY order_index ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération pipeline :", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération des étapes du pipeline",
      details: err.message
    });
  }
});

app.post('/api/pipeline-stages', async (req, res) => {
  const { label, order_index } = req.body;

  if (!label || !order_index) {
    return res.status(400).json({
      error: "Les champs label et order_index sont obligatoires"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pipeline_stages (label, order_index)
       VALUES ($1, $2)
       RETURNING *`,
      [label, order_index]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création étape pipeline :", err.message);
    res.status(500).json({
      error: "Erreur lors de la création de l'étape",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur SkillUp opérationnel sur le port ${PORT}`);
});