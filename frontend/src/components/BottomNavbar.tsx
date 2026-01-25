import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, History, Sun } from "lucide-react";

export const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/friends", label: "Friends", icon: <Users size={24} /> },
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={24} /> },
    { path: "/my-day", label: "My Day", icon: <Sun size={24} /> },
    { path: "/history", label: "Archive", icon: <History size={24} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe z-50 sm:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span className={`${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.icon}
              </span>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
