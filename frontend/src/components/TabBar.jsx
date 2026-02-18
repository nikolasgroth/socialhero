import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, History, HelpCircle, User } from './Icons';

const tabs = [
  { path: '/', label: 'SOS', icon: Shield },
  { path: '/history', label: 'Historie', icon: History },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
  { path: '/account', label: 'Account', icon: User },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={active ? 'active' : ''}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
