import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Calendar, Package, ArrowRight } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  created_at: string;
}

interface Role {
  role: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, created_at')
          .eq('id', user.id)
          .single();

        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const { count } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setProfile(profileData);
        setRoles(rolesData?.map((r: Role) => r.role) || []);
        setItemCount(count || 0);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const isAdmin = roles.includes('admin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-hero">
        <Navbar isAuthenticated={true} isAdmin={isAdmin} />
        
        <main className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "You have admin access" : "User dashboard"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-custom-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Roles & Permissions
                </CardTitle>
                <CardDescription>Your access level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Account Created
                </CardTitle>
                <CardDescription>Member since</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  My Items
                </CardTitle>
                <CardDescription>Total items created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{itemCount}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/items">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {isAdmin && (
            <div className="mt-8">
              <Card className="border-primary/20 shadow-custom-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Admin Access</CardTitle>
                  <CardDescription>
                    You have administrative privileges. Visit the Admin panel to manage users.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
