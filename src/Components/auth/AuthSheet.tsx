import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { FcGoogle } from 'react-icons/fc';

interface AuthSheetProps {
  defaultTab?: 'login' | 'register';
  children: React.ReactNode;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ defaultTab = 'login', children }) => {
  const { isDarkMode } = useTheme();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Register state
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError('');
    
    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    setIsRegisterLoading(true);
    
    try {
      await register(name, registerEmail, registerPassword);
      navigate('/dashboard');
    } catch (error) {
      setRegisterError('Unable to register. Please try again later.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Implement Google login logic here
      // This would typically call a method from your auth context
      console.log('Google login clicked');
    } catch (error) {
      setLoginError('Google login failed. Please try again.');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'} w-full sm:max-w-md overflow-y-auto`} side="right">
        <SheetHeader>
          <SheetTitle className={`text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            FinanceDash
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                  {loginError}
                </div>
              )}
              
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <Button variant="link" size="sm" className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoginLoading}>
                {isLoginLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <Separator className="my-4" />
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
            </form>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                  {registerError}
                </div>
              )}
              
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <p className="text-center text-sm mt-4">
                By signing up, you agree to our{" "}
                <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default AuthSheet;
