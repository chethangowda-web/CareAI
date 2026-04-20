import "../styles/globals.css";

export const metadata = {
  title: "CareAI – Medical Intelligence Assistant",
  description: "India-focused medical intelligence chat assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}

