import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LicenseKeyManager } from '../components/LicenseKeyManager';
import { Shield } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">控商的泡面房</h1>
          </div>
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              返回点这就可以啦
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LicenseKeyManager />
      </main>
    </div>
  );
};