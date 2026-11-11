import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerCustomer, loginCustomer } from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import { useToast } from '@/components/ui/ToastContext';
import { ApiError } from '@/types/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);

    try {
      // 1. Register customer with backend
      await registerCustomer({
        name: values.name.trim(),
        email: values.email.toLowerCase(),
        password: values.password,
      });

      // 2. Automatically log in to obtain JWT session
      try {
        const loginRes = await loginCustomer({
          email: values.email.toLowerCase(),
          password: values.password,
        });

        setAuth(loginRes.user, loginRes.token);
        showToast('Account created successfully! Welcome to the cafe.', 'success');

        const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(stateFrom || '/', { replace: true });
      } catch {
        // Fallback if auto-login encounters an issue
        showToast('Account created. Please log in with your credentials.', 'success');
        navigate('/login', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // 409 Conflict: duplicate email
        if (err.statusCode === 409 || err.message.toLowerCase().includes('already exists')) {
          setError('email', {
            type: 'server',
            message: 'An account with this email already exists.',
          });
          return;
        }

        // Map backend field errors
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            if (field === 'name' || field === 'email' || field === 'password') {
              setError(field, { type: 'server', message: msg });
            }
          });
          return;
        }

        setFormError(err.message || 'Registration failed. Please check your details.');
        return;
      }

      setFormError('An unexpected network error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-content-primary">Create account</h2>
        <p className="text-xs text-content-secondary mt-1">
          Join our cafe family to save preferences, track demo orders, and reserve tables.
        </p>
      </div>

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
        {/* Full Name Field */}
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Maya Sharma"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email Address Field */}
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          helperText="Must be between 8 and 72 characters"
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
            Create account
          </Button>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-border-subdued">
        <p className="text-xs text-content-secondary">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-primary hover:text-brand-hover hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
          >
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
