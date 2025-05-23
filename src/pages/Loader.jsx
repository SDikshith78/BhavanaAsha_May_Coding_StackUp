import React, { useState, useEffect } from "react";
import "./Loader.css"; // Import CSS for fade animation

const greetings = [
  "Hello",
  "स्वागत हे",
  "Bonjour",
  "Ciao",
  "Olá",
  "おい",
  "ようこそ",
  "Hallå",
  "ସ୍ୱାଗତମ୍‌",
  "ಸ್ವಾಗತ",
  "స్వాగతం",
];

const Loader = () => {
  const [currentGreeting, setCurrentGreeting] = useState(0);

  useEffect(() => {
    console.log("Loader useEffect, currentGreeting:", greetings[currentGreeting]);
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length);
    }, 1500); // 1.5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="h-screen w-screen bg-zinc-800 flex items-center justify-center">
      <div className="text-white text-5xl animate-fade">
        {greetings[currentGreeting]}
      </div>
    </div>
  );
};

export default Loader;