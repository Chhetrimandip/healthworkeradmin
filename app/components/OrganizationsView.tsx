"use client"
import React, { useState, useEffect } from 'react';
import { person as Person } from "@/app/generated/prisma";

interface OrganizationsViewProps {
  organization: string;
}

const OrganizationsView = ({ organization }: OrganizationsViewProps) => {
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/organizations/${encodeURIComponent(organization)}/members`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch members');
        }
        
        setMembers(data.members);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load members. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  if (loading) {
    return <div className="text-center p-8 text-white">Loading members...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!members.length) {
    return <div className="text-center p-8 text-white">No members found for this organization.</div>;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Members of {organization}</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Join Date</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-3">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">{member.phone}</td>
                <td className="px-4 py-3">{new Date(member.joinDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationsView;