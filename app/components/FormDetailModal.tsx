"use client"
import React, { useState } from 'react';
import { JoinForm } from "@/app/generated/prisma";

interface FormDetailModalProps {
  form: JoinForm;
  onClose: () => void;
  onApproved?: () => void; // callback to refresh data after approval
}

const FormDetailModal = ({ form, onClose, onApproved }: FormDetailModalProps) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await fetch('/api/forms/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: form.id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve form');
      }
      
      alert(`Form for ${form.firstName} ${form.lastName} approved successfully!`);
      
      // Call the onApproved callback to refresh data if provided
      if (onApproved) {
        onApproved();
      }
      
      onClose();
    } catch (error) {
      console.error('Error approving form:', error);
      alert('Failed to approve form. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  // Show different UI if form is already approved
  const isAlreadyApproved = form.approved;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-white">Form Details</h2>
            {isAlreadyApproved && (
              <span className="ml-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                Approved
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
                    <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Personal Information</h3>
              
              <div className="space-y-2 text-white">
                <div>
                  <span className="text-gray-400">Full Name:</span>
                  <p>{form.firstName} {form.middleName || ''} {form.lastName}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p>{form.email}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <p>{form.phone}</p>
                </div>
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Professional Information</h3>
              
              <div className="space-y-2 text-white">
                <div>
                  <span className="text-gray-400">Organization to Join:</span>
                  <p>{form.organizationToJoin}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Department:</span>
                  <p>{form.department}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Position:</span>
                  <p>{form.position}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Subject:</span>
                  <p>{form.subject || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">License Number:</span>
                  <p>{form.licenseNo || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Experience:</span>
                  <p>{form.experience !== null && form.experience !== undefined ? `${form.experience} years` : 'N/A'}</p>
                </div>
              </div>
            </section>
            
            <section className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Address</h3>
              
              <div className="space-y-2 text-white">
                <div>
                  <span className="text-gray-400">Address:</span>
                  <p>
                    {form.street ? `${form.street}, ` : ''}
                    Ward {form.ward}, {form.municipality}, {form.district}, {form.province}
                  </p>
                </div>
              </div>
            </section>
            
            <section className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Additional Information</h3>
              
              <div className="space-y-2 text-white">
                <div>
                  <span className="text-gray-400">Current Organization:</span>
                  <p>{form.organization || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Available For:</span>
                  <p>{form.availableFor || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Message:</span>
                  <p className="whitespace-pre-wrap">{form.message || 'No message provided'}</p>
                </div>
              </div>
            </section>
            
            <section className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Timestamps</h3>
              
              <div className="space-y-2 text-white">
                <div>
                  <span className="text-gray-400">Created At:</span>
                  <p>{new Date(form.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">Last Updated:</span>
                  <p>{new Date(form.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </section>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded mr-3"
            >
              Close
            </button>
            
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className={`px-4 py-2 ${isApproving ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded flex items-center`}
            >
              {isApproving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Approve Form'}
            </button>
          </div>
        </div>
          
        </div>
      </div>
    </div>
  );
};

export default FormDetailModal;