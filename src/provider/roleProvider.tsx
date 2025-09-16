"use client"
import React, { ReactNode, useState } from 'react'
import roleContext from '@/context/roleContext';
const Roleprovider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState("User");
    const toggle = () => {
        if (role === "User") setRole("Seller");
        else
            setRole("User")
    }
    return (
        <roleContext.Provider value={{ role, toggle }}>
            {children}
        </roleContext.Provider>
    )
}

export default Roleprovider;