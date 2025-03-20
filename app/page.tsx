"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      // User is authenticated, redirect to products page
      router.replace('/products');
    } else {
      // User is not authenticated, redirect to login page
      router.replace('/login');
    }
  }, [session, status, router]);

  // Show a simple loading state while checking authentication
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you</p>
      </div>
    </div>
  );
}