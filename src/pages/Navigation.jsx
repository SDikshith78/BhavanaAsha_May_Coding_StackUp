import React, { useState, useEffect } from "react";
import { FloatingDock } from "../components/ui/NavTop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faHouse, faPlay } from "@fortawesome/free-solid-svg-icons";
import MoodMusic from "../components/ui/MoodMusic";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// Check if 12 hours have passed since last quote (IST)
const isQuoteExpired = (lastQuoteTime) => {
  if (!lastQuoteTime) return true;
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const lastTime = new Date(lastQuoteTime).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const hoursDiff = (new Date(now) - new Date(lastTime)) / (1000 * 60 * 60);
  console.log("Quote expiration check:", { now, lastTime, hoursDiff });
  return hoursDiff >= 12;
};

const QuoteIcon = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <img
      src={hovered ? "/assets/Navbar Icons/Quote2.png" : "/assets/Navbar Icons/Quote1.png"}
      alt="Quote of the day"
      className="max-w-14 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    />
  );
};

const Navigation = () => {
  const baseUrl = window.location.origin;
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    setQuoteError(null);
    console.log("Fetching quote...");

    const storedQuote = localStorage.getItem("currentQuote");
    const storedTime = localStorage.getItem("quoteTime");

    if (storedQuote && storedTime && !isQuoteExpired(storedTime)) {
      console.log("Using cached quote:", storedQuote);
      setQuote(JSON.parse(storedQuote));
      setIsLoading(false);
      return;
    }

    try {
      console.log("Requesting quote from https://corsproxy.io/?https://zenquotes.io/api/random");
      const response = await fetch("https://corsproxy.io/?https://zenquotes.io/api/random");
      console.log("Response status:", response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Quote data:", data);
      const selectedQuote = data[0];
      if (!selectedQuote || !selectedQuote.q) {
        throw new Error("Invalid quote data");
      }
      const newQuote = { text: selectedQuote.q, author: selectedQuote.a || "Unknown" };
      setQuote(newQuote);
      localStorage.setItem("currentQuote", JSON.stringify(newQuote));
      localStorage.setItem("quoteTime", new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      console.log("Quote saved:", newQuote);
    } catch (err) {
      console.error("Quote fetch error:", {
        message: err.message,
        stack: err.stack,
        url: "https://corsproxy.io/?https://zenquotes.io/api/random",
        time: new Date().toISOString(),
      });
      setQuoteError("Failed to load quote. Please try again later.");
      setQuote(null);
      localStorage.removeItem("currentQuote");
      localStorage.removeItem("quoteTime");
      console.log("Cleared localStorage due to error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const openQuoteModal = () => {
    setIsQuoteOpen(true);
    fetchQuote();
  };

  const closeQuoteModal = () => {
    setIsQuoteOpen(false);
  };

  const links = [
    {
      title: "Home",
      icon: <FontAwesomeIcon icon={faHouse} className="text-neutral-500 dark:text-neutral-300" style={{ fontSize: "1.4em" }} />,
      href: "/",
    },
    {
      title: "Photos",
      icon: <FontAwesomeIcon icon={faImage} className="text-neutral-500 dark:text-neutral-300" style={{ fontSize: "1.4em" }} />,
      href: `${baseUrl}/photos`,
    },
    {
      title: "Videos",
      icon: <FontAwesomeIcon icon={faPlay} className="text-neutral-500 dark:text-neutral-300" style={{ fontSize: "1.4em" }} />,
      href: `${baseUrl}/videos`,
    },
    {
      title: "AI Video Edit",
      icon: <img src="/assets/Navbar Icons/AI-Video-Edit.png" alt="AI Video Edit" className="invert max-w-8" />,
      href: `${baseUrl}/ai-video-edit`,
    },
    {
      title: "Quote of the day",
      icon: <QuoteIcon onClick={openQuoteModal} />,
      href: "#",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center h-[7rem] w-full bg-transparent absolute">
        <FloatingDock items={links} />
        <MoodMusic />
      </div>
      <div>{/* <SideNavBar /> */}</div>

      {/* Quote Modal */}
      <Transition appear show={isQuoteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeQuoteModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-neutral-800 dark:text-neutral-200 mb-4">
                    Quote of the Day
                  </Dialog.Title>
                  {isLoading ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">Loading quote...</p>
                  ) : quoteError ? (
                    <p className="text-sm text-red-500 mb-4">{quoteError}</p>
                  ) : quote ? (
                    <div className="mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 italic">"{quote.text}"</p>
                      {quote.author && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">— {quote.author}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">No quote available.</p>
                  )}
                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      onClick={closeQuoteModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navigation;