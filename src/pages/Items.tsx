import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const itemSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().trim().max(500, "Description too long").optional(),
  status: z.enum(["active", "completed", "archived"]),
});

type ItemForm = z.infer<typeof itemSchema>;

interface Item {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_name?: string;
}

const ITEMS_PER_PAGE = 10;

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { toast } = useToast();

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    fetchItems();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, statusFilter, sortBy]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const fetchItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Check if admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const userIsAdmin = !!roleData;

      // Fetch items
      let query = supabase
        .from('items')
        .select('*');

      if (!userIsAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data: itemsData, error } = await query;

      if (error) throw error;

      // If admin, fetch owner names
      if (userIsAdmin && itemsData) {
        const itemsWithOwners = await Promise.all(
          itemsData.map(async (item) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', item.user_id)
              .single();
            
            return {
              ...item,
              owner_name: profile?.name || 'Unknown',
            };
          })
        );
        setItems(itemsWithOwners);
      } else {
        setItems(itemsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aDate = new Date(sortBy === "created_at" ? a.created_at : a.updated_at).getTime();
      const bDate = new Date(sortBy === "created_at" ? b.created_at : b.updated_at).getTime();
      return bDate - aDate;
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const onSubmit = async (values: ItemForm) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingItem) {
        const { error } = await supabase
          .from('items')
          .update(values)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('items')
          .insert([{ 
            title: values.title,
            description: values.description,
            status: values.status,
            user_id: user.id 
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Item created successfully",
        });
      }

      setDialogOpen(false);
      setEditingItem(null);
      form.reset({
        title: "",
        description: "",
        status: "active",
      });
      fetchItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      fetchItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      status: item.status as "active" | "completed" | "archived",
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset({
      title: "",
      description: "",
      status: "active",
    });
    setDialogOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">My Items</h1>
              <p className="text-muted-foreground">
                {isAdmin ? "View and manage all items" : "Manage your personal items"}
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="shadow-custom-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the item details" : "Add a new item to your list"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Item title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Item description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit">
                        {editingItem ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6 shadow-custom-lg">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <div className="space-y-4">
            {paginatedItems.length === 0 ? (
              <Card className="shadow-custom-lg">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No items found. Create your first item!</p>
                </CardContent>
              </Card>
            ) : (
              paginatedItems.map((item) => (
                <Card key={item.id} className="shadow-custom-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>
                          {item.description}
                        </CardDescription>
                        {isAdmin && item.owner_name && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Owner: {item.owner_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Items;
