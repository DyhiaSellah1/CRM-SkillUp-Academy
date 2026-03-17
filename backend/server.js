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

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
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
      `INSERT INTO contacts (first_name, last_name, email, company_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [first_name, last_name, email, company_id || null]
    );

    try {
      await sendEmail(
        email,
        "Bienvenue chez SkillUp CRM",
        `
          <h2>Bienvenue ${first_name} ${last_name}</h2>
          <p>Votre contact a bien été enregistré dans notre CRM SkillUp.</p>
          <p>Nous vous recontacterons prochainement.</p>
        `
      );

      await sendEmail(
        "dihiasellah1@gmail.com",
        "Nouveau contact créé",
        `
          <h2>Nouveau contact créé</h2>
          <p><b>Nom :</b> ${first_name} ${last_name}</p>
          <p><b>Email :</b> ${email}</p>
          <p><b>Company ID :</b> ${company_id || "Non renseignée"}</p>
        `
      );
    } catch (mailError) {
      console.error("Erreur email contact :", mailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Contact créé avec succès",
      contact: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur création contact :", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création du contact",
      details: err.message
    });
  }
});

app.patch('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, company_id } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      error: "Les champs first_name, last_name et email sont obligatoires"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE contacts
       SET first_name = $1,
           last_name = $2,
           email = $3,
           company_id = $4
       WHERE id = $5
       RETURNING *`,
      [first_name, last_name, email, company_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact introuvable" });
    }

    res.json({
      success: true,
      message: "Contact modifié avec succès",
      contact: result.rows[0]
    });
  } catch (err) {
    console.error("Erreur modification contact :", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la modification du contact",
      details: err.message
    });
  }
});


app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM contacts
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact introuvable" });
    }

    res.json({
      success: true,
      message: "Contact supprimé avec succès",
      id: Number(id)
    });
  } catch (err) {
    console.error("Erreur suppression contact :", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression du contact",
      details: err.message
    });
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
  const {
    title,
    amount,
    contact_id,
    stage_id,
    status,
    source,
    probability,
    assigned_user_id,
    expected_close_date,
    notes
  } = req.body;

  if (!title || !contact_id) {
    return res.status(400).json({
      error: "Les champs title et contact_id sont obligatoires"
    });
  }

  try {
const result = await pool.query(
  `INSERT INTO leads
   (title, amount, contact_id, stage_id, status, source, probability, assigned_user_id, expected_close_date, notes)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
   RETURNING *`,
  [
    title,
    amount || 0,
    contact_id,
    stage_id || null,
    status || 'nouveau',
    source || null,
    probability || 50,
    assigned_user_id || null,
    expected_close_date || null,
    notes || null
  ]
);
try {
  await sendEmail(
    "dihiasellah1@gmail.com",
    "Nouveau lead créé",
    `
      <h2>Nouveau lead créé</h2>
      <p><b>Titre :</b> ${title}</p>
      <p><b>Montant :</b> ${amount || 0} €</p>
      <p><b>Source :</b> ${source || "Non renseignée"}</p>
      <p><b>Contact ID :</b> ${contact_id}</p>
    `
  );
} catch (mailError) {
  console.error("Erreur email admin lead :", mailError.message);
}
if (assigned_user_id) {
  const assignedUserResult = await pool.query(
    `SELECT full_name, email FROM users WHERE id = $1`,
    [assigned_user_id]
  );

  if (assignedUserResult.rows.length > 0) {
    const assignedUser = assignedUserResult.rows[0];

    await sendEmail(
      assignedUser.email,
      "Nouveau lead assigné",
      `
        <h2>Bonjour ${assignedUser.full_name}</h2>
        <p>Un nouveau lead vous a été assigné.</p>
        <p><b>Titre :</b> ${title}</p>
        <p><b>Montant :</b> ${amount || 0} €</p>
        <p><b>Source :</b> ${source || "Non renseignée"}</p>
      `
    );
  }
}
/*
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
*/
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
        t.id,
        t.lead_id,
        t.title,
        t.due_date,
        t.is_completed,
        t.priority,
        l.title AS lead_title
      FROM tasks t
      LEFT JOIN leads l ON t.lead_id = l.id
      ORDER BY t.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération tâches :", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération des tâches",
      details: err.message
    });
  }
});


