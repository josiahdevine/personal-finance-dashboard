import axios from 'axios';

const GEMINI_API_ENDPOINT = process.env.REACT_APP_GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

class AIService {
    static async generateResponse(prompt, context = {}) {
        try {
            const response = await axios.post(
                `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: this.buildPrompt(prompt, context)
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            
            throw new Error('Failed to generate AI response');
        }
    }

    static buildPrompt(userPrompt, context) {
        const { 
            netWorth,
            salary,
            location,
            accountTypes,
            loans,
            investments
        } = context;

        let systemContext = `You are a helpful financial advisor AI assistant. 
You have access to the following user information:
${netWorth ? `- Net Worth: ${netWorth}` : ''}
${salary ? `- Salary: ${salary}` : ''}
${location ? `- Location: ${location}` : ''}
${accountTypes ? `- Account Types: ${accountTypes.join(', ')}` : ''}
${loans ? `- Loans: ${JSON.stringify(loans)}` : ''}
${investments ? `- Investments: ${JSON.stringify(investments)}` : ''}

Please provide specific, actionable financial advice based on this information.
Keep responses concise and focused on the user's question.
Use concrete numbers and percentages when applicable.
Always consider the user's location and financial context when giving advice.

User Question: ${userPrompt}`;

        return systemContext;
    }

    static generateSuggestedQuestions(userData) {
        const questions = [];

        if (userData.salary) {
            questions.push(`How does my salary of ${userData.salary} compare to others in ${userData.location || 'my area'}?`);
            questions.push('What percentage of my salary should I be saving?');
        }

        if (userData.loans?.length > 0) {
            questions.push('Should I consider refinancing any of my loans?');
            questions.push('What is the optimal order for paying off my debts?');
        }

        if (userData.investments?.length > 0) {
            questions.push('Is my investment portfolio well-diversified?');
            questions.push('What is the tax efficiency of my current investment strategy?');
        }

        if (userData.netWorth) {
            questions.push('How does my net worth compare to others in my age group?');
            questions.push('What strategies can I use to grow my net worth faster?');
        }

        return questions.slice(0, 5); // Return top 5 most relevant questions
    }
}

export default AIService; 