import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      isSuperAdmin: boolean;
      isActive: boolean;
    };
  };
}

interface CsrfResponse {
  statusCode: number;
  data: {
    csrfToken: string;
    sessionId: string;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetchCsrfToken();
    
    // Generate session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
  }, []);

  // Check for lockout time on mount
  useEffect(() => {
    const storedLockoutTime = localStorage.getItem('loginLockoutTime');
    if (storedLockoutTime) {
      const lockoutExpiryTime = parseInt(storedLockoutTime, 10);
      const now = Date.now();
      if (now < lockoutExpiryTime) {
        setLockoutTime(lockoutExpiryTime);
      } else {
        localStorage.removeItem('loginLockoutTime');
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.ceil((lockoutTime - now) / 1000);
        
        if (remainingTime <= 0) {
          setLockoutTime(null);
          localStorage.removeItem('loginLockoutTime');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const fetchCsrfToken = async () => {
    try {
      const storedSessionId = localStorage.getItem('sessionId');
      const response = await axios.get<CsrfResponse>(`${API_BASE_URL}/auth/csrf-token`, {
        headers: {
          'x-session-id': storedSessionId || `session-${Date.now()}`,
        },
      });
      
      if (response.data.data) {
        setCsrfToken(response.data.data.csrfToken);
        setSessionId(response.data.data.sessionId);
        localStorage.setItem('sessionId', response.data.data.sessionId);
      }
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err);
      setError('Security error: Failed to fetch CSRF token. Please refresh and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    if (!csrfToken) {
      setError('Security error: CSRF token not available. Please refresh and try again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        {
          username,
          password,
          csrfToken, // Include CSRF token in body
        },
        {
          headers: {
            'x-csrf-token': csrfToken, // Also include in headers for double-submit cookie pattern
            'x-session-id': sessionId,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.data) {
        // Store tokens
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('expiresIn', response.data.data.expiresIn.toString());
        localStorage.setItem('loginTime', Date.now().toString());

        // Clear any error/lockout state
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockoutTime');

        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      
      if (axiosError.response?.status === 429) {
        // Rate limited
        const retryAfter = (axiosError.response?.data as any)?.retryAfter || 900;
        const lockoutExpiryTime = Date.now() + retryAfter * 1000;
        setLockoutTime(lockoutExpiryTime);
        localStorage.setItem('loginLockoutTime', lockoutExpiryTime.toString());
        setError(`Account temporarily locked. Please try again in ${retryAfter} seconds.`);
      } else if (axiosError.response?.status === 400) {
        // CSRF token invalid or credentials invalid
        const errorData = axiosError.response?.data as any;
        if (errorData?.message?.toLowerCase().includes('csrf')) {
          setError('Security error: Invalid CSRF token. Please refresh and try again.');
          // Fetch new CSRF token
          fetchCsrfToken();
        } else {
          setError('Invalid username or password');
        }
      } else if (axiosError.response?.status === 401) {
        // Unauthorized
        setError('Invalid credentials');
      } else if (axiosError.code === 'ECONNREFUSED') {
        setError('Connection error: Cannot reach the server. Please check your connection.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
      
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingLockoutTime = lockoutTime
    ? Math.ceil((lockoutTime - Date.now()) / 1000)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TiffinBD</h1>
          <p className="text-blue-100">Order Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Lockout Message */}
          {lockoutTime && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm font-semibold">
                ⏱️ Account locked due to too many failed attempts
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Please try again in {remainingLockoutTime} seconds
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || lockoutTime !== null}
                placeholder="Enter your username or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || lockoutTime !== null}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || lockoutTime !== null}
                  className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutTime !== null || !csrfToken}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              🔒 <strong>Secure Login:</strong> This login page is protected with CSRF tokens and rate limiting to ensure your account security.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-blue-100 text-sm">
          <p>© 2024 TiffinBD. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
