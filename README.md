🚀 SkillUp CRM — Plateforme de Gestion de Formation

Next.js 14 | Node.js | PostgreSQL | Brevo

SkillUp CRM est une solution FullStack conçue pour digitaliser et centraliser la gestion commerciale de SkillUp Academy. L'objectif est de transformer des processus manuels en une plateforme fluide permettant de piloter le cycle de vente, de la détection du prospect à la conversion finale.

🔗 Lien du projet en ligne : https://crm-skill-up-academyfront-gnykoa63t-dyhiasellah1s-projects.vercel.app/login

🏢 Contexte & Entreprise Cible

SkillUp Academy est un organisme de formation professionnelle proposant des programmes de formation destinés aux entreprises et aux particuliers.
    Centraliser les données clients (Contacts & Entreprises).

    Tracer chaque interaction pour éviter les pertes d'informations.

    Automatiser les relances et le marketing via l'envoi d'emails.

    Piloter l'activité grâce à une vue d'ensemble (Dashboard & Pipeline).

✨ Fonctionnalités Clés

    📊 Tableau de Bord : Visualisation en temps réel des KPIs (nombre de leads, CA potentiel, tâches en cours).

    📈 Pipeline Commercial : Suivi dynamique des opportunités à travers 7 étapes clés (Nouveau, Qualification, Proposition, etc.).

    👥 Gestion CRM 360° : Modules dédiés pour les Leads, Contacts et Entreprises avec gestion des relations.

    📅 Organisation des Tâches : Planification des appels, rendez-vous et relances liés aux opportunités.

    📣 Marketing Automation : Intégration de l'API Brevo pour les notifications et campagnes d'emails.

    🛡️ Gestion des Rôles : Accès différenciés pour les Commerciaux et les Administrateurs.

🛠️ Stack Technique

    Frontend : Next.js 14 (App Router), React, Tailwind CSS, TypeScript.

    Backend : Node.js, Express.js.

    Base de Données : PostgreSQL Neon/Supabase.

    Services Cloud : Brevo (Emails), Vercel (Hébergement), GitHub (CI/CD).

    DevOps : Docker & Docker Compose pour l'environnement local.

📂 Structure du Dépôt

Plaintext

SkillUp CRM
├── backend          # API REST & Logique métier (Node.js)
├── frontend         # Interface utilisateur (Next.js)
├── diagrams         # Modélisation (Use Case, Classe, ER)
├── docker-compose.yml
└── README.md

🚀 Installation et Lancement Rapide

1. Cloner le projet

Bash

git clone https://github.com/DyhiaSellah1/CRM-SkillUp-Academy.git
cd CRM-SkillUp-Academy

2. Lancer avec Docker

Bash

docker-compose up --build

Accès : Frontend (3000) | Backend (3001)

3. Lancement manuel

   Backend : cd backend && npm install && npm run dev

   Frontend : cd frontend && npm install && npm run dev

📚 Documentation & Rapport

Le rapport de projet complet, incluant l'analyse détaillée, les diagrammes UML et les choix d'architecture, est disponible ici :

👉 Télécharger le Rapport - SkillUp Academy

Réalisé par Dyhia Sellah — Projet Académique CRM SaaS
