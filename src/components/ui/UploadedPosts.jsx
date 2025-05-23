import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { supabase } from "../../components/supabase/supabase";
import { useParams } from "react-router-dom";

const UploadedPosts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from("uploads").select("*").order("created_at", { ascending: false });

      if (id) {
        query = query.eq("id", id).single();
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch error:", error);
        setError(error.message);
        toast.error(`Failed to fetch post: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log("Supabase fetch data:", data);

      const uploadsWithLiked = Array.isArray(data)
        ? data.map((item) => ({ ...item, liked: false }))
        : [{ ...data, liked: false }];

      setItems(uploadsWithLiked);

      if (id && uploadsWithLiked.length > 0) {
        setSelectedItem(uploadsWithLiked[0]);
        setIsModalOpen(true);
      }

      setLoading(false);
    };

    fetchUploads();
  }, [id]);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleLike = (itemId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
    setSelectedItem((prev) =>
      prev && prev.id === itemId ? { ...prev, liked: !prev.liked } : prev
    );
  };

  const handleShare = (itemId) => {
    const shareUrl = `http://localhost:5173/post/${itemId}`;
    console.log("Share URL:", shareUrl);

    if (navigator.share) {
      navigator.share({
        title: "Check out this post!",
        url: shareUrl,
      })
        .then(() => {
          toast.success("Shared successfully!", {
            style: { background: "#333", color: "#fff" },
          });
        })
        .catch((err) => {
          console.error("Web Share API error:", err);
          navigator.clipboard.writeText(shareUrl)
            .then(() => {
              toast.success("Link copied to clipboard!", {
                style: { background: "#333", color: "#fff" },
              });
              console.log("Copied to clipboard:", shareUrl);
            })
            .catch((err) => {
              console.error("Clipboard copy error:", err);
              toast.error("Failed to copy link!", {
                style: { background: "#333", color: "#fff" },
              });
            });
        });
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("Link copied to clipboard!", {
            style: { background: "#333", color: "#fff" },
          });
          console.log("Copied to clipboard:", shareUrl);
        })
        .catch((err) => {
          console.error("Clipboard copy error:", err);
          toast.error("Failed to copy link!", {
            style: { background: "#333", color: "#fff" },
          });
        });
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  if (!items.length && !id) {
    return <div className="text-center mt-10">No uploads yet.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl shadow-xl">
      {!id && (
        <>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
            Recently Uploaded
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => openModal(item)}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {item.url.includes("video") ? (
                  <video
                    src={item.url}
                    className="w-full h-40 object-cover"
                    muted
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt="Uploaded"
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 bg-white dark:bg-neutral-900">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {item.is_ai_video ? "AI Video" : "Photo/Video"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedItem ? (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-neutral-800 dark:text-neutral-200 mb-4"
                      >
                        {selectedItem.is_ai_video ? "AI-Generated Video" : "Memory"}
                      </Dialog.Title>

                      <div className="mb-4">
                        {selectedItem.url.includes("video") ? (
                          <video
                            src={selectedItem.url}
                            controls
                            className="w-full h-96 object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={selectedItem.url}
                            alt="Uploaded"
                            className="w-full h-96 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Journal
                        </h4>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {selectedItem.journal || "No journal entry."}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Song
                        </h4>
                        {selectedItem.song_url ? (
                          <>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                              Source: {selectedItem.song_source}
                            </p>
                            <audio
                              src={selectedItem.song_url}
                              controls
                              className="w-full mt-2"
                            />
                          </>
                        ) : (
                          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            No song selected.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(selectedItem.id)}
                          className="flex items-center space-x-1 text-neutral-700 dark:text-neutral-300 transition-transform transform hover:scale-110"
                        >
                          {selectedItem.liked ? (
                            <HeartIconSolid className="h-5 w-5 fill-red-500 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-transparent stroke-white stroke-2" />
                          )}
                          <span>Like</span>
                        </button>
                        <button
                          onClick={() => handleShare(selectedItem.id)}
                          className="flex items-center space-x-1 text-neutral-700 dark:text-neutral-300 hover:text-blue-500 transition"
                        >
                          <ShareIcon className="h-5 w-5" />
                          <span>Share</span>
                        </button>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-neutral-700 dark:text-neutral-300">Loading...</p>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UploadedPosts;