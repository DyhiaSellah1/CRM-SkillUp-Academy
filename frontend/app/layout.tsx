import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "SkillUp CRM",
  description: "CRM web moderne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}