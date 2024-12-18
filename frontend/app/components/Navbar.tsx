// components/Navbar.tsx
'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-64 right-0 z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Project Management Training Platform
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              type="button" 
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="ml-4 flex items-center">
                <span className="text-gray-700 font-semibold">{user.name}</span>
                <button 
                  type="button" 
                  className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="User settings"
                >
                  <img 
                    src={'/default-avatar.png'} 
                    alt="User Avatar" 
                    className="h-8 w-8 rounded-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  