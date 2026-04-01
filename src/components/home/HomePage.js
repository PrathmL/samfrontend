import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ClipboardList, Wallet, BarChart3, 
  LayoutDashboard, PieChart, ArrowRight, 
  Users, UserCog, GraduationCap, HardHat,
  CheckCircle2, School, Map, Activity, 
  Mail, Phone, MapPin, Send, Menu, X,
  ChevronRight, Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const features = [
    { icon: <FileText size={32} color="#0ea5e9" />, title: t('feat_work_mgmt'), desc: t('feat_work_mgmt_desc') },
    { icon: <ClipboardList size={32} color="#f59e0b" />, title: t('feat_quotation'), desc: t('feat_quotation_desc') },
    { icon: <Wallet size={32} color="#10b981" />, title: t('feat_fund'), desc: t('feat_fund_desc') },
    { icon: <Activity size={32} color="#8b5cf6" />, title: t('feat_tracking'), desc: t('feat_tracking_desc') },
    { icon: <LayoutDashboard size={32} color="#ec4899" />, title: t('feat_dashboard'), desc: t('feat_dashboard_desc') },
    { icon: <PieChart size={32} color="#06b6d4" />, title: t('feat_reports'), desc: t('feat_reports_desc') }
  ];

  const workflow = [
    { icon: <GraduationCap />, role: t('role_hm'), color: "#1e40af" },
    { icon: <UserCog />, role: t('role_clerk'), color: "#1d4ed8" },
    { icon: <UserCog />, role: t('role_admin'), color: "#1e3a8a" },
    { icon: <Users />, role: t('role_sachiv'), color: "#059669" },
    { icon: <CheckCircle2 />, role: t('step_completion'), color: "#2563eb" }
  ];

  const roles = [
    { icon: <UserCog size={48} />, title: t('role_admin'), desc: t('role_admin_desc') },
    { icon: <Users size={48} />, title: t('role_sachiv'), desc: t('role_sachiv_desc') },
    { icon: <GraduationCap size={48} />, title: t('role_hm'), desc: t('role_hm_desc') },
    { icon: <HardHat size={48} />, title: t('role_clerk'), desc: t('role_clerk_desc') }
  ];

  const stats = [
    { value: "850+", label: t('stat_total_schools') },
    { value: "120+", label: t('stat_total_talukas') },
    { value: "300+", label: t('stat_active_projects') },
    { value: "500+", label: t('stat_completed_projects') }
  ];

  return (
    <div className="homepage-wrapper">
      {/* Navbar */}
      <nav className="custom-navbar">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <School size={24} className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">{t('brand_name')}</span>
              <span className="brand-tagline">{t('brand_tagline')}</span>
            </div>
          </div>
          
          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <a href="#home" className="active">{t('home')}</a>
            <a href="#features">{t('features')}</a>
            <a href="#workflow">{t('workflow')}</a>
            <a href="#roles">{t('user_roles')}</a>
            <a href="#about">{t('about')}</a>
            <a href="#contact">{t('contact')}</a>
          </div>

          <div className="nav-actions">
            <div className="lang-switcher">
              <button 
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} 
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
              <button 
                className={`lang-btn ${i18n.language === 'mr' ? 'active' : ''}`} 
                onClick={() => changeLanguage('mr')}
              >
                मराठी
              </button>
            </div>
            <button className="nav-login-btn" onClick={() => navigate('/login')}>{t('login')}</button>
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1>{t('hero_title')}</h1>
            <p className="hero-subtitle">{t('hero_subtitle')}</p>
            <div className="hero-btns">
              <button className="btn-get-started" onClick={() => navigate('/login')}>{t('get_started')}</button>
              <button className="btn-login-outline" onClick={() => navigate('/login')}>{t('login')}</button>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-bg"></div>
            <img 
              src="https://images.pexels.com/photos/35254692/pexels-photo-35254692.jpeg" 
              alt="School Building" 
              style={{ borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
            />
          </div>
        </div>
        <div className="hero-waves">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container">
          <h2 className="section-heading">{t('our_features')}</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="section-padding bg-light">
        <div className="container">
          <h2 className="section-heading">{t('workflow_process')}</h2>
          <div className="workflow-container">
            {workflow.map((w, i) => (
              <React.Fragment key={i}>
                <div className="workflow-step">
                  <div className="step-box" style={{ background: w.color }}>
                    <div className="step-icon">{w.icon}</div>
                    <span>{w.role}</span>
                  </div>
                </div>
                {i < workflow.length - 1 && (
                  <div className="workflow-arrow">
                    <ChevronRight size={24} color="#94a3b8" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="section-padding">
        <div className="container">
          <h2 className="section-heading">{t('user_roles_title')}</h2>
          <div className="roles-grid">
            {roles.map((r, i) => (
              <div key={i} className="role-card">
                <div className="role-header">
                  <div className="role-avatar">{r.icon}</div>
                </div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-blue">
        <div className="container">
          <h2 className="section-heading text-white">{t('our_statistics')}</h2>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section id="about" className="section-padding">
        <div className="container">
          <div className="about-contact-container">
            <div className="about-content text-center">
              <h2 className="side-heading">{t('about_us')}</h2>
              <h3>{t('about_title')}</h3>
              <p className="max-w-800 mx-auto">{t('about_desc')}</p>
              
              <div className="contact-info-blocks mt-4">
                <h2 className="side-heading" id="contact">{t('contact_us')}</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <Mail size={20} />
                    <span>{t('field_email')}: info@samruddhashala.com</span>
                  </div>
                  <div className="info-item">
                    <Phone size={20} />
                    <span>{t('field_phone')}: +91 9876543210</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={20} />
                    <span>{t('field_address')}: Education Dept, Headquarters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="simple-footer">
        <p>© 2026 {t('brand_name')}. {t('rights_reserved')}</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
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

        :root {
          --primary: #1d4ed8;
          --primary-dark: #1e3a8a;
          --secondary: #0ea5e9;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --bg-light: #f8fafc;
        }

        * {
          box-sizing: border-box;
        }

        .homepage-wrapper {
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
          scroll-behavior: smooth;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .section-padding {
          padding: 4rem 0;
        }

        .bg-light { background-color: var(--bg-light); }
        .bg-blue { background-color: #f0f9ff; }
        .text-white { color: var(--primary-dark) !important; }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-800 { max-width: 800px; }

        /* Navbar */
        .custom-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .nav-container {
          max-width: 1300px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          animation: slideInLeft 0.6s ease;
        }

        .brand-icon {
          color: #0ea5e9;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .nav-logo:hover .brand-icon {
          transform: scale(1.1) rotate(-10deg);
          color: #0284c7;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .brand-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary-dark);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 0.65rem;
          font-weight: 600;
          color: #0ea5e9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .logo-icon {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        .logo-icon .square { width: 10px; height: 10px; border-radius: 2px; }
        .s1 { background: #f59e0b; }
        .s2 { background: #0ea5e9; }
        .s3 { background: #ef4444; }
        .s4 { background: #10b981; }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          border-radius: 0.35rem;
          position: relative;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .nav-links a:hover::after, .nav-links a.active::after {
          width: 100%;
        }

        .nav-links a:hover, .nav-links a.active {
          color: var(--primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .lang-switcher {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .lang-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          background: transparent;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          border-radius: 0.35rem;
          transition: all 0.3s ease;
        }

        .lang-btn.active {
          background: white;
          color: var(--primary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .nav-login-btn {
          padding: 0.6rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(30, 64, 175, 0.2);
        }

        .nav-login-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(30, 64, 175, 0.3);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-main);
          transition: color 0.3s ease;
        }

        .mobile-menu-btn:hover {
          color: var(--primary);
        }

        /* Hero Section */
        .hero-section {
          padding: 1px 0 0;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          position: relative;
          overflow: hidden;
          min-height: 80vh;
          display: flex;
          align-items: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: center;
          padding: 2rem 1.5rem;
          position: relative;
          z-index: 2;
          gap: 3rem;
          width: 100%;
        }

        .hero-content {
          animation: slideInLeft 0.8s ease;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--primary-dark);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-btns {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .btn-get-started, .btn-login-outline {
          transition: all 0.3s ease;
        }

        .btn-get-started {
          padding: 1rem 2.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.3);
          font-size: 1rem;
        }

        .btn-get-started:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -3px rgba(30, 64, 175, 0.4);
        }

        .btn-get-started:active {
          transform: translateY(0);
        }

        .btn-login-outline {
          padding: 1rem 2.5rem;
          background: transparent;
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-login-outline:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }

        .hero-illustration {
          position: relative;
          display: flex;
          justify-content: flex-end;
          animation: slideInRight 0.8s ease;
        }

        .hero-illustration img {
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1));
          animation: float 3s ease-in-out infinite;
        }

        .illustration-bg {
          position: absolute;
          width: 450px;
          height: 450px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-40%, -50%);
          animation: pulse 3s ease-in-out infinite;
        }

        .hero-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          line-height: 0;
        }

        /* Features */
        .section-heading {
          text-align: center;
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--primary-dark);
          margin-bottom: 3.5rem;
          position: relative;
          animation: fadeInUp 0.8s ease;
        }

        .section-heading::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 4px;
          background: var(--secondary);
          border-radius: 2px;
          animation: slideInLeft 0.8s ease 0.2s forwards;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 2px solid #f1f5f9;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.12);
          border-color: var(--secondary);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: rotate(-10deg) scale(1.1);
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .feature-card p {
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* Workflow */
        .workflow-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .workflow-step {
          flex: 1;
          min-width: 160px;
          max-width: 200px;
          animation: fadeInUp 0.8s ease;
        }

        .step-box {
          padding: 2rem 1rem;
          border-radius: 1rem;
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .step-box::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .step-box:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }

        .step-box:hover::after {
          opacity: 1;
        }

        .step-icon {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .step-box:hover .step-icon {
          transform: scale(1.2) rotate(360deg);
          background: rgba(255,255,255,0.3);
        }

        .step-box span { font-weight: 700; font-size: 1rem; }

        .workflow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeInUp 0.8s ease;
        }

        /* Roles */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .role-card {
          background: white;
          padding: 2.5rem 1.5rem;
          border-radius: 1rem;
          text-align: center;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .role-card:nth-child(1) { border-top: 5px solid #dcfce7; }
        .role-card:nth-child(1):hover { border-top-color: #22c55e; }

        .role-card:nth-child(2) { border-top: 5px solid #fff7ed; }
        .role-card:nth-child(2):hover { border-top-color: #fb923c; }

        .role-card:nth-child(3) { border-top: 5px solid #f0f9ff; }
        .role-card:nth-child(3):hover { border-top-color: #0ea5e9; }

        .role-card:nth-child(4) { border-top: 5px solid #f5f3ff; }
        .role-card:nth-child(4):hover { border-top-color: #a855f7; }

        .role-header { margin-bottom: 1.5rem; }

        .role-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .role-card:hover .role-avatar {
          transform: scale(1.1) rotateZ(-10deg);
          box-shadow: 0 10px 20px rgba(30, 64, 175, 0.2);
        }

        .role-card h3 { font-weight: 800; font-size: 1.25rem; margin-bottom: 1rem; }
        .role-card p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0ea5e9, #06b6d4, #0ea5e9);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          border-color: #e0f2fe;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card h3 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-card p { font-weight: 600; color: var(--text-muted); }

        /* About & Contact */
        .side-heading {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--secondary);
          font-weight: 800;
          margin-bottom: 1rem;
          display: block;
        }

        .about-content h3 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary-dark);
          margin-bottom: 1.5rem;
          line-height: 1.4;
          animation: fadeInUp 0.8s ease;
        }

        .about-content p {
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 2.5rem;
          animation: fadeInUp 0.8s ease 0.1s backwards;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          color: var(--text-main);
          font-weight: 500;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease;
          flex-direction: column;
          text-align: center;
        }

        .info-item:hover {
          border-color: var(--primary);
          box-shadow: 0 10px 20px rgba(30, 64, 175, 0.12);
          transform: translateY(-5px);
          background: linear-gradient(135deg, #f0f9ff 0%, rgba(255,255,255,0.5));
        }

        .info-item svg { 
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .info-item:hover svg {
          transform: scale(1.2) rotate(-10deg);
        }

        .mt-4 { margin-top: 3rem; }

        .simple-footer {
          text-align: center;
          padding: 2rem;
          border-top: 1px solid #e2e8f0;
          color: var(--text-muted);
          font-size: 0.9rem;
          background: var(--bg-light);
        }

        /* Mobile/Tablet Responsiveness */
        @media (max-width: 1024px) {
          .hero-section {
            padding: 0px 0 0;
          }

          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 1rem;
            gap: 2rem;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-btns {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-illustration {
            justify-content: center;
          }

          .hero-illustration img {
            max-width: 350px;
          }

          .nav-links {
            display: none;
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1.5rem;
            gap: 0;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            animation: slideInDown 0.3s ease;
          }

          .nav-links.open {
            display: flex;
          }

          .nav-links a {
            padding: 1rem;
            border-radius: 0.5rem;
          }

          .nav-logo {
            justify-content: center;
          }

          .brand-tagline {
            display: none;
          }

          .section-heading {
            font-size:1.75rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .workflow-container {
            gap: 0.5rem;
          }

          .workflow-step {
            min-width: 120px;
          }

          .step-box {
            padding: 1.5rem 1rem;
            font-size: 0.9rem;
          }

          .section-padding {
            padding: 3rem 0;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 200px 0 2rem;
            min-height: auto;
          }

          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .section-heading {
            font-size: 1.5rem;
            margin-bottom: 2rem;
          }

          .section-padding {
            padding: 2.5rem 0;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }

          .role-card {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .nav-container {
            height: 70px;
            padding: 0 1rem;
          }

          .custom-navbar {
            height: 70px;
          }

          .nav-logo span {
            display: none;
          }

          .lang-switcher {
            display: none;
          }

          .nav-login-btn {
            display: none;
          }

          .hero-section {
            padding: 100px 1rem 2rem;
          }

          .hero-container {
            padding: 0;
          }

          .hero-content h1 {
            font-size: 1.5rem;
            line-height: 1.3;
          }

          .hero-subtitle {
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }

          .hero-btns {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-get-started, .btn-login-outline {
            width: 100%;
            padding: 0.8rem 1.5rem;
            font-size: 0.95rem;
          }

          .hero-illustration img {
            max-width: 280px;
          }

          .illustration-bg {
            width: 300px;
            height: 300px;
          }

          .container {
            padding: 0 1rem;
          }

          .section-heading {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .feature-card {
            padding: 1.25rem;
          }

          .feature-icon {
            width: 50px;
            height: 50px;
          }

          .feature-card h3 {
            font-size: 1.1rem;
          }

          .feature-card p {
            font-size: 0.85rem;
          }

          .workflow-container {
            gap: 0.25rem;
            flex-direction: column;
          }

          .workflow-arrow {
            transform: rotate(90deg);
            transform-origin: center;
            margin: 0.5rem 0;
          }

          .workflow-step {
            width: 100%;
            max-width: none;
            min-width: 100px;
          }

          .step-box {
            padding: 1.25rem 0.75rem;
            font-size: 0.8rem;
          }

          .statistics {
            padding: 2rem 0;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .stat-card h3 {
            font-size: 2rem;
          }

          .stat-card p {
            font-size: 0.85rem;
          }

          .role-card {
            padding: 1.5rem;
          }

          .role-avatar {
            width: 80px;
            height: 80px;
          }

          .role-card h3 {
            font-size: 1.1rem;
          }

          .role-card p {
            font-size: 0.8rem;
          }

          .info-item {
            padding: 1rem;
            flex-direction: row;
            text-align: left;
          }

          .info-item svg {
            min-width: 20px;
          }

          .about-content h3 {
            font-size: 1.5rem;
          }

          .about-content p {
            font-size: 0.9rem;
          }

          .simple-footer {
            padding: 1.5rem;
            font-size: 0.8rem;
          }

          .brand-text {
            display: none;
          }

          .nav-logo {
            gap: 0.5rem;
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
