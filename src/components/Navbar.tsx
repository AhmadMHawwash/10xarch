"use client"
import Link from 'next/link';
import { useState } from 'react';
import { UserCircle, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle'; // Add this import

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state

  return (
    <nav className="bg-slate-100 dark:bg-gray-800 p-4 shadow-md h-[8vh]">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          System Design Playground
        </Link>
        
        <div className="hidden md:!flex space-x-4 items-center">
          <Link href="/projects" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Projects</Link>
          <Link href="/learn" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Learn</Link>
          <Link href="/community" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Community</Link>
          
          {isLoggedIn ? (
            <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <UserCircle className="inline-block w-6 h-6" />
            </Link>
          ) : (
            <Link href="/signin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Sign In</Link>
          )}
          <ThemeToggle />
        </div>
        
        <div className="flex md:hidden items-center">
          <ThemeToggle />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-2">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col space-y-2 mt-2">
            <Link href="/projects" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Projects</Link>
            <Link href="/learn" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Learn</Link>
            <Link href="/community" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Community</Link>
            
            {isLoggedIn ? (
              <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Profile</Link>
            ) : (
              <Link href="/signin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
