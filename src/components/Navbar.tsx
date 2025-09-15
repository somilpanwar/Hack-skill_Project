import React from "react";
import Link from "next/link";

const Navbar = () => {
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
        <div>
          <Link href="/login" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-colors">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
