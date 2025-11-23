import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Wallet, Sparkles } from 'lucide-react';
import WeatherDisplay from './components/WeatherDisplay';
import SpendingTracker from './components/SpendingTracker';
import { fetchWeatherWithGemini, generateWeatherImage } from './services/gemini';
import { LoadingState, WeatherData } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [isShortcutsMode, setIsShortcutsMode] = useState(false);
  const [isSpendingOpen, setIsSpendingOpen] = useState(false);

  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Clock Tick
  useEffect(() => {
    const updateToKST = () => {
      const now = new Date();
      const kstString = now.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
      setCurrentDate(new Date(kstString));
    };
    updateToKST();
    const timer = setInterval(updateToKST, 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather & Image Fetch Logic
  const loadWeather = useCallback(async () => {
    setWeatherStatus(LoadingState.LOADING);
    try {
      const data = await fetchWeatherWithGemini();
      setWeatherData(data);

      // Generate Image after getting weather data
      if (data.imagePrompt) {
        const imageUrl = await generateWeatherImage(data.imagePrompt);
        setGeneratedImageUrl(imageUrl);
      }

      setWeatherStatus(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setWeatherStatus(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const weatherInterval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [loadWeather]);

  // Toggle Interaction
  // const toggleCenterMode = () => {
  //   setIsShortcutsMode(prev => !prev);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#eef2f6] font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.05)] overflow-hidden relative min-h-[800px] flex flex-col py-10 px-6">

        {/* 1. Date Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {format(currentDate, 'd일', { locale: ko })}
            <span className="text-blue-600 ml-2">
              {format(currentDate, 'EEEE', { locale: ko })}
            </span>
          </h1>
        </div>

        {/* 2. Hero Section (Gemini / Clock / Spending Tracker Swipe) */}
        <div className="flex flex-col items-center mb-1 relative z-10">
          <div className="w-64 h-64 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden relative group">

            {/* Scroll Container */}
            <div
              ref={(el) => {
                if (el && !el.dataset.scrolled) {
                  // Use requestAnimationFrame to ensure layout is ready
                  requestAnimationFrame(() => {
                    el.scrollLeft = el.offsetWidth;
                    el.dataset.scrolled = "true";
                  });
                }
              }}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
            >

              {/* Slide 1: Gemini */}
              <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center bg-white">
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 transition-colors group/gemini"
                >
                  <div className="bg-gray-50 p-8 rounded-[3rem] mb-3 shadow-sm group-hover/gemini:scale-110 transition-transform duration-300">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <span className="text-lg font-bold">Gemini</span>
                </a>
              </div>

              {/* Slide 2: Clock */}
              <div className="w-full h-full flex-shrink-0 snap-center flex flex-col items-center justify-center bg-white relative">
                <span className="text-7xl font-bold text-gray-950 tracking-tighter select-none">
                  {format(currentDate, 'hh:mm')}
                </span>
              </div>

              {/* Slide 3: Spending Tracker */}
              <div className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center bg-white">
                <button
                  onClick={() => setIsSpendingOpen(true)}
                  className="flex flex-col items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors group/btn"
                >
                  <div className="bg-gray-50 p-8 rounded-[3rem] mb-3 shadow-sm group-hover/btn:scale-110 transition-transform duration-300">
                    <Wallet className="w-16 h-16" />
                  </div>
                  <span className="text-lg font-bold">가계부</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Weather Section */}
        <div className="flex-1 flex flex-col items-center justify-start pt-0">
          <WeatherDisplay
            data={weatherData}
            status={weatherStatus}
            generatedImageUrl={generatedImageUrl}
          />
        </div>

        {/* Spending Tracker Modal Overlay */}
        {isSpendingOpen && (
          <SpendingTracker onClose={() => setIsSpendingOpen(false)} />
        )}

      </div>
    </div>
  );
};

export default App;