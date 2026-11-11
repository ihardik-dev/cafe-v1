import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { loginCustomer } from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import { useToast } from '@/components/ui/ToastContext';
import { ApiError } from '@/types/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(72, 'Password cannot exceed 72 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  // Check for expired session flag from redirect
  useEffect(() => {
    const expiredParam = searchParams.get('expired');
    const storedNotice = sessionStorage.getItem('auth_message');

    if (expiredParam === '1' || storedNotice) {
      setSessionExpiredNotice(storedNotice || 'Your session has expired. Please log in again.');
      try {
        sessionStorage.removeItem('auth_message');
      } catch {
        // Ignore storage errors
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const result = await loginCustomer({
        email: values.email.toLowerCase(),
        password: values.password,
      });

      setAuth(result.user, result.token);
      showToast(`Welcome back, ${result.user.name.split(' ')[0]}`, 'success');

      // Determine return location
      const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const queryFrom = searchParams.get('from');
      const targetDestination =
        stateFrom || queryFrom || (result.user.role === 'ADMIN' ? '/admin' : '/');

      navigate(targetDestination, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setFormError('Invalid email or password. Please verify your credentials.');
          return;
        }

        // Map server field errors to inputs
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            if (field === 'email' || field === 'password') {
              setError(field, { type: 'server', message: msg });
            }
          });
          return;
        }

        setFormError(err.message || 'Unable to log in. Please try again.');
        return;
      }

      setFormError('An unexpected network error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-content-primary">Welcome Back</h2>
        <p className="text-xs text-content-secondary mt-1">
          Sign in to your account to review orders, manage reservations, and order your favorite
          brew.
        </p>
      </div>

      {/* Session Expired Banner */}
      {sessionExpiredNotice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200"
        >
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="font-medium">{sessionExpiredNotice}</p>
        </div>
      )}

      {/* Form Level Error Alert */}
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <p className="font-medium">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-1">
        {/* Email Field */}
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password Field */}
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md text-content-tertiary hover:text-content-primary focus-visible:ring-2 focus-visible:ring-brand-primary outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full shadow-beautiful-md hover:scale-[1.01] active:scale-[0.99]"
          >
            Log in
          </Button>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-border-subdued">
        <p className="text-xs text-content-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-primary hover:text-brand-hover hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
