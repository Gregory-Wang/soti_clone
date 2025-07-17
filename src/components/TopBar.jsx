import { Bell, Search, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="relative w-64">
        <input
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="Search..."
        />
        <Search className="absolute right-2 top-2.5 text-gray-400" size={18} />
      </div>
      <div className="flex items-center space-x-4">
        <Bell className="text-gray-600" />
        <User className="text-gray-600" />
      </div>
    </header>
  );
}
