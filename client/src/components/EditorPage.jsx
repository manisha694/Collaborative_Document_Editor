import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// List of supported languages for the compiler
const LANGUAGES = [
  "python",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  // State variables for managing the component's UI and data
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");

  // useRef hooks to persist values across renders without causing re-renders
  const codeRef = useRef(null);
  const socketRef = useRef(null);

  // React Router hooks for navigation and state management
  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  // useEffect hook for socket initialization and cleanup
  useEffect(() => {
    // Asynchronous function to initialize the socket connection
    const init = async () => {
      // Connect to the socket server
      socketRef.current = await initSocket();

      // Define a function to handle connection errors
      const handleErrors = (err) => {
        console.error("Socket connection error:", err);
        toast.error("Socket connection failed, please try again.");
        navigate("/");
      };

      // Set up error listeners
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      // Emit the JOIN action to the server with room and username details
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      // Listen for the JOINED event from the server
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          // Display a toast notification for new users joining
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          // Update the list of connected clients
          setClients(clients);
          // Sync the code with the newly joined client
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listen for the DISCONNECTED event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        // Filter out the disconnected client from the state
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    // Cleanup function for the useEffect hook
    return () => {
      // Disconnect the socket and remove listeners to prevent memory leaks
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // If there's no username, redirect to the home page
  if (!Location.state) {
    return <Navigate to="/" />;
  }

  // Handler to copy the room ID to the clipboard
  const copyRoomId = async () => {
    try {
      // Use the navigator.clipboard API to copy text
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy room ID:", error);
      toast.error("Failed to copy room ID. Please try again.");
    }
  };

  // Handler to leave the current room
  const leaveRoom = () => {
    navigate("/");
  };

  // Handler to run the code via the backend compiler service
  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsCompiling(false);
    }
  };

  // Handler to toggle the compiler output window's visibility
  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Client Panel - Sidebar */}
        <div className="flex flex-col md:w-1/5 lg:w-1/6 bg-gray-950 p-4 border-r border-gray-700">
          <div className="flex flex-col items-center">
           
            <img
              src="https://placehold.co/150x60/1a202c/e2e8f0?text=CodeCast"
              alt="Logo"
              className="max-w-[150px] mb-4"
            />
            <hr className="w-full border-gray-700" />
            <span className="text-sm font-semibold text-gray-400 mt-4 mb-2">
              MEMBERS
            </span>
          </div>

          {/* Client list container */}
          <div className="flex-grow overflow-y-auto mb-4 p-2 space-y-2 rounded-lg bg-gray-800">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr className="w-full border-gray-700" />

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="px-4 py-2 bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-bold"
              onClick={copyRoomId}
            >
              Copy Room ID
            </button>
            <button
              className="px-4 py-2 bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-bold"
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          {/* Language selector */}
          <div className="bg-gray-800 p-2 flex justify-end items-center border-b border-gray-700">
            <select
              className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Main Editor */}
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>

      {/* Compiler toggle button */}
      <button
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleCompileWindow}
      >
        {isCompileWindowOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )}
      </button>

      {/* Compiler section */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-700 transition-all duration-300 ease-in-out z-40 ${
          isCompileWindowOpen ? "h-80 opacity-100 p-4" : "h-0 opacity-0 p-0"
        } overflow-hidden`}
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-lg font-bold text-blue-400">
            Compiler Output ({selectedLanguage})
          </h5>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg shadow-md font-bold transition-colors duration-200 ${
                isCompiling
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              }`}
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button
              className="px-4 py-2 rounded-lg shadow-md font-bold bg-gray-700 hover:bg-gray-600 transition-colors duration-200 focus:ring-2 focus:ring-gray-500"
              onClick={toggleCompileWindow}
            >
              Close
            </button>
          </div>
        </div>
        <pre className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-auto h-full">
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}

export default EditorPage;
