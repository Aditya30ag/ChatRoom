import React from "react";
import { Plus, Users } from "lucide-react";

export default function ModeSelection({ createBtn, joinBtn }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Welcome to Chat Room</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={createBtn}
            className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Plus className="h-12 w-12 text-blue-400 mb-4 group-hover:text-blue-300" />
            <span className="text-xl font-semibold text-white">Create New Room</span>
            <p className="mt-2 text-gray-400 text-sm">Start a new chat room for your group</p>
          </button>

          <button 
            onClick={joinBtn}
            className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-200 group"
          >
            <Users className="h-12 w-12 text-green-400 mb-4 group-hover:text-green-300" />
            <span className="text-xl font-semibold text-white">Join Existing Room</span>
            <p className="mt-2 text-gray-400 text-sm">Enter an existing chat room</p>
          </button>
        </div>
      </div>
    </div>
  );
}