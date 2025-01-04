import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      // Clear all storage items
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Add a small delay for the animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to login
      navigate("/");
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6 bg-white rounded-full p-6 shadow-lg inline-block">
          <div className="relative">
            <LogOut size={40} className="text-blue-600 animate-bounce" />
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Signing you out...
        </h2>

        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 size={20} className="animate-spin" />
          <p>Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

export default Logout;
