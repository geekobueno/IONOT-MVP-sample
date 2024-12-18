'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  UserIcon, 
  ClipboardListIcon, 
  AwardIcon, 
  LogOutIcon 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const candidateLinks = [
    { href: '/candidate/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { href: '/candidate/projects', icon: ClipboardListIcon, label: 'Projects' },
    { href: '/candidate/profile', icon: UserIcon, label: 'Profile' },
    { href: '/candidate/scoreboard', icon: AwardIcon, label: 'Scoreboard' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { href: '/admin/projects', icon: ClipboardListIcon, label: 'Projects' },
    { href: '/admin/candidates', icon: UserIcon, label: 'Candidates' },
    { href: '/admin/submissions', icon: AwardIcon, label: 'Submissions' },
  ];

  const links = user.role === 'candidate' ? candidateLinks : adminLinks;

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 pt-16">
      <div className="px-4 py-6">
        <div className="flex items-center mb-8 px-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mr-4">
            <UserIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <nav>
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-md transition-colors group"
            >
              <link.icon 
                className="mr-3 text-gray-500 group-hover:text-indigo-600" 
                size={20} 
              />
              <span className="text-gray-700 group-hover:text-indigo-600">
                {link.label}
              </span>
            </Link>
          ))}

          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 hover:bg-gray-100 rounded-md transition-colors group mt-4"
          >
            <LogOutIcon 
              className="mr-3 text-gray-500 group-hover:text-red-600" 
              size={20} 
            />
            <span className="text-gray-700 group-hover:text-red-600">
              Logout
            </span>
          </button>
        </nav>
      </div>
    </aside>
  );
}