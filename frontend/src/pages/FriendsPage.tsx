import { Header } from "../components/Header";
import { FriendsList } from "../components/FriendsList";
import { useAuth } from "../contexts/AuthContextType";

export const FriendsPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Header username={user?.username || "User"} logout={logout} />
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <FriendsList />
      </div>
    </div>
  );
};
