import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="w-full bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 sm:mx-8 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          &copy; {currentYear} Svenn Products. All rights reserved.
        </div>
        <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
          <Link href="/products" className="hover:underline">Products</Link>
          <span className="mx-2">|</span>
          <Link href="/scripts" className="hover:underline">Scripts</Link>
          <span className="mx-2">|</span>
          <Link href="/settings" className="hover:underline">Settings</Link>
        </div>
      </div>
    </div>
  );
}
