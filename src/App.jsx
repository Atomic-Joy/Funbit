import React, { useState, useEffect, useCallback } from 'react';
import { Smile, Info, Github, Sun, Moon } from 'lucide-react';

// Utility: Exponential Backoff Fetcher for API stability.
const fetchWithBackoff = async (url, options = {}, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw an error if the response status is not OK (e.g., 404, 500)
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            // Wait for the calculated delay (1s, 2s, 4s, 8s, 16s...)
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
    throw new Error("Fetch failed after all retries.");
};

// Main App Component
const App = () => {
    const [joke, setJoke] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false); 

    // Function to define dynamic colors based on the theme
    const getColors = useCallback((darkMode) => {
        if (darkMode) {
            return {
                bgLight: '#0f172a',     // Slate 900 (Dark Navy Background)
                boxLight: '#334155',    // Slate 700 (Left Panel - Dark Blue-Gray)
                boxDark: '#22c55e',     // Emerald 500 (Right Panel - Vibrant Green Accent)
                textIntroH1: '#86efac', // Emerald 300 (Intro Heading)
                textIntroP: '#e2e8f0',  // Slate 200 (Intro Subtext)
                textJoke: '#ffffff',    // White
                iconBg: '#334155',      // Slate 700 (Icon Background)
                buttonTextColor: '#fde047', // Amber 300 (Button Text - Bright Yellow for contrast)
            };
        }
        return {
            bgLight: '#cffac7ff',     // Slate 50 (Off-White Background)
            boxLight: '#d9f99d',    // Lime 200 (Left Panel - Light Green)
            boxDark: '#65a30d',     // Lime 600 (Right Panel - Muted Green)
            textIntroH1: '#3f6212', // Lime 900 (Intro Heading - Dark Green)
            textIntroP: '#4d7c0f',  // Lime 800 (Intro Subtext)
            textJoke: '#ffffff',    // White
            iconBg: '#e2e8f0',      // Slate 200 (Icon Background - Light Gray)
            buttonTextColor: '#3f6212', // Lime 900 (Button Text - Dark Green)
        };
    }, []);

    const COLORS = getColors(isDarkMode); 

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // joke fetching logic, randomly selecting one of two APIs
    const fetchJoke = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setJoke(null); 
        
        let finalJoke = null;
        let finalError = null;
        const MAX_ATTEMPTS = 5; 
        
        // the joke source (0 = JokeAPI.dev, 1 = icanhazdadjoke.com)
        const jokeSourceIndex = Math.floor(Math.random() * 2);

        // From JokeAPI.dev
        if (jokeSourceIndex === 0) {
            const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single'; 
            let attempts = 0;

            while (attempts < MAX_ATTEMPTS) {
                attempts++;
                try {
                    const data = await fetchWithBackoff(JOKE_API_URL); 

                    if (data.error) {
                        throw new Error(data.message || 'API reported an internal error.');
                    }

                    if (data.type === 'single' && data.joke) {
                        finalJoke = data.joke;
                        break; 
                    } else {
                        if (attempts < MAX_ATTEMPTS) {
                            console.warn(`Malformed joke data received (Attempt ${attempts}/${MAX_ATTEMPTS}). Retrying...`);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            continue;
                        } else {
                            throw new Error('Failed to fetch a complete joke after multiple retries.');
                        }
                    }

                } catch (e) {
                    console.error(`Attempt failed permanently (JokeAPI):`, e.message);
                    finalError = 'Failed to load a joke from JokeAPI.';
                    break;
                }
            }
        }
        
        // From icanhazdadjoke.com
        else {
            try {
                const DAD_JOKE_URL = 'https://icanhazdadjoke.com/';
                const options = { headers: { 'Accept': 'application/json' } }; 
                
                const data = await fetchWithBackoff(DAD_JOKE_URL, options);

                if (data.joke) {
                    finalJoke = data.joke;
                } else {
                    throw new Error("Dad Joke API returned an invalid response structure.");
                }

            } catch(e) {
                console.error("Failed to fetch Dad Joke:", e.message);
                finalError = 'Failed to load a joke from Dad Joke API.';
            }
        }

        // Update State
        setJoke(finalJoke);
        if (finalError) {
            setError(finalError);
        }
        setIsLoading(false);

    }, []);

    // Fetch a joke when the component mounts
    useEffect(() => {
        fetchJoke();
    }, [fetchJoke]);

    // Render the content based on state
    const renderJokeContent = () => {
        const textColor = COLORS.textJoke;

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-8">
                    {/* Spin Loader */}
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 mb-3" style={{ borderColor: textColor }}></div>
                    <p className="font-semibold text-lg" style={{ color: textColor }}>Loading the laughs...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 text-center">
                    <p className="text-xl font-bold mb-4" style={{ color: textColor }}>API Error:</p>
                    <p className="whitespace-pre-wrap" style={{ color: textColor, opacity: 0.8 }}>{error}</p>
                </div>
            );
        }

        if (joke) {
            return (
                <p className="text-xl md:text-2xl font-medium whitespace-pre-wrap leading-relaxed" style={{ color: textColor }}>
                    {joke}
                </p>
            );
        }

        return (
            <div className="p-6 text-center">
                <Smile className="w-10 h-10 mx-auto mb-4" style={{ color: textColor }} />
                <p className="text-xl md:text-2xl font-semibold" style={{ color: textColor }}>
                    Click "Surprise me !!" to fetch your first joke!
                </p>
            </div>
        );
    };
    
    const iconLinks = [
        { Icon: Info, title: "Powered by Multiple APIs", href: "https://v2.jokeapi.dev/" },
        { Icon: Github, title: "View Project Source", href: "https://github.com/Atomic-Joy" },
        { 
            Icon: isDarkMode ? Sun : Moon, 
            title: isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode", 
            onClick: toggleDarkMode,
            isToggle: true,
        }
    ];

    return (
        <div style={{ backgroundColor: COLORS.bgLight }} className="min-h-screen p-4 md:p-12 font-sans flex items-center justify-center transition-colors duration-500">
            <div className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row h-full">

                    {/* Left Section */}
                    <div
                        style={{ backgroundColor: COLORS.boxLight }}
                        className="p-8 md:p-16 w-full md:w-2/5 flex flex-col items-center justify-center text-center relative flex-none transition-colors duration-500"
                    >
                        <div className="relative z-10 p-4">
                            <h1 
                                className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
                                style={{ color: COLORS.textIntroH1 }}
                            >
                                Your daily dose of laughter —
                            </h1>
                            <p 
                                className="mt-4 text-xl md:text-2xl font-light"
                                style={{ color: COLORS.textIntroP }}
                            >
                                because life's too short to be serious.
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div
                        style={{ backgroundColor: COLORS.boxDark }}
                        className="p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-between relative flex-none transition-colors duration-500"
                    >
                        {/* Icons */}
                        <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-3">
                            {iconLinks.map((item, index) => {
                                const Element = item.isToggle ? 'button' : 'a';
                                return (
                                    <Element
                                        key={index}
                                        href={item.href || '#'}
                                        onClick={item.onClick}
                                        target={item.href ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-opacity-50"
                                        style={{ backgroundColor: COLORS.iconBg, color: COLORS.boxDark, borderColor: COLORS.boxDark, ringColor: COLORS.iconBg }}
                                        title={item.title}
                                    >
                                        <item.Icon className="w-5 h-5" />
                                    </Element>
                                )
                            })}
                        </div>

                        {/* Joke Content Area */}
                        <div className="flex-grow flex items-center justify-center text-center mt-12 mb-10">
                            {renderJokeContent()}
                        </div>

                        {/* Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={fetchJoke}
                                disabled={isLoading}
                                className="px-8 py-3 text-2xl font-extrabold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70"
                                style={{ 
                                    backgroundColor: COLORS.iconBg, 
                                    color: COLORS.buttonTextColor,
                                    borderColor: COLORS.buttonTextColor,
                                }}
                            >
                                Surprise me !!
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default App;
