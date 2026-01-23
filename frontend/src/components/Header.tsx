import React from "react";
import DropdownMenu from "./DropdownMenu";
import { LogOut } from "lucide-react";

interface HeaderProps {
  username?: string;
  logout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, logout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          EasyPlanner
        </h1>

        <div className="flex items-center gap-4">
          {username && (
            <span className="text-gray-600 font-medium">Hello, {username}</span>
          )}

          <DropdownMenu />

          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded bg-red-600 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Wyjdź"
          >
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
};
