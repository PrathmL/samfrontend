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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'mobileNumber') {
      if (!value) {
        newErrors.mobileNumber = t('field_mobile') + ' is required';
      } else if (!/^[0-9]{10}$/.test(value)) {
        newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
      } else {
        delete newErrors.mobileNumber;
      }
    }
    
    if (field === 'password') {
      if (!value) {
        newErrors.password = t('field_password') + ' is required';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
    }
    
    setErrors(newErrors);
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
    if (touched.mobileNumber) {
      validateField('mobileNumber', value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'mobileNumber') {
      validateField('mobileNumber', mobileNumber);
    } else if (field === 'password') {
      validateField('password', password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    validateField('mobileNumber', mobileNumber);
    validateField('password', password);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0 || !mobileNumber || !password) {
      return;
    }

    setLoading(true);

    try {
      const user = await login(mobileNumber, password);
      const rolePath = user.role.toLowerCase();
      navigate(`/${rolePath}/dashboard`);
    } catch (err) {
      showErrorAlert('Login Failed', err.response?.data?.error || 'Invalid credentials');
      setPassword('');
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

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="mobile">{t('field_mobile')}</label>
              <div className={`input-wrapper ${errors.mobileNumber && touched.mobileNumber ? 'error' : ''} ${mobileNumber ? 'filled' : ''}`}>
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  id="mobile"
                  placeholder="98XXXXXXXX"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  onBlur={() => handleBlur('mobileNumber')}
                  maxLength="10"
                  inputMode="numeric"
                />
              </div>
              {errors.mobileNumber && touched.mobileNumber && (
                <div className="error-message">
                  <span>⚠️ {errors.mobileNumber}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('field_password')}</label>
              <div className={`input-wrapper ${errors.password && touched.password ? 'error' : ''} ${password ? 'filled' : ''}`}>
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <div className="error-message">
                  <span>⚠️ {errors.password}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || Object.keys(errors).length > 0}
            >
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
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          * {
            box-sizing: border-box;
          }

          .login-page-container {
            min-height: calc(100vh - 70px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
            padding: 1rem;
            position: relative;
            overflow: hidden;
            animation: fadeIn 0.4s ease;
          }

          .login-page-container::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .login-page-container::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -5%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .login-card {
            background: white;
            width: 100%;
            max-width: 440px;
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
            border: 1px solid #e0f2fe;
            position: relative;
            z-index: 1;
            animation: slideInUp 0.6s ease;
            backdrop-filter: blur(10px);
          }

          .login-header {
            text-align: center;
            margin-bottom: 2.5rem;
            animation: slideInDown 0.6s ease 0.1s backwards;
          }

          .logo-box {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            border: 2px solid #bae6fd;
            box-shadow: 0 10px 20px rgba(14, 165, 233, 0.15);
            animation: float 3s ease-in-out infinite;
          }

          .login-header h1 {
            font-size: 1.75rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
          }

          .login-header p {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.5;
          }

          .error-alert {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: linear-gradient(135deg, #fff1f2 0%, #fff5f6 100%);
            border: 1px solid #fecdd3;
            border-radius: 0.85rem;
            color: #e11d48;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            animation: slideInDown 0.3s ease;
            box-shadow: 0 4px 12px rgba(225, 29, 72, 0.1);
          }

          .form-group {
            margin-bottom: 1.5rem;
            animation: slideInUp 0.6s ease;
          }

          .label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.7rem;
          }

          .form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
            text-transform: capitalize;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
          }

          .input-icon {
            position: absolute;
            left: 1rem;
            color: #94a3b8;
            pointer-events: none;
            transition: all 0.2s ease;
          }

          .input-wrapper input {
            width: 100%;
            padding: 0.875rem 1rem 0.875rem 3rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 0.85rem;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
            outline: none;
            color: #1e293b;
          }

          .input-wrapper input::placeholder {
            color: #cbd5e1;
          }

          .input-wrapper input:hover {
            border-color: #cbd5e1;
            background: white;
          }

          .input-wrapper input:focus {
            border-color: #0ea5e9;
            background: white;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12), inset 0 0 0 1px rgba(14, 165, 233, 0.1);
          }

          .input-wrapper:has(input:focus) .input-icon {
            color: #0ea5e9;
            transform: scale(1.15);
          }

          .toggle-password {
            position: absolute;
            right: 1rem;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            border-radius: 0.5rem;
          }

          .toggle-password:hover {
            color: #0ea5e9;
            background: rgba(14, 165, 233, 0.1);
          }

          .toggle-password:active {
            transform: scale(0.95);
          }

          .submit-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            border: none;
            border-radius: 0.85rem;
            font-weight: 700;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1.5rem;
            box-shadow: 0 10px 20px rgba(14, 165, 233, 0.25);
            position: relative;
            overflow: hidden;
          }

          .submit-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
          }

          .submit-btn:hover:not(:disabled)::before {
            left: 100%;
          }

          .submit-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(14, 165, 233, 0.35);
          }

          .submit-btn:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 5px 15px rgba(14, 165, 233, 0.25);
          }

          .submit-btn:disabled {
            opacity: 0.75;
            cursor: not-allowed;
            box-shadow: 0 10px 20px rgba(14, 165, 233, 0.15);
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .login-footer {
            margin-top: 2rem;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 1.5rem;
            animation: slideInUp 0.6s ease 0.3s backwards;
          }

          .login-footer p {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            font-weight: 700;
            margin-bottom: 0.75rem;
          }

          /* Tablet Responsiveness (768px - 1024px) */
          @media (max-width: 1024px) {
            .login-card {
              max-width: 100%;
              padding: 2rem;
            }

            .login-header h1 {
              font-size: 1.5rem;
            }

            .login-page-container::before {
              width: 350px;
              height: 350px;
              right: -5%;
              top: -30%;
            }

            .login-page-container::after {
              width: 300px;
              height: 300px;
              left: -2%;
              bottom: -20%;
            }
          }

          /* Mobile Responsiveness (640px - 768px) */
          @media (max-width: 768px) {
            .login-page-container {
              min-height: 100vh;
              padding: 1rem;
            }

            .login-card {
              padding: 1.75rem;
              border-radius: 1.25rem;
            }

            .login-header {
              margin-bottom: 2rem;
            }

            .logo-box {
              width: 70px;
              height: 70px;
              margin-bottom: 1.25rem;
              border-radius: 1rem;
            }

            .logo-box svg {
              width: 28px;
              height: 28px;
            }

            .login-header h1 {
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }

            .login-header p {
              font-size: 0.9rem;
            }

            .form-group {
              margin-bottom: 1.25rem;
            }

            .form-group label {
              font-size: 0.8rem;
            }

            .input-wrapper input {
              padding: 0.8rem 0.875rem 0.8rem 2.75rem;
              font-size: 1rem;
            }

            .input-icon {
              left: 0.875rem;
              width: 18px;
              height: 18px;
            }

            .toggle-password {
              right: 0.875rem;
              padding: 0.4rem;
            }

            .submit-btn {
              padding: 0.9rem 1rem;
              font-size: 0.95rem;
              margin-top: 1.25rem;
              gap: 0.5rem;
            }

            .submit-btn svg {
              width: 16px;
              height: 16px;
            }

            .login-footer {
              margin-top: 1.75rem;
              padding-top: 1.25rem;
            }

            .help-links {
              gap: 0.4rem;
            }

            .login-page-container::before {
              width: 300px;
              height: 300px;
              right: -15%;
              top: -40%;
            }

            .login-page-container::after {
              width: 250px;
              height: 250px;
              left: -15%;
              bottom: -30%;
            }
          }

          /* Small Mobile (480px - 640px) */
          @media (max-width: 640px) {
            .login-page-container {
              padding: 0.75rem;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              padding-top: 1rem;
            }

            .login-card {
              padding: 1.5rem;
              border-radius: 1.125rem;
              max-width: 100%;
              width: 100%;
            }

            .login-header {
              margin-bottom: 1.75rem;
            }

            .logo-box {
              width: 64px;
              height: 64px;
              margin-bottom: 1rem;
            }

            .logo-box svg {
              width: 24px;
              height: 24px;
            }

            .login-header h1 {
              font-size: 1.35rem;
              margin-bottom: 0.5rem;
            }

            .login-header p {
              font-size: 0.85rem;
              margin-bottom: 0;
            }

            .form-group {
              margin-bottom: 1.1rem;
            }

            .label-row {
              margin-bottom: 0.6rem;
              gap: 0.5rem;
            }

            .form-group label {
              font-size: 0.75rem;
              margin-bottom: 0.4rem;
            }

            .forgot-link {
              font-size: 0.75rem;
            }

            .input-wrapper input {
              padding: 0.75rem 0.75rem 0.75rem 2.5rem;
              font-size: 16px;
              border-radius: 0.75rem;
            }

            .input-icon {
              left: 0.75rem;
              width: 16px;
              height: 16px;
            }

            .toggle-password {
              right: 0.75rem;
              width: 32px;
              height: 32px;
            }

            .toggle-password svg {
              width: 16px;
              height: 16px;
            }

            .submit-btn {
              padding: 0.85rem 1rem;
              font-size: 0.9rem;
              margin-top: 1rem;
            }

            .spinner {
              width: 18px;
              height: 18px;
              border-width: 2px;
            }

            .login-footer {
              margin-top: 1.5rem;
              padding-top: 1rem;
            }

            .login-footer p {
              font-size: 0.7rem;
              margin-bottom: 0.5rem;
            }

            .help-links {
              font-size: 0.8rem;
              gap: 0.3rem;
              flex-wrap: wrap;
            }

            .error-alert {
              padding: 0.875rem;
              font-size: 0.85rem;
              margin-bottom: 1.25rem;
            }

            .login-page-container::before {
              width: 250px;
              height: 250px;
              right: -20%;
              top: -50%;
            }

            .login-page-container::after {
              width: 200px;
              height: 200px;
              left: -20%;
              bottom: -40%;
            }
          }

          /* Extra Small Mobile (< 480px) */
          @media (max-width: 480px) {
            .login-page-container {
              min-height: 100vh;
              padding: 0.5rem;
              padding-top: 0.75rem;
            }

            .login-card {
              padding: 1.25rem;
              border-radius: 1rem;
            }

            .login-header {
              margin-bottom: 1.5rem;
            }

            .logo-box {
              width: 56px;
              height: 56px;
              margin-bottom: 0.875rem;
            }

            .logo-box svg {
              width: 22px;
              height: 22px;
            }

            .login-header h1 {
              font-size: 1.25rem;
            }

            .login-header p {
              font-size: 0.8rem;
            }

            .form-group {
              margin-bottom: 1rem;
            }

            .input-wrapper input {
              padding: 0.7rem 0.75rem 0.7rem 2.4rem;
              font-size: 16px;
            }

            .input-wrapper input::placeholder {
              font-size: 0.9rem;
            }

            .submit-btn {
              padding: 0.8rem;
              font-size: 0.85rem;
              margin-top: 0.875rem;
              gap: 0.4rem;
            }

            .login-footer {
              margin-top: 1.25rem;
              padding-top: 0.875rem;
            }

            .login-page-container::before,
            .login-page-container::after {
              opacity: 0.5;
            }
          }

          .input-wrapper.error input {
            border-color: #dc2626;
            background: #fff5f5;
          }

          .input-wrapper.error input:focus {
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
          }

          .input-wrapper.error .input-icon {
            color: #dc2626;
          }

          .error-message {
            display: flex;
            align-items: center;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: #dc2626;
            animation: slideInDown 0.2s ease;
          }

          .error-message span {
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .input-wrapper.filled input {
            border-color: #10b981;
          }

          .input-wrapper.filled .input-icon {
            color: #10b981;
          }

          /* Input autofill styling */
          .input-wrapper input:-webkit-autofill,
          .input-wrapper input:-webkit-autofill:hover,
          .input-wrapper input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            border-color: #0ea5e9 !important;
          }

          .input-wrapper input:-webkit-autofill {
            -webkit-text-fill-color: #1e293b !important;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
