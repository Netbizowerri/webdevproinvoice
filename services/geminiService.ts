
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API with named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async polishDescription(description: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a professional full stack developer, rewrite this invoice line item description to be more professional and clear: "${description}"`,
      });
      // Correctly access .text property
      return response.text?.trim() || description;
    } catch (error) {
      console.error("Gemini Error:", error);
      return description;
    }
  },

  async generateTerms(serviceType: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise, professional "Terms and Conditions" section for an invoice from a Full Stack Developer (Kelechi Nwachukwu) for ${serviceType}. 
        Use exactly these points but ensure they are professionally formatted:
        1. All payments shall be made in Nigerian Naira (₦).
        2. A first deposit has been recorded to initiate this invoice.
        3. The final balance is due immediately after the website demo is presented and prior to final deployment.
        4. Project delivery/deployment will commence only after the full balance has been cleared.`,
      });
      // Correctly access .text property
      return response.text?.trim() || "1. All payments shall be made in Nigerian Naira (₦).\n2. A first deposit has been recorded to initiate this invoice.\n3. The final balance is due immediately after the website demo is presented and prior to final deployment.\n4. Project delivery/deployment will commence only after the full balance has been cleared.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "1. All payments in Naira (₦).\n2. First deposit received.\n3. Balance due after demo.\n4. Deployment follows full payment.";
    }
  },

  async analyzeIncome(data: { month: string, amount: number }[]) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this monthly income data for a freelance developer and provide one concise insight or tip to improve revenue stability: ${JSON.stringify(data)}`,
      });
      // Correctly access .text property
      return response.text?.trim() || "Stay focused on regular client follow-ups.";
    } catch (error) {
      return "Keep track of your billing cycles for better cash flow.";
    }
  }
};