app.post('/api/tasks', async (req, res) => {
  const { lead_id, title, due_date, priority, assigned_user_id } = req.body;

  if (!lead_id || !title) {
    return res.status(400).json({
      error: "Les champs lead_id et title sont obligatoires"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (lead_id, title, due_date, priority, is_completed, assigned_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        lead_id,
        title,
        due_date || null,
        priority || "moyenne",
        false,
        assigned_user_id || null
      ]
    );

    const newTask = result.rows[0];

    // 1) Mail admin systématique
    try {
      await sendEmail(
        "dihiasellah1@gmail.com",
        "Nouvelle tâche créée",
        `
          <h2>Nouvelle tâche créée</h2>
          <p><b>Titre :</b> ${title}</p>
          <p><b>Lead ID :</b> ${lead_id}</p>
          <p><b>Date d’échéance :</b> ${due_date || "Non définie"}</p>
          <p><b>Priorité :</b> ${priority || "moyenne"}</p>
          <p><b>Assigned user id :</b> ${assigned_user_id || "Aucun"}</p>
        `
      );
      console.log("Mail admin tâche envoyé");
    } catch (mailError) {
      console.error("Erreur email admin tâche :", mailError.message);
    }

    // 2) Mail à l’utilisateur assigné si présent
    if (assigned_user_id) {
      try {
        const assignedUserResult = await pool.query(
          `SELECT full_name, email FROM users WHERE id = $1`,
          [assigned_user_id]
        );

        if (assignedUserResult.rows.length > 0) {
          const assignedUser = assignedUserResult.rows[0];

          await sendEmail(
            assignedUser.email,
            "Nouvelle tâche assignée",
            `
              <h2>Bonjour ${assignedUser.full_name}</h2>
              <p>Une nouvelle tâche vous a été assignée.</p>
              <p><b>Tâche :</b> ${title}</p>
              <p><b>Date d’échéance :</b> ${due_date || "Non définie"}</p>
            `
          );

          console.log("Mail utilisateur assigné envoyé");
        } else {
          console.log("Aucun utilisateur trouvé pour assigned_user_id =", assigned_user_id);
        }
      } catch (mailError) {
        console.error("Erreur email utilisateur tâche :", mailError.message);
      }
    }

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Erreur création tâche :", err.message);
    res.status(500).json({
      error: "Erreur lors de la création de la tâche",
      details: err.message
    });
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

app.get('/api/dashboard', async (req, res) => {
  try {
    const [
      kpisResult,
      pipelineResult,
      sourceResult,
      monthlyRevenueResult,
      recentActivityResult,
      topCommercialsResult,
      tasksOverviewResult,
      totalContactsResult,
      totalCompaniesResult
    ] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'converti' THEN amount ELSE 0 END), 0) AS total_revenue,
          COUNT(*) AS total_leads,
          COUNT(*) FILTER (WHERE status = 'converti') AS converted_leads,
          COUNT(*) FILTER (WHERE status = 'en cours') AS active_leads
        FROM leads
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
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month_key,
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month_label,
          COALESCE(SUM(amount), 0) AS revenue
        FROM leads
        WHERE status = 'converti'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at) ASC
        LIMIT 12
      `),

      pool.query(`
        (
          SELECT
            'lead' AS type,
            l.id,
            l.title AS label,
            l.created_at,
            CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) AS meta
          FROM leads l
          LEFT JOIN contacts c ON l.contact_id = c.id
        )
        UNION ALL
        (
          SELECT
            'task' AS type,
            t.id,
            t.title AS label,
            COALESCE(t.created_at, t.due_date) AS created_at,
            t.status AS meta
          FROM tasks t
        )
        ORDER BY created_at DESC
        LIMIT 8
      `),

      pool.query(`
        SELECT
          u.id,
          u.full_name,
          u.role,
          COUNT(l.id) AS total_leads,
          COALESCE(SUM(CASE WHEN l.status = 'converti' THEN l.amount ELSE 0 END), 0) AS revenue
        FROM users u
        LEFT JOIN leads l ON l.assigned_user_id = u.id
        WHERE u.role IN ('commercial', 'admin')
        GROUP BY u.id, u.full_name, u.role
        ORDER BY revenue DESC, total_leads DESC, u.full_name ASC
        LIMIT 5
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total_tasks,
          COUNT(*) FILTER (WHERE status = 'terminee') AS completed_tasks,
          COUNT(*) FILTER (WHERE status IN ('nouvelle', 'en_attente', 'en_cours')) AS pending_tasks,
          COUNT(*) FILTER (
            WHERE due_date < NOW()
            AND status != 'terminee'
          ) AS overdue_tasks
        FROM tasks
      `),

      pool.query(`
        SELECT COUNT(*) AS total_contacts
        FROM contacts
      `),

      pool.query(`
        SELECT COUNT(*) AS total_companies
        FROM companies
      `)
    ]);

    const kpis = kpisResult.rows[0];

    const totalRevenue = Number(kpis.total_revenue || 0);
    const totalLeads = Number(kpis.total_leads || 0);
    const convertedLeads = Number(kpis.converted_leads || 0);
    const activeLeads = Number(kpis.active_leads || 0);

    const conversionRate =
      totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalLeads,
          convertedLeads,
          activeLeads,
          conversionRate,
          totalContacts: Number(totalContactsResult.rows[0].total_contacts || 0),
          totalCompanies: Number(totalCompaniesResult.rows[0].total_companies || 0),
          totalTasks: Number(tasksOverviewResult.rows[0].total_tasks || 0),
          completedTasks: Number(tasksOverviewResult.rows[0].completed_tasks || 0),
          pendingTasks: Number(tasksOverviewResult.rows[0].pending_tasks || 0),
          overdueTasks: Number(tasksOverviewResult.rows[0].overdue_tasks || 0)
        },
        pipeline: pipelineResult.rows.map((row) => ({
          id: row.id,
          label: row.label,
          order_index: Number(row.order_index),
          total: Number(row.total),
          amount: Number(row.amount)
        })),
        leadsBySource: sourceResult.rows.map((row) => ({
          source: row.source,
          total: Number(row.total)
        })),
        monthlyRevenue: monthlyRevenueResult.rows.map((row) => ({
          monthKey: row.month_key,
          monthLabel: row.month_label,
          revenue: Number(row.revenue)
        })),
        recentActivity: recentActivityResult.rows,
        topCommercials: topCommercialsResult.rows.map((row) => ({
          id: row.id,
          full_name: row.full_name,
          role: row.role,
          total_leads: Number(row.total_leads),
          revenue: Number(row.revenue)
        }))
      }
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard'
    });
  }
});

/* =========================
   7. UTILISATEURS
========================= */
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role, requesterEmail } = req.body;

    if (!['user', 'commercial'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    if (requesterEmail !== 'sellahdyhia@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : seul l’admin peut modifier les rôles'
      });
    }

    const userResult = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.email === 'sellahdyhia@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Le compte admin principal ne peut pas être modifié'
      });
    }

    const updated = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, full_name, email, role, created_at`,
      [role, userId]
    );

    res.json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      user: updated.rows[0]
    });
  } catch (error) {
    console.error('Erreur modification rôle :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rôle'
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
    const info = await sendEmail(
      "dihiasellah1@gmail.com",
      "Test Brevo SkillUp CRM",
      "<h2>Email test</h2><p>Brevo fonctionne correctement.</p>"
    );

    res.json({
      message: "Email envoyé",
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    console.error("Erreur test email :", error);

    res.status(500).json({
      error: "Erreur envoi email",
      details: error.message,
    });
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
        l.probability,
        l.assigned_user_id,
        l.expected_close_date,
        l.notes,
        c.first_name,
        c.last_name,
        co.name AS company_name,
        u.full_name AS assigned_user_name
      FROM leads l
      LEFT JOIN contacts c ON l.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN users u ON l.assigned_user_id = u.id
      ORDER BY l.created_at DESC
    `);

    const board = stagesResult.rows.map((stage) => ({
      ...stage,
      leads: leadsResult.rows.filter(
        (lead) => Number(lead.stage_id) === Number(stage.id)
      ),
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

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;

  try {
    const currentTask = await pool.query(
      `SELECT id, is_completed, status
       FROM tasks
       WHERE id = $1`,
      [id]
    );

    if (currentTask.rows.length === 0) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }

    const task = currentTask.rows[0];
    const newCompleted = !task.is_completed;
    const newStatus = newCompleted ? "terminee" : "en_attente";

    const result = await pool.query(
      `UPDATE tasks
       SET is_completed = $1,
           status = $2
       WHERE id = $3
       RETURNING
         id,
         lead_id,
         title,
         due_date,
         is_completed,
         status,
         priority,
         task_type,
         assigned_user_id`,
      [newCompleted, newStatus, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur toggle tâche :", err.message);
    res.status(500).json({
      error: "Erreur lors de la mise à jour de la tâche",
      details: err.message,
    });
  }
});

app.patch('/api/leads/:id/stage', async (req, res) => {
  const { id } = req.params;
  const { stage_id } = req.body;

  if (!stage_id) {
    return res.status(400).json({
      error: "Le champ stage_id est obligatoire"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET stage_id = $1
       WHERE id = $2
       RETURNING *`,
      [stage_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Lead introuvable"
      });
    }

    const lead = result.rows[0];

    const stageResult = await pool.query(
      `SELECT label FROM pipeline_stages WHERE id = $1`,
      [stage_id]
    );

    const assignedUserResult = await pool.query(
      `SELECT full_name, email FROM users WHERE id = $1`,
      [lead.assigned_user_id]
    );

    const stageLabel = stageResult.rows[0]?.label || "Étape inconnue";

    if (assignedUserResult.rows.length > 0) {
      const assignedUser = assignedUserResult.rows[0];

      await sendEmail(
        assignedUser.email,
        "Mise à jour du pipeline",
        `
          <h2>Bonjour ${assignedUser.full_name}</h2>
          <p>Le lead <b>${lead.title}</b> a été déplacé dans le pipeline.</p>
          <p><b>Nouvelle étape :</b> ${stageLabel}</p>
        `
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur mise à jour stage lead :", err.message);
    res.status(500).json({
      error: "Erreur lors du déplacement du lead",
      details: err.message
    });
  }
});

app.patch('/api/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, city } = req.body;

  try {
    const result = await pool.query(
      `UPDATE companies
       SET name = $1,
           industry = $2,
           city = $3
       WHERE id = $4
       RETURNING *`,
      [name, industry || null, city || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entreprise introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification entreprise :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM companies
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entreprise introuvable" });
    }

    res.json({ message: "Entreprise supprimée", id: Number(id) });
  } catch (err) {
    console.error("Erreur suppression entreprise :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.patch('/api/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, city } = req.body;

  try {
    const result = await pool.query(
      `UPDATE companies
       SET name = $1,
           industry = $2,
           city = $3
       WHERE id = $4
       RETURNING *`,
      [name, industry || null, city || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entreprise introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification entreprise :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM companies
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entreprise introuvable" });
    }

    res.json({ message: "Entreprise supprimée", id: Number(id) });
  } catch (err) {
    console.error("Erreur suppression entreprise :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    amount,
    contact_id,
    stage_id,
    status,
    source,
    probability,
    assigned_user_id,
    expected_close_date,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE leads
       SET title = $1,
           amount = $2,
           contact_id = $3,
           stage_id = $4,
           status = $5,
           source = $6,
           probability = $7,
           assigned_user_id = $8,
           expected_close_date = $9,
           notes = $10
       WHERE id = $11
       RETURNING *`,
      [
        title,
        amount || 0,
        contact_id,
        stage_id,
        status,
        source || null,
        probability || 50,
        assigned_user_id || null,
        expected_close_date || null,
        notes || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }
    const updatedLead = result.rows[0];

    if (updatedLead.assigned_user_id && (updatedLead.status === "converti" || updatedLead.status === "perdu")) {
      const assignedUserResult = await pool.query(
        `SELECT full_name, email FROM users WHERE id = $1`,
        [updatedLead.assigned_user_id]
      );

      if (assignedUserResult.rows.length > 0) {
        const assignedUser = assignedUserResult.rows[0];

        if (updatedLead.status === "converti") {
          await sendEmail(
            assignedUser.email,
            "Lead gagné 🎉",
            `
              <h2>Bravo ${assignedUser.full_name}</h2>
              <p>Le lead <b>${updatedLead.title}</b> a été marqué comme gagné.</p>
              <p><b>Montant :</b> ${updatedLead.amount || 0} €</p>
            `
          );
        }

        if (updatedLead.status === "perdu") {
          await sendEmail(
            assignedUser.email,
            "Lead perdu",
            `
              <h2>Bonjour ${assignedUser.full_name}</h2>
              <p>Le lead <b>${updatedLead.title}</b> a été marqué comme perdu.</p>
              <p>Vous pouvez consulter le CRM pour plus de détails.</p>
            `
          );
        }
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification lead :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM leads
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    res.json({ message: "Lead supprimé", id: Number(id) });
  } catch (err) {
    console.error("Erreur suppression lead :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    due_date,
    priority,
    status,
    lead_id
  } = req.body;

  const is_completed = status === "terminee";

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           due_date = $2,
           priority = $3,
           status = $4,
           lead_id = $5,
           is_completed = $6
       WHERE id = $7
       RETURNING *`,
      [
        title,
        due_date || null,
        priority || "moyenne",
        status || "nouvelle",
        lead_id,
        is_completed,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification tâche :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tâche introuvable" });
    }

    res.json({ message: "Tâche supprimée", id: Number(id) });
  } catch (err) {
    console.error("Erreur suppression tâche :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role, requesterEmail } = req.body;

    if (!['user', 'commercial'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    if (requesterEmail !== 'sellahdyhia@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : seul l’admin peut modifier les rôles'
      });
    }

    const userResult = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.email === 'sellahdyhia@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Le compte admin principal ne peut pas être modifié'
      });
    }

    const updated = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, full_name, email, role`,
      [role, userId]
    );

    res.json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      user: updated.rows[0]
    });
  } catch (error) {
    console.error('Erreur modification rôle :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rôle'
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

