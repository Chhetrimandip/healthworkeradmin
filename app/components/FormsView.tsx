"use client"
import React, { useState } from 'react';
import { JoinForm } from "@/app/generated/prisma";
import FormDetailModal from './FormDetailModal';

interface FormsViewProps {
  forms: JoinForm[];
  onDataChange?: () => void; // To refresh data when needed
}

const FormsView = ({ forms, onDataChange }: FormsViewProps) => {
  const [selectedForm, setSelectedForm] = useState<JoinForm | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sendingEmails, setSendingEmails] = useState<{[key: string]: boolean}>({});

  const openModal = (form: JoinForm) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedForm(null);
  };

  // Add the sendEmail function
  const sendEmail = async (form: JoinForm) => {
    setSendingEmails(prev => ({ ...prev, [form.id]: true }));
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: form.email,
          name: `${form.firstName} ${form.lastName}`,
          organization: form.organizationToJoin
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      alert(`Payment confirmation email sent to ${form.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmails(prev => ({ ...prev, [form.id]: false }));
    }
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Submitted Join Forms</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Organization</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr 
                key={form.id} 
                className={`border-t border-gray-700 hover:bg-gray-700 ${form.approved ? 'bg-gray-750' : ''}`}
              >
                <td className="px-4 py-3">
                  {form.firstName} {form.middleName ? form.middleName + ' ' : ''}{form.lastName}
                </td>
                <td className="px-4 py-3">{form.email}</td>
                <td className="px-4 py-3">{form.phone}</td>
                <td className="px-4 py-3">{form.organizationToJoin}</td>
                <td className="px-4 py-3">{form.position}</td>
                <td className="px-4 py-3">{new Date(form.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {form.approved ? (
                    <span className="inline-flex items-center bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button 
                    onClick={() => openModal(form)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => sendEmail(form)}
                    disabled={sendingEmails[form.id]}
                    className={`${
                      sendingEmails[form.id] 
                        ? 'bg-gray-500' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white px-3 py-1 rounded flex items-center`}
                  >
                    {sendingEmails[form.id] ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Email'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && selectedForm && (
        <FormDetailModal 
          form={selectedForm} 
          onClose={closeModal}
          onApproved={onDataChange} // Refresh data on approval
        />
      )}
    </div>
  );
};

export default FormsView;