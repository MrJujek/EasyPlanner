import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DropdownMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDashboard = () => {
    navigate("/");
  };

  const handleArchive = () => {
    navigate("/history");
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-xl font-bold text-gray-600 leading-none pb-2 tracking-tighter">
          ...
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={handleDashboard}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </button>
          </div>
          <div className="py-1">
            <button
              onClick={handleArchive}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
