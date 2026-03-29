import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, BarChart3, Package, 
  ChevronRight, ArrowRight, Building2, Users
} from 'lucide-react';
import MainLayout from '../common/MainLayout';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="home-container">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-content">
            <div className="badge">Education Infrastructure Redefined</div>
            <h1>{t('hero_title')} <br /><span>{t('hero_subtitle')}</span></h1>
            <p>{t('hero_desc')}</p>
            <div className="hero-btns">
              <button className="primary-btn" onClick={() => navigate('/login')}>
                {t('enter_portal')} <ArrowRight size={18} />
              </button>
              <button className="secondary-btn">{t('explore_features')}</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card main">
              <BarChart3 size={40} color="#0ea5e9" />
              <div className="bar-group">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '40%' }}></div>
              </div>
            </div>
            <div className="visual-card floating one">
              <Shield size={24} color="#10b981" />
              <span>Secure Access</span>
            </div>
            <div className="visual-card floating two">
              <Package size={24} color="#f59e0b" />
              <span>Inventory tracking</span>
            </div>
          </div>
        </header>

        {/* Features Grid */}
        <section className="features">
          <div className="section-title">
            <h2>{t('features_title')}</h2>
            <p>{t('features_subtitle')}</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-box blue">
                <Building2 />
              </div>
              <h3>{t('work_monitoring')}</h3>
              <p>{t('work_monitoring_desc')}</p>
            </div>
            <div className="feature-card">
              <div className="icon-box green">
                <Package />
              </div>
              <h3>{t('inventory_control')}</h3>
              <p>{t('inventory_control_desc')}</p>
            </div>
            <div className="feature-card">
              <div className="icon-box purple">
                <Users />
              </div>
              <h3>{t('role_based_access')}</h3>
              <p>{t('role_based_access_desc')}</p>
            </div>
          </div>
        </section>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .home-container {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background: #ffffff;
          }

          /* Hero Section */
          .hero {
            display: flex;
            align-items: center;
            padding: 6rem 5% 8rem;
            gap: 4rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .hero-content {
            flex: 1;
          }

          .badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #f0f9ff;
            color: #0ea5e9;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            border: 1px solid #bae6fd;
          }

          .hero-content h1 {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            color: #0f172a;
            margin-bottom: 1.5rem;
          }

          .hero-content h1 span {
            background: linear-gradient(90deg, #0ea5e9, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-content p {
            font-size: 1.125rem;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 2.5rem;
            max-width: 540px;
          }

          .hero-btns {
            display: flex;
            gap: 1rem;
          }

          .primary-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: #0ea5e9;
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
          }

          .primary-btn:hover {
            background: #0284c7;
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.4);
          }

          .secondary-btn {
            padding: 1rem 2rem;
            background: white;
            color: #475569;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .secondary-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          /* Hero Visual */
          .hero-visual {
            flex: 1;
            position: relative;
            height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .visual-card {
            background: white;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .visual-card.main {
            width: 300px;
            height: 300px;
            border: 1px solid #f1f5f9;
          }

          .bar-group {
            display: flex;
            align-items: flex-end;
            gap: 1rem;
            flex: 1;
          }

          .bar {
            flex: 1;
            background: #e0f2fe;
            border-radius: 0.5rem;
            position: relative;
          }

          .bar::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60%;
            background: #0ea5e9;
            border-radius: 0.5rem;
          }

          .floating {
            position: absolute;
            flex-direction: row;
            align-items: center;
            padding: 1rem 1.5rem;
            gap: 1rem;
            font-weight: 700;
            font-size: 0.9rem;
          }

          .floating.one {
            top: 10%;
            right: 0;
            animation: float 3s ease-in-out infinite;
          }

          .floating.two {
            bottom: 10%;
            left: 0;
            animation: float 3s ease-in-out infinite reverse;
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }

          /* Features Section */
          .features {
            padding: 8rem 5%;
            background: #f8fafc;
          }

          .section-title {
            text-align: center;
            margin-bottom: 4rem;
          }

          .section-title h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }

          .section-title p {
            color: #64748b;
            font-size: 1.1rem;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .feature-card {
            background: white;
            padding: 2.5rem;
            border-radius: 1.5rem;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
          }

          .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
            border-color: #0ea5e9;
          }

          .icon-box {
            width: 50px;
            height: 50px;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }

          .icon-box.blue { background: #e0f2fe; color: #0ea5e9; }
          .icon-box.green { background: #dcfce7; color: #10b981; }
          .icon-box.purple { background: #f3e8ff; color: #a855f7; }

          .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          .feature-card p {
            color: #64748b;
            line-height: 1.6;
          }

          @media (max-width: 968px) {
            .hero { flex-direction: column; text-align: center; padding-top: 2rem; }
            .hero-content h1 { font-size: 2.5rem; }
            .hero-btns { justify-content: center; }
            .hero-visual { display: none; }
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default HomePage;
