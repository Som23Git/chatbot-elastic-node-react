import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await axios.post("http://localhost:3000/chat", { message: input });
      const botMessage = { sender: "bot", text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error fetching response" }]);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 bg-gray-100 rounded-xl shadow-lg">
      <div className="h-80 overflow-y-auto mb-4 p-2 bg-white rounded-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-lg">Send</button>
      </div>
    </div>
  );
}
