import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, History, Sun, Users } from "lucide-react";
import { Button } from "@heroui/react";

interface HeaderProps {
  username?: string;
  logout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, logout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
    ${
      isActive(path)
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }
  `;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-gray-900 flex items-center gap-2"
        >
          <span className="tracking-tight">EasyPlanner</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={navLinkClass("/")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/my-day" className={navLinkClass("/my-day")}>
            <Sun size={18} />
            My Day
          </Link>
          <Link to="/friends" className={navLinkClass("/friends")}>
            <Users size={18} />
            Friends
          </Link>
          <Link to="/history" className={navLinkClass("/history")}>
            <History size={18} />
            Archive
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          {username && (
            <div className="hidden sm:flex flex-row items-end">
              <span className="text-sm text-gray-400 uppercase tracking-wider">
                Hello,{" "}
                <span className="font-semibold text-gray-700">{username}</span>
              </span>
            </div>
          )}

          <Button
            isIconOnly
            onPress={logout}
            className="rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100"
            title="Sign Out"
          >
            <LogOut size={20} color="red" />
          </Button>
        </div>
      </div>
    </header>
  );
};
