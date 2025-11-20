import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Newspaper, Mail, Music, Sparkles, Wallet } from 'lucide-react';
import WeatherDisplay from './components/WeatherDisplay';
import SpendingTracker from './components/SpendingTracker';
import { fetchWeatherWithGemini, generateWeatherImage } from './services/gemini';
import { LoadingState, WeatherData } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isShortcutsMode, setIsShortcutsMode] = useState(false);
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
  const toggleCenterMode = () => {
    setIsShortcutsMode(prev => !prev);
  };

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

        {/* 2. Hero Section (Clock / Shortcuts) */}
        <div className="flex justify-center mb-1 relative z-10">
          <div
            onClick={!isShortcutsMode ? toggleCenterMode : undefined}
            className={`w-64 h-64 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-500 ease-in-out hover:scale-[1.02] relative overflow-hidden ${!isShortcutsMode ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {/* Mode: Clock */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isShortcutsMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >

              <span className="text-7xl font-bold text-gray-950 tracking-tighter">
                {format(currentDate, 'hh:mm')}
              </span>
            </div>

            {/* Mode: Shortcuts */}
            <div className={`absolute inset-0 flex flex-wrap items-center justify-center content-center gap-x-1.5 gap-y-2 px-3 transition-all duration-500 transform ${isShortcutsMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-45 pointer-events-none'}`}>

              {/* Shortcut 0: Spending Tracker */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSpendingOpen(true);
                }}
                className="flex flex-col items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors w-[56px]"
              >
                <div className="bg-gray-50 p-2 rounded-2xl mb-1 shadow-sm">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium">가계부</span>
              </button>



              {/* Shortcut 1: News */}
              <a href={"https://news.naver.com"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors w-[56px]">
                <div className="bg-gray-50 p-2 rounded-2xl mb-1 shadow-sm">
                  <Newspaper className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium">뉴스</span>
              </a>

              {/* Shortcut 2: Mail */}
              <a href="https://mail.naver.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-gray-600 hover:text-green-600 transition-colors w-[56px]">
                <div className="bg-gray-50 p-2 rounded-2xl mb-1 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium">메일</span>
              </a>

              {/* Shortcut 3: AI */}
              <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 transition-colors w-[56px]">
                <div className="bg-gray-50 p-2 rounded-2xl mb-1 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium">Gemini</span>
              </a>

              {/* Shortcut 4: Music */}
              <a href="https://music.youtube.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-gray-600 hover:text-red-600 transition-colors w-[56px]">
                <div className="bg-gray-50 p-2 rounded-2xl mb-1 shadow-sm">
                  <Music className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium">음악</span>
              </a>

              {/* Shortcut 5: Spending Tracker */}


            </div>

            {/* Toggle Back Button when in shortcut mode */}
            {isShortcutsMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCenterMode();
                }}
                className="absolute bottom-4 text-[10px] text-gray-400 hover:text-gray-600 font-medium px-4 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100"
              >
                닫기
              </button>
            )}
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