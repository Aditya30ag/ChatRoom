import React from 'react';
import { AlertCircle } from 'lucide-react';

const AuthForm = ({
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
  error
}) => {
  const isCreateMode = mode === 'create';
  const title = isCreateMode ? 'Create New Room' : 'Join Existing Room';
  const buttonText = isCreateMode ? 'Create Room' : 'Join Room';

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="p-8 bg-gray-800 rounded-xl transition-colors duration-200 group w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-4 ">
        <div>
          <label className="block text-sm font-medium text-white">
            Room ID
          </label>
          <input
            type="text"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white">
            {isCreateMode ? 'Admin Name' : 'Username'}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {buttonText}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AuthForm;