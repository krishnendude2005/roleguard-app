import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard = ({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user && requireAdmin) {
          // Check admin status using setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id)
              .eq('role', 'admin')
              .maybeSingle();
            
            setIsAdmin(!!data);
            setLoading(false);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user && requireAdmin) {
        setTimeout(async () => {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', existingSession.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!data);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAdmin]);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/login');
      } else if (requireAdmin && !isAdmin) {
        navigate('/dashboard');
      } else if (!requireAuth && user) {
        navigate('/dashboard');
      }
    }
  }, [loading, user, isAdmin, requireAuth, requireAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
