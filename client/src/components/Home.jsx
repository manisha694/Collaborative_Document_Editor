import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room ID is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("Room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <img
            src="https://placehold.co/150x60/1a202c/e2e8f0?text=CodeCast"
            alt="Logo"
            className="mx-auto mb-4 max-w-[150px]"
          />
          <h4 className="text-white text-xl font-semibold">Enter the ROOM ID</h4>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="ROOM ID"
            onKeyUp={handleInputEnter}
            spellCheck={false}
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="USERNAME"
            onKeyUp={handleInputEnter}
            spellCheck={false}
          />

          <button
            onClick={joinRoom}
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold transition"
            aria-label="Join Room"
          >
            JOIN
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have a room ID? Create{" "}
          <span
            onClick={generateRoomId}
            className="text-green-500 font-semibold cursor-pointer hover:underline"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") generateRoomId(e);
            }}
          >
            New Room
          </span>
        </p>
      </div>
    </div>
  );
}

export default Home;
