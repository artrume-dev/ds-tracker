import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Palette, 
  Users, 
  GitBranch, 
  Settings, 
  FileText,
  BarChart3,
  Bell,
  Mail,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tokens', href: '/tokens', icon: Palette },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Change Requests', href: '/change-requests', icon: GitBranch },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Team Subscriptions', href: '/team-subscriptions', icon: UserCheck },
    { name: 'Email Config', href: '/email-config', icon: Mail },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Canon DS</h1>
            <p className="text-gray-400 text-sm">Token Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">SC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Sarah Chen</p>
            <p className="text-gray-400 text-xs">Design System Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
