import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Shield, Lock, Users, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-8 inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5">
            <Shield className="mr-2 h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Enterprise-grade security</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Secure Authentication
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Role-based access control with enterprise security. Manage users, permissions, 
            and data access with confidence.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="shadow-custom-lg">
              <Link to="/signup">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-8 py-20 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 shadow-custom-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Secure by Default</h3>
            <p className="text-muted-foreground">
              Industry-standard encryption and security practices built-in from day one.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-custom-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Granular permission control with user and admin roles out of the box.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-custom-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">User Management</h3>
            <p className="text-muted-foreground">
              Complete user lifecycle management with intuitive admin controls.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-custom-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Optimized performance with JWT tokens and efficient database queries.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
