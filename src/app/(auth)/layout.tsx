export default function AuthChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--background)] px-4 py-10 sm:py-14">
      {children}
    </div>
  );
}
