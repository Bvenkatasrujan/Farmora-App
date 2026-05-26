const API_KEY = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY || '';
const API_URL = "https://plant.id/api/v3/health_assessment";

export const diseaseService = {
  detectDisease: async (imageUri: string, base64Data?: string | null) => {
    try {
      let imageRepresentation = imageUri;

      // If we have local base64 data, use it (and make sure it has the proper Data URL prefix)
      if (base64Data) {
        imageRepresentation = base64Data.startsWith('data:') 
          ? base64Data 
          : `data:image/jpeg;base64,${base64Data}`;
      }

      const payload = {
        images: [imageRepresentation],
        latitude: 49.207, // Optional
        longitude: 16.608,
        similar_images: true
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Disease Detection Error:", error);
      throw error;
    }
  },

  getDiseaseDetails: async (diseaseName: string, cropName: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a professional plant pathologist. Given a crop and a disease name, output a JSON object containing details about the symptoms, treatment, prevention, organic remedy, chemical solution, and growth tips. Your output must contain ONLY the valid JSON object, without markdown formatting or introductory text. Use this exact JSON structure:\n{\n  "symptoms": "short description of symptoms (1-2 sentences)",\n  "treatment": "short description of treatment (1-2 sentences)",\n  "prevention": "short description of prevention (1-2 sentences)",\n  "organicRemedy": "detailed organic remedy (1-2 sentences)",\n  "chemicalSolution": "detailed chemical solution (1-2 sentences)",\n  "growthTips": "helpful agricultural tips for this crop (1-2 sentences)"\n}'
            },
            {
              role: 'user',
              content: `Crop: ${cropName || 'unknown crop'}, Disease: ${diseaseName}`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Error getting disease details from Groq:", error);
      // Fallback details if Groq fails
      return {
        symptoms: `Signs of ${diseaseName} affecting ${cropName || 'the crop'} plant tissues.`,
        treatment: "Prune affected leaves/branches and apply appropriate disease-control spray.",
        prevention: "Practice proper hygiene, crop rotation, and spacing to avoid humidity build-up.",
        organicRemedy: "Apply organic neem oil solution or horticultural soap on target surfaces.",
        chemicalSolution: "Apply recommended copper or sulfur-based commercial fungicide.",
        growthTips: "Keep irrigation regular and avoid watering the leaves directly to prevent mold spores."
      };
    }
  }
};
