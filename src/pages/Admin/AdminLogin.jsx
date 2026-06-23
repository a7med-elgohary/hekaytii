import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await adminApi.login({ email, password });

      // ✅ Verify the user has the 'admin' role
      if (data.role !== 'admin') {
        setError('ليس لديك صلاحيات الوصول للوحة التحكم الإدارية');
        return;
      }

      // Store Tokens and User Data
      // Store User Data for UI status (Tokens are in HttpOnly Cookies)
      localStorage.setItem('admin_user', JSON.stringify(data.user || { email }));
      
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data || err.message;
      setError(typeof msg === 'string' ? msg : 'خطأ في البريد الإلكتروني أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-container" dir="rtl">
      {/* Dynamic Animated Background */}
      <div className="al-bg-visuals">
        <div className="al-blob al-blob-1"></div>
        <div className="al-blob al-blob-2"></div>
        <div className="al-grid"></div>
      </div>

      <div className="al-card">
        <div className="al-header">
          <div className="al-logo">ح</div>
          <h1>مرحباً بك مجدداً</h1>
          <p>لوحة التحكم الإدارية لنظام حكايتي</p>
        </div>

        <form className="al-form" onSubmit={handleLogin}>
          <div className="al-input-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="admin@hekayti.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="al-input-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="al-error">{error}</div>}

          <button className={`al-submit ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="al-footer">
          <p>© 2026 حكايتي للذكاء الاصطناعي</p>
        </div>
      </div>
    </div>
  );
}
