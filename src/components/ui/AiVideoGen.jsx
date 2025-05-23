// E:\bhavana-asha\src\pages\AiVideoGen.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import toast from "react-hot-toast";
import { supabase } from "../supabase/supabase";

const AiVideoGen = () => {
  const [aiFiles, setAiFiles] = useState([]); // Uploaded images
  const [aiSongSource, setAiSongSource] = useState("Local Storage"); // Song source
  const [aiSongUrl, setAiSongUrl] = useState(""); // Song URL
  const [aiSongFile, setAiSongFile] = useState(null); // Song file
  const [caption, setCaption] = useState(""); // Caption for upload
  const [loading, setLoading] = useState(false); // Loading state
  const [aiGeneratedVideo, setAiGeneratedVideo] = useState(null); // Generated video URL
  const [aiVideoUrl, setAiVideoUrl] = useState(""); // Uploaded video URL

  const songOptions = ["Local Storage", "AI-Generated", "Internet"];
  const transitions = ["fade", "wipeLeft", "wipeRight"];
  const getRandomTransition = () => transitions[Math.floor(Math.random() * transitions.length)];

  // Shotstack API key
  const SHOTSTACK_API_KEY = import.meta.env.VITE_SHOTSTACK_API_KEY;

  // Get audio duration
  const getAudioDuration = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
      audio.addEventListener("error", (e) => {
        reject(new Error("Failed to load audio metadata: " + e.message));
      });
    });
  };

  // Debug state changes
  useEffect(() => {
    // console.log("aiGeneratedVideo updated:", aiGeneratedVideo);
    // console.log("aiVideoUrl (Cloudinary) updated:", aiVideoUrl);
  }, [aiGeneratedVideo, aiVideoUrl]);

  // Handle image uploads
  const onDropAiFiles = useCallback((acceptedFiles) => {
    setAiFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAiFiles,
    accept: "image/*",
    multiple: true,
  });

  // Upload song to Cloudinary
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
    // console.log("Uploaded song to Cloudinary:", response.data.secure_url);
    return response.data.secure_url;
  };

  // Handle song file change
  const handleAiSongFileChange = async (e) => {
    const file = e.target.files[0];
    setAiSongFile(file);
    if (file) {
      const songPreviewUrl = await uploadSongToCloudinary(file);
      setAiSongUrl(songPreviewUrl);
    }
  };

  // Get song URL
  const getAiSongUrl = async (source, file) => {
    if (source === "Local Storage") {
      if (!file) {
        toast.error("Please select a song file!");
        return "https://res.cloudinary.com/sdikshith/video/upload/v1747809866/WhatsApp_Audio_2023-02-13_at_16.55.01_szyevj.mp3";
      }
      return await uploadSongToCloudinary(file);
    } else if (source === "AI-Generated") {
      const url = "https://res.cloudinary.com/sdikshith/video/upload/v1747809866/WhatsApp_Audio_2023-02-13_at_16.55.01_szyevj.mp3";
      setAiSongUrl(url);
      return url;
    } else if (source === "Internet") {
      const url = "https://res.cloudinary.com/sdikshith/video/upload/v1747809866/WhatsApp_Audio_2023-02-13_at_16.55.01_szyevj.mp3";
      setAiSongUrl(url);
      return url;
    }
    return null;
  };

  // Handle song source change
  const handleAiSongSourceChange = async (source) => {
    setAiSongSource(source);
    if (source !== "Local Storage") {
      setAiSongFile(null);
      const songPreviewUrl = await getAiSongUrl(source, null);
      setAiSongUrl(songPreviewUrl);
    } else {
      setAiSongUrl("");
    }
  };

  // Upload images to Cloudinary
  const uploadImagesToCloudinary = async (files) => {
    const imageUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "bhavanaasha_files");
      formData.append("cloud_name", "sdikshith");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/sdikshith/image/upload",
        formData
      );
      console.log("Uploaded image to Cloudinary:", response.data.secure_url);
      imageUrls.push(response.data.secure_url);
    }
    return imageUrls;
  };

  // Generate AI video
  const handleGenerateAiVideo = async () => {
    if (aiFiles.length === 0) {
      return toast.error("Please upload at least one image!");
    }

    setLoading(true);

    try {
      // Upload images to Cloudinary
      const imageUrls = await uploadImagesToCloudinary(aiFiles);
      // console.log("Image URLs for Shotstack:", imageUrls);
      if (!imageUrls.length) {
        throw new Error("No valid image URLs generated");
      }

      // Get song URL
      const validatedSongUrl = await getAiSongUrl(aiSongSource, aiSongFile);
      // console.log("Validated song URL:", validatedSongUrl);

      // Get song duration
      let songDuration;
      try {
        songDuration = await getAudioDuration(validatedSongUrl);
        // console.log("Song duration (seconds):", songDuration);
      } catch (error) {
        // console.warn("Failed to get song duration, using default:", error);
        songDuration = imageUrls.length * 7; // Fallback to 7s per image
        toast.warn("Couldn’t load song duration. Using default length.");
      }

      // Calculate clip length
      const clipLength = songDuration / imageUrls.length;
      // console.log("Clip length per image (seconds):", clipLength);

      // Create Shotstack timeline
      const timeline = {
        tracks: [
          {
            clips: imageUrls.map((url, index) => ({
              asset: { type: "image", src: url },
              start: index * clipLength,
              length: clipLength,
              transition: {
                in: getRandomTransition(),
                out: getRandomTransition(),
              },
            })),
          },
        ],
        soundtrack: validatedSongUrl
          ? {
              src: validatedSongUrl,
              effect: "fadeOut",
            }
          : undefined,
      };

      // Define output
      const output = {
        format: "mp4",
        resolution: "sd",
      };

      // Create edit specification
      const edit = {
        timeline,
        output,
      };

      // Validate payload
      if (!timeline.tracks[0].clips.length) {
        throw new Error("No clips in timeline");
      }

      // Send request to Shotstack
      // console.log("Sending Shotstack render request:", JSON.stringify(edit, null, 2));
      const response = await axios.post(
        "https://api.shotstack.io/v1/render",
        edit,
        {
          headers: {
            "x-api-key": SHOTSTACK_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Shotstack render response:", response.data);

      // Poll for render status
      let status = "queued";
      let videoUrl = null;
      const renderId = response.data.response.id;
      console.log("Polling for render ID:", renderId);

      while (status !== "done") {
        const renderStatus = await axios.get(
          `https://api.shotstack.io/v1/render/${renderId}`,
          {
            headers: {
              "x-api-key": SHOTSTACK_API_KEY,
            },
          }
        );
        status = renderStatus.data.response.status;
        console.log("Render status:", status);

        if (status === "done") {
          videoUrl = renderStatus.data.response.url;
          // console.log("Generated video URL:", videoUrl);
          break;
        } else if (status === "failed") {
          throw new Error("Video rendering failed");
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // console.log("Setting aiGeneratedVideo to:", videoUrl);
      setAiGeneratedVideo(videoUrl);
      toast.success("AI video generated successfully!");
    } catch (error) {
      // console.error("Error generating AI video:", error);
      console.error("Shotstack error details:", error.response?.data);
      toast.error("Failed to generate AI video. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Upload video to Cloudinary and Supabase (uploads table)
  const handleUploadAiVideo = async () => {
    if (!aiGeneratedVideo) return toast.error("No AI video to upload!");

    setLoading(true);

    try {
      // Upload video to Cloudinary
      const formData = new FormData();
      const response = await fetch(aiGeneratedVideo);
      const blob = await response.blob();
      formData.append("file", blob, "ai-video.mp4");
      formData.append("upload_preset", "bhavanaasha_files");
      formData.append("cloud_name", "sdikshith");

      const uploadResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/sdikshith/video/upload",
        formData
      );
      const url = uploadResponse.data.secure_url;
      // console.log("Uploaded AI video to Cloudinary:", url);
      setAiVideoUrl(url);

      const songUrlToSave = aiSongUrl || (await getAiSongUrl(aiSongSource, aiSongFile));

      // Insert into uploads table
      const { error: uploadsError } = await supabase.from("uploads").insert([
        {
          url,
          journal: caption || "My AI-generated video!",
          song_source: aiSongSource,
          song_url: songUrlToSave,
          is_ai_video: true,
        },
      ]);
      if (uploadsError) {
        // console.error("Supabase upload error:", uploadsError);
        throw uploadsError;
      }

      // console.log("Successfully inserted into uploads table:", { url, journal: caption });
      toast.success("AI video uploaded successfully!");
      setCaption("");
    } catch (error) {
      // console.error("AI video upload error:", error);
      toast.error("AI video upload failed. Please try again.");
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
          .from("uploads")
          .select("url, song_url, is_ai_video, journal")
          .eq("is_ai_video", true);
        if (error) throw error;
        // console.log("Supabase videos:", data);
        setSupabaseVideos(data);
      } catch (error) {
        // console.error("Error fetching Supabase videos:", error);
      }
    };
    fetchSupabaseVideos();
  }, [aiVideoUrl]);

  return (
    <div className="mt-24 max-w-5xl mx-auto my-10 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6 mt-5">
        AI Video Edit
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-purple-500">Drop the pics here...</p>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              Drag & drop pics for AI video, or click to select
            </p>
          )}
        </div>

        {aiFiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Selected Pics
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {aiFiles.map((aiFile, index) => (
                <img
                  key={index}
                  src={aiFile.preview}
                  alt={`AI Pic ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                Select Song for AI Video
              </label>
              <Listbox value={aiSongSource} onChange={handleAiSongSourceChange}>
                <div className="relative">
                  <Listbox.Button className="w-full p-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-left cursor-pointer">
                    <span className="block truncate">{aiSongSource}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    </span>
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
                          {({ selected }) => (
                            <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{option}</span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              {aiSongSource === "Local Storage" && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAiSongFileChange}
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              )}
              {aiSongUrl && (
                <div className="mt-4">
                  <p>Preview Song:</p>
                  <audio src={aiSongUrl} controls className="w-full mt-2" crossOrigin="anonymous" />
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateAiVideo}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-md disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate AI Video"}
            </button>

            {aiGeneratedVideo && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Generated AI Video
                </h4>
                <video
                  src={aiGeneratedVideo}
                  controls
                  className="w-full h-64 rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => console.error("Video playback error:", e)}
                />
                <div className="mt-2">
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                    Caption for Upload
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter a caption for your video"
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <button
                  onClick={handleUploadAiVideo}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload AI Video"}
                </button>
                {aiVideoUrl && (
                  <div className="mt-4">
                    <p>Uploaded AI Video:</p>
                    <video
                      src={aiVideoUrl}
                      controls
                      className="w-full h-64 rounded-lg"
                      crossOrigin="anonymous"
                      onError={(e) => console.error("Cloudinary video playback error:", e)}
                    />
                  </div>
                )}
                {aiSongUrl && (
                  <div className="mt-4">
                    <p>Selected Song for AI Video:</p>
                    <audio src={aiSongUrl} controls className="w-full mt-2" crossOrigin="anonymous" />
                  </div>
                )}
              </div>
            )}

            {supabaseVideos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Previously Uploaded AI Videos (Supabase)
                </h4>
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
                    {video.journal && (
                      <p className="mt-2 text-neutral-600 dark:text-neutral-400">{video.journal}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiVideoGen;