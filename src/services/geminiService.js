import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Make sure to set VITE_GEMINI_API_KEY in your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeMealsWithGemini = async (mealsData) => {
  if (!API_KEY) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Create a strict JSON schema for the output
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      protein: {
        type: SchemaType.NUMBER,
        description: "Total estimated protein in grams across all meals.",
      },
      fats: {
        type: SchemaType.NUMBER,
        description: "Total estimated fats in grams across all meals.",
      },
      carbohydrates: {
        type: SchemaType.NUMBER,
        description: "Total estimated carbohydrates in grams across all meals.",
      },
      sugars: {
        type: SchemaType.NUMBER,
        description: "Total estimated sugars in grams across all meals.",
      },
      calories: {
        type: SchemaType.NUMBER,
        description: "Total estimated calories in kcal across all meals.",
      }
    },
    required: ["protein", "fats", "carbohydrates", "sugars", "calories"]
  };

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  const prompt = `
    Analyze the following meals logged for the day and estimate the total macro nutrients and calories.
    If a food is ambiguous or portion sizes aren't specified, use reasonable standard estimations.
    Return ONLY a JSON object matching the requested schema with numerical values.
    
    Meals:
    Breakfast: ${mealsData.breakfast || 'None'}
    Lunch: ${mealsData.lunch || 'None'}
    Snack: ${mealsData.snack || 'None'}
    Dinner: ${mealsData.dinner || 'None'}
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const generateDailyQuoteWithGemini = async () => {
  if (!API_KEY) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    Generate a short, powerful, and inspiring quote for the day.
    It should be unique, motivational, and focus on productivity, self-improvement, or mindfulness.
    Do not include any intro text, labels, or quotation marks around the quote.
    Just return the plain text of the quote itself.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error calling Gemini API for quote:', error);
    throw error;
  }
};

export const generateWeeklyInsightsWithGemini = async (metrics, tasksSummary, daily_data) => {
  if (!API_KEY) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      suggestions: {
        type: SchemaType.ARRAY,
        description: "Exactly 5 actionable, personalized tips or suggestions for the next week based on the data.",
        items: { type: SchemaType.STRING }
      },
      positives: {
        type: SchemaType.ARRAY,
        description: "2-3 positive affirmations or things the user did great this week based on the data.",
        items: { type: SchemaType.STRING }
      },
      negatives: {
        type: SchemaType.ARRAY,
        description: "2-3 areas to focus on or improve next week based on the data.",
        items: { type: SchemaType.STRING }
      },
      correlations: {
        type: SchemaType.ARRAY,
        description: "1-2 insightful correlations found between daily custom_metrics and mood/energy/productivity.",
        items: { type: SchemaType.STRING }
      }
    },
    required: ["suggestions", "positives", "negatives", "correlations"]
  };

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  const prompt = `
    Analyze the user's weekly performance metrics and a summary of their tasks.
    Provide exactly 5 actionable suggestions for next week, 2-3 positive affirmations, and 2-3 areas to improve.
    Be encouraging, specific, and concise.

    Weekly Metrics:
    - Average Mood (out of 10): ${metrics.average_mood?.toFixed(1) || 'N/A'}
    - Average Energy (out of 10): ${metrics.average_energy?.toFixed(1) || 'N/A'}
    - Task Completion Rate: ${metrics.completion_rate?.toFixed(1) || '0'}%
    - Average Discipline (out of 10): ${metrics.average_discipline?.toFixed(1) || 'N/A'}
    - Average Sociability (out of 10): ${metrics.average_sociability?.toFixed(1) || 'N/A'}
    - Average Productivity (out of 10): ${metrics.average_productivity?.toFixed(1) || 'N/A'}
    - Average Protein (g): ${metrics.average_protein?.toFixed(1) || 'N/A'}
    - Average Calories (kcal): ${metrics.average_calories?.toFixed(1) || 'N/A'}
    - Average Water (L): ${metrics.average_water?.toFixed(1) || 'N/A'}
    - Average Daily Steps: ${metrics.average_steps ? Math.round(metrics.average_steps) : 'N/A'}

    Task Summary context:
    ${tasksSummary || 'No tasks logged this week.'}

    Daily Data Log (Look for correlations here, especially with custom_metrics!):
    ${daily_data ? JSON.stringify(daily_data, null, 2) : 'No daily data available.'}
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Error calling Gemini API for insights:', error);
    throw error;
  }
};

export const createCompanionChatSession = () => {
  if (!API_KEY) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      message: {
        type: SchemaType.STRING,
        description: "Your conversational response to the user. Be helpful, encouraging, and brief."
      },
      updateLog: {
        type: SchemaType.OBJECT,
        description: "Optional. Only include this if the user explicitly mentioned things to log for today (e.g., mood, meals, water, tasks).",
        properties: {
          mood: { type: SchemaType.NUMBER, description: "Mood score from 1-10" },
          energy: { type: SchemaType.NUMBER, description: "Energy score from 1-10" },
          water_glasses: { type: SchemaType.NUMBER, description: "Number of glasses of water to ADD to today's intake." },
          meals: { type: SchemaType.STRING, description: "Description of meals eaten." },
          new_tasks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "New tasks the user completed or wants to add." }
        }
      }
    },
    required: ["message"]
  };

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: "You are Jibble Companion, an AI assistant for a daily habit and mood tracking app called Jibble. Your job is to answer user questions about the app, provide encouragement, and extract logging data (like mood, energy, water intake, meals, tasks) from user input. Always respond with the required JSON schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  return model.startChat({
    history: []
  });
};
