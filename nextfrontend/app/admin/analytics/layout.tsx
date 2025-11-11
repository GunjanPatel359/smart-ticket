"use client"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <main className="p-4">{children}</main>
    </div>
  );
}
