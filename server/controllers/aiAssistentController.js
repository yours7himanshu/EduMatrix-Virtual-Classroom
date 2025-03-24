/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


const {GoogleGenerativeAI} = require('@google/generative-ai')
const aiAssistent = async (req, res) => {
    const { input } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GIMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        // Input validation
        if (!input || typeof input !== 'string' || input.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid input is required"
            });
        }

        const prompt = input;
        const result = await model.generateContent(prompt);
        const output = result.response.text();
          
        

        return res.status(200).json({
            success:true,
            output
        })
    } catch (error) {
        console.error('Error in AI assistant:', error.message); // Log the error for debugging
        if (error.response) {
            // If we got a response from the server, we can use that status code
            res.status(error.response.status).json({
                success: false,
                message: `API Error: ${error.response.data.error || 'Unknown error'}`
            });
        } else {
            // If there was no response (e.g., network error), use a generic 500
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the response from AI'
            });
        }
    }
};

module.exports = aiAssistent;