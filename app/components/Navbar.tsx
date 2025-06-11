"use client"
import React, { useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return ( 
        <nav className='sticky top-0 z-50 w-full bg-[#BAE2B8] shadow-md'>
            <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
                <div className='flex items-center'>
                    <Link href="/" className='flex items-center'>
                        <Image 
                            alt="logo" 
                            src="/logo.png" 
                            height={50} 
                            width={50}
                            className='mr-2'
                        />
                        <span className='font-bold text-xl text-gray-800'>MediCare</span>
                    </Link>
                </div>
                
                {!loading && user ? (
                    <div className='flex items-center space-x-4'>
                        {user.organization && (
                            <span className="text-sm text-gray-600 bg-white/30 px-3 py-1 rounded">
                                {user.organization}
                            </span>
                        )}
                        
                        {/* User dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                <span>{user.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={logout} 
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    !loading && (
                        <Link href="/login" className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'>
                            Login
                        </Link>
                    )
                )}

                {/* Mobile menu button - you can add functionality later */}
                <div className='md:hidden'>
                    <button className='text-gray-800 focus:outline-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
     );
}
 
export default Navbar;