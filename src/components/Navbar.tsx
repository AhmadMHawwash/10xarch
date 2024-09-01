"use client"
import Link from 'next/link';
import { useState } from 'react';
import { UserCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          System Design Playground
        </Link>
        
        <div className="hidden md:!flex space-x-4">
          <Link href="/projects" className="hover:text-gray-300">Projects</Link>
          <Link href="/learn" className="hover:text-gray-300">Learn</Link>
          <Link href="/community" className="hover:text-gray-300">Community</Link>
          
          {isLoggedIn ? (
            <Link href="/profile" className="hover:text-gray-300">
              <UserCircle className="inline-block w-6 h-6" />
            </Link>
          ) : (
            <Link href="/signin" className="hover:text-gray-300">Sign In</Link>
          )}
        </div>
        
        <div className="flex md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col space-y-2 mt-2">
            <Link href="/projects" className="hover:text-gray-300">Projects</Link>
            <Link href="/learn" className="hover:text-gray-300">Learn</Link>
            <Link href="/community" className="hover:text-gray-300">Community</Link>
            
            {isLoggedIn ? (
              <Link href="/profile" className="hover:text-gray-300">Profile</Link>
            ) : (
              <Link href="/signin" className="hover:text-gray-300">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
