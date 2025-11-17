import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: tokenParam } = useParams();
  // prefer route param, fallback to ?token= query
  const token = tokenParam || searchParams.get('token') || '';

  useEffect(() => {
    // If token is missing, you might want to redirect to a page that requests the reset link
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) return setError('Please fill out both password fields');
    if (password !== confirmPassword) return setError("Passwords don't match");
    if (!token) return setError('Missing token');

    setLoading(true);
    const base = import.meta.env.VITE_API_BASE_URL || '';
    // API expects token in the path: /api/users/forgot-password/{token}
    const url = `${base}/api/users/forgot-password/${encodeURIComponent(token)}`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to reset password');
        }
        return data;
      })
      .then(() => {
        setSuccess(true);
      })
      .catch((err) => setError(err.message || 'An unexpected error occurred'))
      .finally(() => setLoading(false));
  };

  const handleBackToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          {!success ? (
            <>
              <h2 className="mb-6 text-2xl font-semibold">Set a new password</h2>
              <p className="mb-6 text-gray-600">Enter a new password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-11 pr-3 py-3 border rounded bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-11 pr-3 py-3 border rounded bg-transparent"
                      required
                    />
                  </div>
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-black text-white py-2 px-4 rounded ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>

                  <button type="button" onClick={handleBackToLogin} className="text-sm text-gray-600 hover:text-red-600">
                    <ArrowLeft className="inline-block mr-1 -mt-1" /> Back to Login
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Password reset successful</h3>
              <p className="mb-6 text-gray-600">You can now sign in with your new password.</p>
              <button onClick={() => navigate('/login')} className="bg-black text-white py-2 px-4 rounded">
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
