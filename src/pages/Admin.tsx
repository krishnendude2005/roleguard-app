import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, TrendingUp, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  created_at: string;
  roles: string[];
  item_count?: number;
}

const Admin = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, totalItems: 0 });
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email, created_at')
          .order('created_at', { ascending: false });

        if (profilesData) {
          const usersWithRoles = await Promise.all(
            profilesData.map(async (profile) => {
              const { data: rolesData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id);

              const { count } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);

              return {
                ...profile,
                roles: rolesData?.map((r) => r.role) || [],
                item_count: count || 0,
              };
            })
          );

          setUsers(usersWithRoles);
          
          const adminCount = usersWithRoles.filter(u => u.roles.includes('admin')).length;
          const { count: totalItemsCount } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true });

          setStats({
            total: usersWithRoles.length,
            admins: adminCount,
            users: usersWithRoles.length - adminCount,
            totalItems: totalItemsCount || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const hasRole = selectedUser.roles.includes(newRole);

      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', newRole);

        if (error) throw error;

        toast({
          title: "Role removed",
          description: `${newRole} role removed from ${selectedUser.name}`,
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: selectedUser.id, role: newRole }]);

        if (error) throw error;

        toast({
          title: "Role added",
          description: `${newRole} role added to ${selectedUser.name}`,
        });
      }

      setDialogOpen(false);
      setSelectedUser(null);
      setNewRole('user');
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.roles.includes('admin') ? 'admin' : 'user');
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gradient-hero">
        <Navbar isAuthenticated={true} isAdmin={true} />
        
        <main className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and permissions</p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="shadow-custom-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
              </CardContent>
            </Card>

            <Card className="shadow-custom-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-custom-xl">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === 'admin' ? 'default' : 'secondary'}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{user.item_count || 0}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            Manage Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Role Management Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User Role</DialogTitle>
              <DialogDescription>
                Update role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Current Roles:</p>
                <div className="flex gap-2">
                  {selectedUser?.roles.map((role) => (
                    <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Change Role:</label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as 'user' | 'admin')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedUser?.roles.includes(newRole) 
                  ? `This will remove the ${newRole} role` 
                  : `This will add the ${newRole} role`}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange}>
                {selectedUser?.roles.includes(newRole) ? 'Remove Role' : 'Add Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default Admin;

