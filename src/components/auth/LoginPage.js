import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Phone, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
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
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                mobileNumber,
                password
            });

            const userData = response.data;
            login(userData);

            // Redirect based on role
            switch (userData.role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'SACHIV':
                    navigate('/sachiv/dashboard');
                    break;
                case 'HEADMASTER':
                    navigate('/headmaster/dashboard');
                    break;
                case 'CLERK':
                    navigate('/clerk/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            // Handle error properly - check if it's a string or object
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    setError(err.response.data);
                } else if (err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Login failed. Please try again.');
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>E-Samruddha Shala</h1>
                    <p>Welcome back! Please login to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="mobileNumber">Mobile Number</label>
                        <div className="input-with-icon">
                            <Phone size={20} className="icon" />
                            <input
                                type="text"
                                id="mobileNumber"
                                placeholder="Enter mobile number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={20} className="icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>

            <style>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .login-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .login-header h1 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                    font-size: 1.8rem;
                }
                .login-header p {
                    color: #6b7280;
                    font-size: 0.9rem;
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #374151;
                }
                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-with-icon .icon {
                    position: absolute;
                    left: 0.75rem;
                    color: #9ca3af;
                }
                .input-with-icon input {
                    width: 100%;
                    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }
                .input-with-icon input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .toggle-password {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }
                .error-message {
                    background-color: #fee2e2;
                    color: #dc2626;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    text-align: center;
                }
                .login-button {
                    background-color: #3b82f6;
                    color: white;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-top: 1rem;
                }
                .login-button:hover {
                    background-color: #2563eb;
                }
                .login-button:disabled {
                    background-color: #93c5fd;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;