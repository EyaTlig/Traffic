import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { UserPlusIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const USERS_QUERY = gql`
  query Users {
    users {
      id
      email
      username
      role
      isActive
      createdAt
    }
  }
`;

const Users = () => {
  const { isAdmin } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { loading, error, data, refetch } = useQuery(USERS_QUERY);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Accès non autorisé</h2>
        <p className="mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gestion des utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          Inviter un utilisateur
        </button>
      </div>

      {showInviteForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Inviter un utilisateur</h2>
          <p className="text-gray-500 mb-4">
            Cette fonctionnalité sera disponible prochainement.
          </p>
          <button onClick={() => setShowInviteForm(false)} className="btn-secondary">
            Fermer
          </button>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? (
                        <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <UserIcon className="w-3 h-3 mr-1" />
                      )}
                      {user.role === 'ADMIN' ? 'Admin' : 'Opérateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;