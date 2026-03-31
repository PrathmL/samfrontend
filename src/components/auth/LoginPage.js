import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  School, Lock, Phone, Eye, EyeOff, 
  ArrowRight 
} from 'lucide-react';
import MainLayout from '../common/MainLayout';
import { useTranslation } from 'react-i18next';
import { showErrorAlert } from '../../utils/sweetAlertUtils';

const LoginPage = () => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(mobileNumber, password);
      const rolePath = user.role.toLowerCase();
      navigate(`/${rolePath}/dashboard`);
    } catch (err) {
      showErrorAlert('Login Failed', err.response?.data?.error || 'Invalid credentials');
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
              <School size={32} color="#1e3a8a" />
            </div>
            <h1>{t('welcome_back')}</h1>
            <p>Enter your credentials to access the management portal</p>
          </div>

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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .login-page-container {
            min-height: calc(100vh - 70px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            padding: 1.5rem;
          }

          .login-card {
            background: white;
            width: 100%;
            max-width: 440px;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
          }

          .login-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .logo-box {
            width: 64px;
            height: 64px;
            background: #eff6ff;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.25rem;
            border: 1px solid #bfdbfe;
          }

          .login-header h1 {
            font-size: 1.75rem;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 0.5rem;
            letter-spacing: -0.01em;
          }

          .login-header p {
            color: #475569;
            font-size: 0.875rem;
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
            font-size: 0.875rem;
            font-weight: 500;
            color: #1e293b;
          }

          .forgot-link {
            font-size: 0.75rem;
            color: #1e3a8a;
            text-decoration: none;
            font-weight: 500;
          }

          .forgot-link:hover {
            text-decoration: underline;
            color: #1e40af;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon {
            position: absolute;
            left: 0.75rem;
            color: #64748b;
            pointer-events: none;
          }

          .input-wrapper input {
            width: 100%;
            padding: 0.625rem 0.75rem 0.625rem 2.5rem;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            transition: all 0.15s ease;
            outline: none;
            color: #0f172a;
          }

          .input-wrapper input:focus {
            border-color: #1e3a8a;
            box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
          }

          .toggle-password {
            position: absolute;
            right: 0.75rem;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }

          .toggle-password:hover {
            color: #1e3a8a;
          }

          .submit-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: #1e3a8a;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background 0.15s ease;
            margin-top: 0.5rem;
          }

          .submit-btn:hover {
            background: #1e40af;
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .login-footer {
            margin-top: 2rem;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 1.5rem;
          }

          .login-footer p {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .help-links {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: #475569;
          }

          .help-links a {
            color: #1e3a8a;
            text-decoration: none;
            font-weight: 500;
          }

          .help-links a:hover {
            text-decoration: underline;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Responsive */
          @media (max-width: 640px) {
            .login-card {
              padding: 1.5rem;
              max-width: 100%;
            }
            .login-header h1 {
              font-size: 1.5rem;
            }
            .logo-box {
              width: 56px;
              height: 56px;
            }
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default LoginPage;