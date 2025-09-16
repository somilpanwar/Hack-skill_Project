"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import roleContext from "@/context/roleContext";
import { useParams, usePathname } from "next/navigation";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const { role, toggle } = useContext(roleContext);
  const path = usePathname();


  const handleRole = async (role: string) => {
    toggle();
    if (isSignedIn) {
      try {
        const res = await fetch("http://localhost:5000/role", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: role, Id: user.id })
        })
        if (res.status == 200) {
          console.log("access granted!");

        }
      } catch (error) {
        if (error)
          console.log("Error", error);
      }
    } else {
      throw new Error(" Login again!");
    }
  }
  return (
    <nav className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">LocalConnect</span>
        </div>
        <ul className="flex gap-6 text-base text-gray-400 font-medium">
          <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
          <li><Link href="/shops" className="hover:text-orange-400  transition-colors">Shops</Link></li>
          <li><Link href="/artists" className="hover:text-orange-400 transition-colors">Artists</Link></li>
          <li><Link href="/about" className="hover:text-orange-400 transition-colors">About</Link></li>
          <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
        </ul>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="px-4 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-colors">
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        {path === '/' && <div>
          {
            role != "Seller" ?
              <button className="bg-blue-800 text-white p-2 rounded-sm font-semibold" onClick={() => handleRole('Seller')}>
                Become Seller
              </button> :
              <button className="bg-green-800 text-white p-3 rounded-sm font-semibold" onClick={() => handleRole('User')}>
                become User
              </button>
          }
        </div>}
      </div>
    </nav>
  );
};

export default Navbar;
