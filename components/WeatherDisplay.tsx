import React from 'react';
import { WeatherData, LoadingState } from '../types';
import { Cloud, Sun, CloudRain, Snowflake, Loader2, ImageOff } from 'lucide-react';

interface WeatherDisplayProps {
  data: WeatherData | null;
  status: LoadingState;
  generatedImageUrl: string | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data, status, generatedImageUrl }) => {
  if (status === LoadingState.LOADING && !data) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-10">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        <p className="text-gray-400 text-xs tracking-wide">날씨 분석 중...</p>
      </div>
    );
  }

  if (!data) return null;

  const getWeatherIcon = (condition: string) => {
    const c = (condition || "").toLowerCase();
    if (c.includes('rain') || c.includes('shower')) return <CloudRain className="w-6 h-6 text-gray-800" />;
    if (c.includes('snow')) return <Snowflake className="w-6 h-6 text-gray-800" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-6 h-6 text-gray-800" />;
    return <Sun className="w-6 h-6 text-gray-800" />;
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in mt-4">
      
      {/* Temp Range - Increased font size and weight */}
      <div className="text-gray-600 text-base font-bold tracking-wide mb-1">
        Low: {data.lowTemp}° &nbsp; High: {data.highTemp}°
      </div>

      {/* Current Condition & Temp */}
      <div className="flex items-center space-x-2 mb-6">
        {getWeatherIcon(data.condition)}
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {data.currentTemp}°
        </span>
      </div>

      {/* Comment - Text Only (No Box Design) */}
      <div className="w-full max-w-[90%] text-center mb-8 px-4">
        <p className="text-gray-800 font-medium text-xl leading-relaxed break-keep">
          "{data.comment}"
        </p>
      </div>

      {/* Generated Image */}
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-50 to-gray-100 border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          {generatedImageUrl ? (
            <img 
              src={generatedImageUrl} 
              alt="AI Weather" 
              className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
            />
          ) : status === LoadingState.LOADING ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
               <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
               <ImageOff className="w-8 h-8 opacity-50 mb-2" />
               <span className="text-xs">이미지 생성 실패</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default WeatherDisplay;