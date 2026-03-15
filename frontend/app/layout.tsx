import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#f6f8fc]">
        <div className="flex min-h-screen items-stretch">
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}