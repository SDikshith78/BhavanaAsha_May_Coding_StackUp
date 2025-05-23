// E:\bhavana-asha\src\pages\UploadFile.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import toast from "react-hot-toast";
import { supabase } from "../supabase/supabase";

// Variants for animations
const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

// Grid Pattern Component
const GridPattern = () => {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
};

const UploadFile = () => {
  const [files, setFiles] = useState([]);
  const [journal, setJournal] = useState("");
  const [songSource, setSongSource] = useState("Local Storage");
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songFile, setSongFile] = useState(null);

  const fileInputRef = useRef(null);
  const songInputRef = useRef(null);
  const songOptions = ["Local Storage", "AI-Generated", "Internet"];

  const handleFileChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    accept: "image/*,video/*",
    onDropRejected: (error) => console.log(error),
  });

  const uploadSongToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bhavanaasha_files");
    formData.append("cloud_name", "sdikshith");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/sdikshith/auto/upload",
      formData
    );
    console.log("Uploaded song to Cloudinary:", response.data.secure_url);
    return response.data.secure_url;
  };

  const handleSongFileChange = async (e) => {
    const file = e.target.files[0];
    setSongFile(file);
    if (file) {
      const songPreviewUrl = await uploadSongToCloudinary(file);
      setSongUrl(songPreviewUrl);
    }
  };

  const getSongUrl = async (source, file) => {
    if (source === "Local Storage") {
      if (!file) return toast.error("Please select a song file!");
      return await uploadSongToCloudinary(file);
    } else if (source === "AI-Generated") {
      const url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      setSongUrl(url);
      return url;
    } else if (source === "Internet") {
      const url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      setSongUrl(url);
      return url;
    }
    return null;
  };

  const handleSongSourceChange = async (source) => {
    setSongSource(source);
    if (source !== "Local Storage") {
      setSongFile(null);
      const songPreviewUrl = await getSongUrl(source, null);
      setSongUrl(songPreviewUrl);
    } else {
      setSongUrl("");
    }
  };

  const handleDiscard = () => {
    setFiles([]);
    setJournal("");
    setSongSource("Local Storage");
    setUploadedUrl("");
    setSongUrl("");
    setSongFile(null);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("Please select a file!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("upload_preset", "bhavanaasha_files");
    formData.append("cloud_name", "sdikshith");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/sdikshith/auto/upload",
        formData
      );
      const url = response.data.secure_url;
      setUploadedUrl(url);

      const songUrlToSave = songUrl || (await getSongUrl(songSource, songFile));

      const { error } = await supabase.from("uploads").insert([
        {
          url,
          journal,
          song_source: songSource,
          song_url: songUrlToSave,
          is_ai_video: false,
        },
      ]);

      if (error) throw error;

      toast.success("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch uploaded videos from Supabase
  const [supabaseVideos, setSupabaseVideos] = useState([]);
  useEffect(() => {
    const fetchSupabaseVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("uploads") // Changed to lowercase
          .select("url, song_url, is_ai_video")
          .eq("is_ai_video", true);
        if (error) throw error;
        console.log("Supabase videos:", data);
        setSupabaseVideos(data);
      } catch (error) {
        console.error("Error fetching Supabase videos:", error);
        toast.error("Failed to fetch videos");
      }
    };
    fetchSupabaseVideos();
  }, [uploadedUrl]);

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
        Upload a Memory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full" {...getRootProps()}>
          <motion.div
            onClick={handleClick}
            whileHover="animate"
            className="p-6 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden bg-white dark:bg-neutral-900 shadow-md"
          >
            <input
              ref={fileInputRef}
              id="file-upload-handle"
              type="file"
              onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
              className="hidden"
              accept="image/*,video/*"
            />
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Upload a Pic or Video
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-sm mt-2">
                Drag & drop here or click to select
              </p>
              <div className="relative w-full mt-6 max-w-[8rem] mx-auto">
                {!files.length && (
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 w-full rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  >
                    {isDragActive ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-600 flex flex-col items-center"
                      >
                        Drop it
                        <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                      </motion.p>
                    ) : (
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    )}
                  </motion.div>
                )}
                {!files.length && (
                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-full rounded-md"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Preview
              </h3>
              {files[0].type.includes("video") ? (
                <video
                  src={URL.createObjectURL(files[0])}
                  controls
                  className="w-full h-64 rounded-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <img
                  src={URL.createObjectURL(files[0])}
                  alt={files[0].name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                <p>{files[0].name}</p>
                <p>{(files[0].size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              {uploadedUrl && (
                <div className="mt-4">
                  <p>Uploaded File:</p>
                  {uploadedUrl.includes("video") ? (
                    <video
                      src={uploadedUrl}
                      controls
                      className="w-full h-64 rounded-lg"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <img
                      src={uploadedUrl}
                      alt="Uploaded"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="relative right-[32.5vw] top-[-167px]">
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                Journal
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Write your memory..."
                className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
            </div>

            <div className="relative top-[-160px]">
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                Select Song
              </label>
              <Listbox value={songSource} onChange={handleSongSourceChange}>
                <div className="relative">
                  <Listbox.Button className="w-full p-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-left flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                    <span>{songSource}</span>
                    <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
                  </Listbox.Button>
                  <Transition
                    as={React.Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10">
                      {songOptions.map((option) => (
                        <Listbox.Option
                          key={option}
                          value={option}
                          className={({ active }) =>
                            `p-3 cursor-pointer text-neutral-700 dark:text-neutral-300 ${
                              active ? "bg-purple-100 dark:bg-purple-900" : ""
                            }`
                          }
                        >
                          {option}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              {songSource === "Local Storage" && (
                <div className="mt-2">
                  <input
                    ref={songInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleSongFileChange}
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              )}
              {songUrl && (
                <div className="mt-4">
                  <p>Preview Song:</p>
                  <audio src={songUrl} controls className="w-full mt-2" crossOrigin="anonymous" />
                </div>
              )}
            </div>

            <div className="flex space-x-11 relative right-[-71px]">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              >
                Discard
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
              <Link
                to="/ai-video-edit"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-md text-center"
              >
                Create AI Video
              </Link>
            </div>
          </div>
        )}
      </div>

      {supabaseVideos.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow-md">
          <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-4">
            Previously Uploaded AI Videos (Supabase)
          </h3>
          {supabaseVideos.map((video, index) => (
            <div key={index} className="mt-2">
              <p>Video {index + 1}:</p>
              <video
                src={video.url}
                controls
                className="w-full h-64 rounded-lg"
                crossOrigin="anonymous"
                onError={(e) => console.error(`Supabase video ${video.url} playback error:`, e)}
              />
              {video.song_url && (
                <div className="mt-2">
                  <p>Song:</p>
                  <audio src={video.song_url} controls className="w-full" crossOrigin="anonymous" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadFile;