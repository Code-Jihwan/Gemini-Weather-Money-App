import { GoogleGenAI, Modality } from "@google/genai";
import { WeatherData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 날씨 정보 가져오기 함수
export const fetchWeatherWithGemini = async (): Promise<WeatherData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Find the current weather report for Busan, South Korea (부산).
        Search for the current temperature, today's low/high temperature, and weather condition.
        Also, search for a specific URL of a trending or interesting news article on Naver News (news.naver.com).
        
        Based on the search results, generate a JSON object with the following fields:
        - location: (string) "Busan"
        - currentTemp: (number) Current temperature in Celsius.
        - lowTemp: (number) Today's low temperature.
        - highTemp: (number) Today's high temperature.
        - condition: (string) Short weather condition in English (e.g., Rain, Sunny, Cloudy, Snow).
        - comment: (string) A friendly, helpful one-line weather advice in Korean (e.g., '비가 오니 우산을 챙기세요').
        - imagePrompt: (string) A description of a character experiencing this weather. IMPORTANT: The weather must be the MOST DOMINANT visual feature. If rain, describe heavy rain pouring, wet surfaces, and splashes. If sunny, describe blinding sun rays and clear blue skies. If cloudy, describe dramatic thick clouds filling the sky. The character should be interacting with this intense weather.
        - newsLink: (string) The specific URL of the trending Naver News article found.
        
        Output ONLY the JSON string inside a code block.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse weather JSON from model output");
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsedData = JSON.parse(jsonStr);

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any) => s !== null) || [];

    return {
      ...parsedData,
      sources: sources
    } as WeatherData;

  } catch (error) {
    console.error("Error fetching real weather:", error);
    return {
      location: "Busan",
      currentTemp: 0,
      lowTemp: 0,
      highTemp: 0,
      condition: "Cloudy",
      comment: "날씨 정보를 불러올 수 없습니다.",
      imagePrompt: "A cute character standing in cloudy weather with grey sky background, heavy clouds",
      sources: []
    };
  }
};

// 이미지 생성 함수
export const generateWeatherImage = async (prompt: string): Promise<string | null> => {
  try {
    // Enforce the style strictly, emphasizing weather dominance
    const styleKeywords = "3D render, cute chibi character, Pixar style, high quality, soft studio lighting, intense weather atmosphere, immersive environment, particle effects, rain drops or sun rays visible, cinematic composition";
    const enhancedPrompt = `An image where the weather condition is the main focus. ${prompt}. ${styleKeywords}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      const base64ImageBytes = part.inlineData.data;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

// 가계부 소비 코멘트 생성 함수
export const getSpendingComment = async (totalAmount: number, categories: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a witty, slightly sarcastic, but helpful financial assistant.
        Analyze today's spending.
        Total Amount: ${totalAmount} KRW
        Categories: ${categories.join(', ')}

        Write a ONE-LINE comment in Korean about this spending.
        - If the amount is high (> 50,000 KRW), be sarcastic or warning (e.g., "Are you rich?", "Wallet is crying").
        - If the amount is low or zero, be encouraging.
        - If mostly food, mention diet or hunger.
        - Keep it under 30 characters.
        - Do NOT use markdown. Just the text.
      `,
    });
    return response.text || "지출 내역을 분석 중입니다...";
  } catch (error) {
    console.error("Error generating spending comment:", error);
    return "오늘도 합리적인 소비 하세요!";
  }
};
