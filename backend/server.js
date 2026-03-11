const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const { sendEmail } = require('./src/mail/mailservice');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
   // console.log("contact");
    //console.log(req);
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
    res.status(500).json({
      error: "Erreur lors de la récupération des leads",
      details: err.message
    });
  }
});

app.post('/api/leads', async (req, res) => {
  const { title, amount, contact_id, stage_id, status, source } = req.body;

  if (!title || !contact_id) {
    return res.status(400).json({
      error: "Les champs title et contact_id sont obligatoires"
    });
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

    // Brevo peut être remis plus tard si besoin
await sendEmail(
  "dihiasellah1@gmail.com",
  "Nouveau lead créé",
  `<h2>Nouveau lead</h2>
   <p>Un nouveau lead a été créé dans SkillUp CRM.</p>
   <p><b>Titre :</b> ${title}</p>
   <p><b>Montant :</b> ${amount} €</p>
   <p><b>Source :</b> ${source || "Non renseignée"}</p>`
);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création lead :", err.message);
    res.status(500).json({
      error: "Erreur lors de la création du lead",
      details: err.message
    });
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

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [leads, revenue, contacts, tasks, converted, lost] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM leads'),
      pool.query('SELECT COUNT(*) FROM contacts'),
      pool.query('SELECT COUNT(*) FROM tasks'),
      pool.query("SELECT COUNT(*) FROM leads WHERE status = 'converti'"),
      pool.query("SELECT COUNT(*) FROM leads WHERE status = 'perdu'")
    ]);

    res.json({
      leads: parseInt(leads.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total),
      contacts: parseInt(contacts.rows[0].count),
      tasks: parseInt(tasks.rows[0].count),
      converted: parseInt(converted.rows[0].count),
      lost: parseInt(lost.rows[0].count)
    });
  } catch (err) {
    console.error("Erreur dashboard stats :", err.message);
    res.status(500).json({
      error: "Erreur lors du calcul des statistiques",
      details: err.message
    });
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

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({
      error: "Les champs full_name, email, password et role sont obligatoires"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name.trim(), email.trim(), hashedPassword, role]
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


app.get('/api/test-email', async (req, res) => {
  try {

    await sendEmail(
      "dihiasellah1@gmail.com",
      "Test Brevo SkillUp CRM",
      "<h2>Email test</h2><p>Brevo fonctionne correctement.</p>"
    );

    res.json({ message: "Email envoyé" });

  } catch (error) {

    res.status(500).json({ error: "Erreur envoi email" });

  }

});

app.post('/api/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      error: "Tous les champs sont obligatoires"
    });
  }

  try {
    const trimmedFullName = full_name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [trimmedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Cet email existe déjà"
      });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [trimmedFullName, trimmedEmail, hashedPassword, 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur inscription :", err.message);
    res.status(500).json({
      error: "Erreur lors de l'inscription",
      details: err.message
    });
  }
});

/*app.post('/api/register', async (req, res) => {
  console.log("BODY RECU /api/register :", req.body);

  const { full_name, email, password } = req.body;

  // Trim the values before checking
  const trimmedFullName = full_name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedFullName || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({
      error: "Tous les champs sont obligatoires"
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Cet email existe déjà"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [trimmedFullName, trimmedEmail, hashedPassword, 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur inscription :", err.message);
    res.status(500).json({
      error: "Erreur lors de l'inscription",
      details: err.message
    });
  }
});
*/

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe obligatoires" });
  }

  try {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const result = await pool.query(
      `SELECT id, full_name, email, role, password
       FROM users
       WHERE email = $1`,
      [trimmedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(trimmedPassword, user.password);

    if (!ok) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur login :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" });
    }

    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}
app.get('/api/seed-admin', async (req, res) => {
  try {
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['sellahdyhia@gmail.com']
    );

    if (existingAdmin.rows.length > 0) {
      return res.json({ message: "Admin déjà existant" });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      ['Admin', 'sellahdyhia@gmail.com', hashedPassword, 'admin']
    );

    res.json({
      message: "Compte admin créé",
      admin: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur création admin :", err.message);
    res.status(500).json({
      error: "Erreur lors de la création de l'admin",
      details: err.message
    });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'commercial', 'admin'].includes(role)) {
    return res.status(400).json({
      error: "Rôle invalide"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, full_name, email, role, created_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Utilisateur introuvable"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur mise à jour rôle :", err.message);
    res.status(500).json({
      error: "Erreur lors de la mise à jour du rôle",
      details: err.message
    });
  }
});

app.get('/api/pipeline-board', async (req, res) => {
  try {
    const stagesResult = await pool.query(`
      SELECT id, label, order_index
      FROM pipeline_stages
      ORDER BY order_index ASC
    `);

    const leadsResult = await pool.query(`
      SELECT
        l.id,
        l.title,
        l.amount,
        l.status,
        l.source,
        l.stage_id,
        l.created_at,
        c.first_name,
        c.last_name
      FROM leads l
      LEFT JOIN contacts c ON l.contact_id = c.id
      ORDER BY l.created_at DESC
    `);

    const board = stagesResult.rows.map((stage) => ({
      ...stage,
      leads: leadsResult.rows.filter((lead) => Number(lead.stage_id) === Number(stage.id))
    }));

    res.json(board);
  } catch (err) {
    console.error("Erreur pipeline board :", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération du pipeline",
      details: err.message
    });
  }
});

app.get('/api/stats/details', async (req, res) => {
  try {
    const [byStatus, bySource, byStage] = await Promise.all([
      pool.query(`
        SELECT
          status,
          COUNT(*) AS total,
          COALESCE(SUM(amount), 0) AS amount
        FROM leads
        GROUP BY status
        ORDER BY status
      `),
      pool.query(`
        SELECT
          COALESCE(source, 'Non renseignée') AS source,
          COUNT(*) AS total
        FROM leads
        GROUP BY source
        ORDER BY total DESC
      `),
      pool.query(`
        SELECT
          ps.id,
          ps.label,
          ps.order_index,
          COUNT(l.id) AS total,
          COALESCE(SUM(l.amount), 0) AS amount
        FROM pipeline_stages ps
        LEFT JOIN leads l ON l.stage_id = ps.id
        GROUP BY ps.id, ps.label, ps.order_index
        ORDER BY ps.order_index ASC
      `)
    ]);

    res.json({
      byStatus: byStatus.rows,
      bySource: bySource.rows,
      byStage: byStage.rows
    });
  } catch (err) {
    console.error("Erreur stats details :", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques détaillées",
      details: err.message
    });
  }
});
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur SkillUp opérationnel sur le port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ Erreur serveur :", err);
});

server.on("close", () => {
  console.log("⚠️ Le serveur a été fermé");
});
