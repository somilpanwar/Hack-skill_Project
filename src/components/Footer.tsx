import React from "react";

const Footer = () => {
  return (
  <footer className="bg-slate-50 border-t border-indigo-100 mt-12">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
  <div className="text-lg font-bold text-indigo-600 tracking-tight">LocalConnect</div>
        <div className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} LocalConnect. All rights reserved.</div>
        <div className="flex gap-4 text-gray-400">
          <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
