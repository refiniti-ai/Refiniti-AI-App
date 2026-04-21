import { GoogleGenAI } from "@google/genai";
import { ProposalContent, Task, MarketingStrategy } from "../types";

// In a real app, strict error handling for missing key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalContent = async (
  clientName: string,
  industry: string,
  services: string[],
  notes: string
): Promise<{ content: ProposalContent }> => {
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as VARIA, the elite operations AI for Refiniti.
    We are generating a structured JSON proposal for a client to be displayed in our dashboard.
    
    Client: ${clientName}
    Industry: ${industry}
    Requested Services: ${services.join(', ')}
    Sales Notes: ${notes}

    Generate a JSON object strictly following this structure (do not use markdown formatting for the JSON itself, just return the raw JSON):

    {
      "hero": {
        "title": "Proposal for ${clientName}",
        "subtitle": "An integrated plan for a unified digital ecosystem and high-performance growth."
      },
      "engine": {
        "generatedValue": (Estimate a realistic dollar value of the strategy e.g. 24680),
        "description": "This plan is designed to maximize conversion while maintaining strict capital separation. Our proprietary engine combines data-driven strategies with high-converting creative."
      },
      "phases": [
        {
          "title": "Phase 1: Website Infrastructure & Conversion Assets",
          "description": "Focus: Building high-authority digital real estate required to generate and convert high-quality leads.",
          "items": ["(List 3-4 specific deliverables based on services)"]
        },
        {
          "title": "Phase 2: Performance Lead Generation",
          "description": "Focus: Rebuilding the lead engine with a 'no-waste' ad spend strategy to drive measurable ROI.",
          "items": ["(List 3-4 specific deliverables)"]
        }
      ],
      "investment": [
        { "item": "Website Infrastructure & Assets", "costInitial": (number), "costMonthly": (number) },
        { "item": "Performance Lead Generation", "costInitial": (number), "costMonthly": (number) }
      ],
      "strategy": [
        { "title": "Platform Evaluation", "content": "Analysis of current stack efficiency." },
        { "title": "The VSL Factor", "content": "Video Sales Letter implementation strategy." },
        { "title": "Open/Shut Protocol", "content": "Lead qualification framework." }
      ],
      "adSpend": [
        { "phase": "Testing (Month 1-2)", "monthlySpend": "$500 - $1,500", "targetCPL": "$150", "expectedLeads": "6 - 10" },
        { "phase": "Optimization (Month 3)", "monthlySpend": "$2,400", "targetCPL": "$120", "expectedLeads": "20 - 25" },
        { "phase": "Stabilized State", "monthlySpend": "$3K - $4.5K", "targetCPL": "$80 - $100", "expectedLeads": "30 - 45" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      content: data
    };
  } catch (error) {
    console.error("AI Generation Error", error);
    // Fallback data structure in case of error
    return {
      content: {
        hero: { title: "Error", subtitle: "Could not generate proposal" },
        engine: { generatedValue: 0, description: "System Error" },
        phases: [],
        investment: [],
        strategy: [],
        adSpend: []
      }
    };
  }
};

export const generateMarketingStrategy = async (
  clientName: string,
  answers: any
): Promise<MarketingStrategy> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Act as VARIA, the Chief Strategy Officer.
    Create a detailed Marketing Strategy for ${clientName} based on the following intake questionnaire:
    ${JSON.stringify(answers)}
    
    Output strictly in this JSON format:
    {
        "executiveSummary": "High level overview of the approach",
        "targetAudience": "Detailed persona description",
        "brandVoice": "Tone and style guidelines",
        "roadmap": [
            { "phase": "Phase 1: Foundation", "timeline": "Weeks 1-4", "objectives": ["obj1", "obj2"] },
            { "phase": "Phase 2: Growth", "timeline": "Weeks 5-8", "objectives": ["obj1", "obj2"] }
        ],
        "channels": ["Channel 1", "Channel 2"],
        "kpis": ["KPI 1", "KPI 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
        executiveSummary: "Error generating strategy.",
        targetAudience: "N/A",
        brandVoice: "N/A",
        roadmap: [],
        channels: [],
        kpis: []
    };
  }
};

export const generateProjectTasks = async (strategyText: string, projectTitle: string): Promise<Partial<Task>[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Act as VARIA, the Operations Manager.
      Based on the following strategy for project "${projectTitle}", generate a list of 5-8 tactical tasks required to execute it.
      
      Strategy Context:
      ${strategyText.substring(0, 1000)}...

      For each task, provide a checklist of 2-3 sub-items.
      
      Output strictly JSON:
      [
        {
          "title": "Task Title",
          "description": "Brief description",
          "priority": "High" | "Medium" | "Low",
          "checklist": [{ "id": "1", "text": "Subtask 1", "completed": false }]
        }
      ]
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
}

export const generateInvoiceEmail = async (clientName: string, invoiceId: string, amount: number, dueDate: string) => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Write a professional yet friendly email to ${clientName} regarding Invoice ${invoiceId} for $${amount}, due on ${dueDate}.
      Tone: Professional, Efficient, Warm.
      Output JSON: { "subject": "...", "body": "..." }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { subject: `Invoice ${invoiceId}`, body: "Please find the invoice attached." };
    }
}

export const chatSupport = async (history: any[], newMessage: string) => {
    const model = "gemini-3-flash-preview";
    // Using generateContent for single turn or simple chat simulation given the context
    // In a real app, use chatSession
    const prompt = `
      You are Varia, the AI assistant for Refiniti's operations portal.
      Answer the user's question concisely and professionally.
      User: ${newMessage}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text || "I'm having trouble connecting right now.";
    } catch (e) {
        return "System offline. Please try again.";
    }
}