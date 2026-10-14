import { useAuth } from "../context/AuthContext";

export default function Admin() {

  const { currentUser, isAdmin } = useAuth();

  if (!isAdmin) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-3xl font-bold text-red-500">
          Access Denied
        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#020617] text-white p-8">

      <h1 className="text-4xl font-bold mb-4">
        Admin Dashboard
      </h1>

      <p className="text-gray-400 mb-10">
        Welcome Admin: {currentUser?.email}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">

          <h2 className="text-2xl font-bold mb-2">
            Events
          </h2>

          <p className="text-gray-400">
            Manage all college events
          </p>

        </div>

        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">

          <h2 className="text-2xl font-bold mb-2">
            Notes
          </h2>

          <p className="text-gray-400">
            Manage uploaded study materials
          </p>

        </div>

        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">

          <h2 className="text-2xl font-bold mb-2">
            Users
          </h2>

          <p className="text-gray-400">
            View registered students
          </p>

        </div>

      </div>

    </div>

  );

}