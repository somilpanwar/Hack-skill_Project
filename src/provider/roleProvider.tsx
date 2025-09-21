"use client"
import React, { ReactNode, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import roleContext from '@/context/roleContext';

const Roleprovider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState("User");
    const { user, isSignedIn } = useUser();
    
    // Load role from localStorage on component mount
    useEffect(() => {
        const savedRole = localStorage.getItem("userRole");
        if (savedRole && (savedRole === "User" || savedRole === "Seller")) {
            setRole(savedRole);
        }
    }, []);

    // Sync role from backend when user is authenticated
    useEffect(() => {
        const syncRoleFromBackend = async () => {
            if (isSignedIn && user?.id) {
                try {
                    const response = await fetch(`http://localhost:5000/role/${user.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.role) {
                            setRole(data.role);
                            localStorage.setItem("userRole", data.role);
                        }
                    }
                } catch (error) {
                    console.error('Error syncing role from backend:', error);
                    // If backend sync fails, keep the locally stored role
                }
            } else if (!isSignedIn) {
                // Clear role when user signs out
                setRole("User");
                localStorage.removeItem("userRole");
            }
        };

        syncRoleFromBackend();
    }, [isSignedIn, user?.id]);
    
    // Save role to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("userRole", role);
    }, [role]);
    
    const toggle = () => {
        if (role === "User") {
            setRole("Seller");
        } else {
            setRole("User");
        }
    }
    
    return (
        <roleContext.Provider value={{ role, toggle }}>
            {children}
        </roleContext.Provider>
    )
}

export default Roleprovider;