import React from 'react';
import Avatar from 'react-avatar';

function Client({ username }) {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
      <Avatar
        name={username.toString()}
        size="50"
        round="14px"
        className="flex-shrink-0"
      />
      <span className="text-gray-200 font-medium truncate">{username.toString()}</span>
    </div>
  );
}

export default Client;
