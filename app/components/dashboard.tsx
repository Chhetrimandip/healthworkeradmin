"use client"
import React, { useEffect, useState } from 'react'
import FormsView from './FormsView'
import { JoinForm } from '@/app/generated/prisma'
import OrganizationsView from './OrganizationsView'
import { useAuth } from '@/lib/auth-context';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeView, setActiveView] = useState("forms")
    const [loading, setLoading] = useState(false)
    const [forms, setForms] = useState<JoinForm[]>([])
    const [error, setError] = useState<string | null>(null);
    const [showOrganizationDropdown, setShowOrganizationDropdown] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
    const [organizations, setOrganizations] = useState<string[]>([]);

    // If user is org_admin, pre-select their organization
    useEffect(() => {
    console.log('Dashboard: Auth state changed', { 
        user: user ? `${user.name} (${user.role})` : 'No user',
        authLoading
    });
}, [user, authLoading]);
    useEffect(() => {
        if (user && user.role === 'org_admin' && user.organization) {
            setSelectedOrganization(user.organization);
        }
    }, [user]);

    const fetchData = async () => {
        // Don't fetch until auth is complete
        if (authLoading || !user) return;
        
        setLoading(true);
        try {
            let data;
            switch(activeView) {
                case 'forms':
                    console.log('Fetching forms data...');
                    
                    // For simplicity, just fetch all forms regardless of user type
                    const response = await fetch('/api/forms/all');
                    data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch forms');
                    }
                    
                    // Client-side filtering based on user role
                    let filteredForms;
                    if (user.role === 'super_admin') {
                        filteredForms = data.forms; // Super admin sees all forms
                    } else {
                        // Organization admin only sees their organization's forms
                        filteredForms = data.forms.filter(
                            (form) => form.organizationToJoin === user.organization
                        );
                    }
                    
                    console.log('Forms data received:', filteredForms.length);
                    setForms(filteredForms);
                    
                    // Extract unique organizations
                    const uniqueOrgs = Array.from(
                        new Set(filteredForms.map((form) => form.organizationToJoin))
                    );
                    setOrganizations(uniqueOrgs);
                    
                    break;
                // Add other cases here as needed
            }
        } catch(error) {
    console.error("Error fetching data:", error);
    if (error instanceof Error) {
        if (error.message === 'Invalid token' || error.message === 'Unauthorized') {
            // Authentication issue - could trigger a re-login
            setError("Authentication failed. Please try logging in again.");
        } else {
            setError(`Failed to load data: ${error.message}`);
        }
    } else {
        setError("Failed to load data. Please try again later.");
    }
}finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchData()
    }

    // Fetch when user changes or view changes
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [activeView, user])

    const handleNavigation = (view: string) => {
        setActiveView(view);
    }

    const handleOrganizationSelect = (org: string | null) => {
        // If user is org_admin, they can't change organization
        if (user?.role === 'org_admin') return;
        
        setSelectedOrganization(org);
        setShowOrganizationDropdown(false);
    }

    const filteredForms = selectedOrganization 
        ? forms.filter(form => form.organizationToJoin === selectedOrganization)
        : forms;

    const renderView = () => {
        if (loading) {
            return <div className='bg-black text-white p-8 text-center'>Loading data...</div>
        }
        if (error) {
            return <div className='bg-black text-white p-8 text-center'>{error}</div>
        }

        switch (activeView) {
            case 'forms':
            return <FormsView forms={filteredForms} onDataChange={refreshData} />;
            case 'organizations':
            return selectedOrganization ? (
                <OrganizationsView organization={selectedOrganization} />
            ) : (
                <div className="bg-gray-900 p-6 rounded-lg text-white text-center">
                <h2 className="text-2xl font-bold mb-6">Organizations</h2>
                <p>Please select an organization from the dropdown above.</p>
                </div>
            );
            default:
            return <div>Select a view</div>
        }
    }
    
    // Determine if org dropdown should be shown - only for super_admin
    const showOrgDropdown = user?.role === 'super_admin';
    
    return (    
        <div className="min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-4">
                <nav className="flex gap-6 items-center">
                    <button 
                        onClick={() => handleNavigation("forms")}
                        className={`px-4 py-2 ${activeView === 'forms' ? 'bg-blue-600' : 'bg-gray-700'} text-white rounded`}
                    >
                        Submitted Forms
                    </button>

                    {showOrgDropdown && activeView === 'forms' && (
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowOrganizationDropdown(true)}
                                className="px-4 py-2 bg-gray-700 text-white rounded flex items-center gap-2"
                            >
                                {selectedOrganization || 'All Organizations'} 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showOrganizationDropdown && (
                                <div 
                                    className="absolute z-10 mt-1 w-64 bg-gray-800 rounded-md shadow-lg py-1"
                                    onMouseLeave={() => setShowOrganizationDropdown(false)}
                                >
                                    <button
                                        className={`block w-full text-left px-4 py-2 text-white hover:bg-gray-700 ${selectedOrganization === null ? 'bg-blue-600' : ''}`}
                                        onClick={() => handleOrganizationSelect(null)}
                                    >
                                        All Organizations
                                    </button>
                                    
                                    {organizations.map((org, index) => (
                                        <button
                                            key={index}
                                            className={`block w-full text-left px-4 py-2 text-white hover:bg-gray-700 ${selectedOrganization === org ? 'bg-blue-600' : ''}`}
                                            onClick={() => handleOrganizationSelect(org)}
                                        >
                                            {org}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button 
                        onClick={() => handleNavigation("organizations")}
                        className={`px-4 py-2 ${activeView === 'organizations' ? 'bg-blue-600' : 'bg-gray-700'} text-white rounded`}
                    >
                        Organizations
                    </button>
                </nav>
            </div>
            
            <div className="container mx-auto px-4 py-8">
                {selectedOrganization && (
                    <div className="mb-4 flex items-center">
                        <span className="text-white mr-2">Viewing forms for:</span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                            {selectedOrganization}
                            {showOrgDropdown && (
                                <button 
                                    onClick={() => setSelectedOrganization(null)}
                                    className="ml-2 text-white hover:text-red-300 focus:outline-none"
                                    aria-label="Clear filter"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    </div>
                )}
                {renderView()}
            </div>
        </div>
    );
}
 
export default Dashboard;