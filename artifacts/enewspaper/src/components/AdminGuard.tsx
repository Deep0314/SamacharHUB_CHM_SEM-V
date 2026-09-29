import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, getGetAdminMeQueryKey } from "@samacharhub/api-client-react";
import { getAdminToken } from "@/lib/auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const token = getAdminToken();

  const { isLoading, isError } = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  if (!token) {
    setLocation("/admin/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isError) {
    setLocation("/admin/login");
    return null;
  }

  return <>{children}</>;
}
