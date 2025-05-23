import React, { useState, useEffect, useRef } from "react";

// List of Lo-Fi MP3 tracks
const loFiTracks = [
  {
    id: 1,
    url: "/assets/songs/Breathe.mp3",
    title: "Soothing Lo-Fi",
  },
  
];

// Utility to get a random track
const getRandomTrack = () => {
  const randomIndex = Math.floor(Math.random() * loFiTracks.length);
  return loFiTracks[randomIndex];
};

const MoodMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume (50%)
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio(getRandomTrack().url)); // Initialize with random track

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Clean up audio on component unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause(); // Pause audio on unmount
    };
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsVolumeVisible(false); // Hide volume bar when pausing
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsVolumeVisible(true); // Show volume bar when playing
        })
        .catch((err) => {
          console.error("Audio play error:", err);
          setError("Failed to play audio. Please try again.");
        });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
  };

  const muteVolume = () => {
    setVolume(0);
  };

  const maxVolume = () => {
    setVolume(1);
  };

  if (error) {
    return (
      <div className="relative flex flex-col items-center w-32 right-[27rem] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center w-32 right-[27rem]">
      {/* Container for Lo-Fi Pic and Music Icon */}
      <div className="relative w-32 h-32">
        {/* Lo-Fi Pic */}
        <img
          src="/assets/Navbar Icons/Lofi pics/one.png"
          alt="Lo-Fi Pic"
          className={`cursor-pointer rounded-full h-[60px] w-[60px] absolute top-10 left-1/2 transform -translate-x-1/2 z-10 ${
            isPlaying ? "animate-spin" : ""
          }`}
          onClick={toggleMusic}
        />
        {/* Music Icon */}
        <img
          src="/assets/Navbar Icons/music.png"
          alt="Music Icon"
          className="h-[120px] w-[120px] absolute top-3 left-1/2 transform -translate-x-1/2 z-0 cursor-pointer"
          onClick={toggleMusic}
        />
      </div>
      {/* Volume Bar - Shown only when isVolumeVisible is true */}
      {isVolumeVisible && (
        <div className="flex items-center space-x-2 mt-2">
          {/* Mute Button */}
          <button
            onClick={muteVolume}
            className="h-5 w-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs"
          >
            M
          </button>
          {/* Slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-24 accent-purple-500"
          />
          {/* Max Volume Button */}
          <button
            onClick={maxVolume}
            className="h-5 w-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodMusic;