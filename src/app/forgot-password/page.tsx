'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'sent'|'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStatus('sent');
        setMessage('If that email exists, a reset link has been sent.');
      } else {
        setStatus('error');
        const data = await res.json();
        setMessage(data.error || 'Something went wrong');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="you@example.com"
            />
          </div>
          {message && (
            <div className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>{message}</div>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}