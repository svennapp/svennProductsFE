"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  return (
    <ContentLayout title="Account">
      <div className="container mx-auto py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>
              View and manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={session?.user?.image || ""} 
                        alt={session?.user?.name || "User"} 
                      />
                      <AvatarFallback className="text-2xl">
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-2xl font-semibold">{session?.user?.name}</h3>
                    <p className="text-muted-foreground">{session?.user?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start mt-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {session?.user?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-4">Account Information</h4>
                  <dl className="divide-y">
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                      <dd className="text-sm sm:col-span-2 mt-1 sm:mt-0">{session?.user?.id}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-sm sm:col-span-2 mt-1 sm:mt-0">{session?.user?.name}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-sm sm:col-span-2 mt-1 sm:mt-0">{session?.user?.email}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-3">
                      <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                      <dd className="text-sm sm:col-span-2 mt-1 sm:mt-0">{session?.user?.role || "User"}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-6 w-20 mt-2" />
        </div>
      </div>

      <div className="border-t pt-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full sm:col-span-2 mt-1 sm:mt-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
