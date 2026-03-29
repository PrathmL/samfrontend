import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  School, Lock, Phone, Eye, EyeOff, 
  AlertCircle, ArrowRight 
} from 'lucide-react';
import MainLayout from '../common/MainLayout';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send mobileNumber and password to the login function
      const user = await login(mobileNumber, password);
      const rolePath = user.role.toLowerCase();
      navigate(`/${rolePath}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="login-page-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box">
              <School size={32} color="#0ea5e9" />
            </div>
            <h1>{t('welcome_back')}</h1>
            <p>Enter your credentials to access the management portal</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="mobile">{t('field_mobile')}</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  id="mobile"
                  placeholder="98XXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">{t('field_password')}</label>
                <a href="#" className="forgot-link">Forgot?</a>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  {t('sign_in')} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Authorized Personnel Only</p>
            <div className="help-links">
              <span>Need help?</span>
              <a href="#">Contact Admin</a>
            </div>
          </div>
        </div>

        <style>{`
          .login-page-container {
            min-height: calc(100vh - 70px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            padding: 2rem;
          }

          .login-card {
            background: white;
            width: 100%;
            max-width: 440px;
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
            border: 1px solid #e2e8f0;
          }

          .login-header {
            text-align: center;
            margin-bottom: 2.5rem;
          }

          .logo-box {
            width: 64px;
            height: 64px;
            background: #f0f9ff;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            border: 1px solid #bae6fd;
          }

          .login-header h1 {
            font-size: 1.75rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.5rem;
          }

          .login-header p {
            color: #64748b;
            font-size: 0.95rem;
          }

          .error-alert {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #fff1f2;
            border: 1px solid #fecdd3;
            border-radius: 0.75rem;
            color: #e11d48;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            font-weight: 500;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 0.5rem;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon {
            position: absolute;
            left: 1rem;
            color: #94a3b8;
          }

          .input-wrapper input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 3rem;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            font-size: 1rem;
            transition: all 0.2s;
            outline: none;
          }

          .input-wrapper input:focus {
            border-color: #0ea5e9;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
          }

          .toggle-password {
            position: absolute;
            right: 1rem;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }

          .submit-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.875rem;
            background: #0ea5e9;
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
          }

          .submit-btn:hover {
            background: #0284c7;
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .login-footer {
            margin-top: 2.5rem;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 1.5rem;
          }

          .login-footer p {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
