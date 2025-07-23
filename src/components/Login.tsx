import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to the Student Performance Predictor System",
      });
    } else {
      setError('Invalid credentials. Please try again.');
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const fillDemoCredentials = (role: 'student' | 'faculty') => {
    if (role === 'faculty') {
      setEmail('faculty@university.edu');
    } else {
      setEmail('student@university.edu');
    }
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Performance Predictor
          </h1>
          <p className="text-white/80 text-lg">
            Student Performance Prediction & Feedback System
          </p>
        </div>

        <Card className="shadow-card backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Login to Continue
            </CardTitle>
            <CardDescription>
              Access your dashboard with secure authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="faculty" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Faculty
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Demo: student@university.edu / password
                    </AlertDescription>
                  </Alert>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fillDemoCredentials('student')}
                    className="w-full"
                  >
                    Fill Demo Credentials
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="faculty">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Demo: faculty@university.edu / password
                    </AlertDescription>
                  </Alert>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fillDemoCredentials('faculty')}
                    className="w-full"
                  >
                    Fill Demo Credentials
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 shadow-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Secure authentication with session management</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;