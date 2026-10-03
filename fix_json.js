const fs = require('fs');
const file = 'src/app/itinerary-builder/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update OpenRouter acceptance logic
content = content.replace(
\              if (textResponse) {
                openRouterSuccess = true;
                break;
              }\,
\              if (textResponse) {
                if (!textResponse.includes('{') || !textResponse.includes('}')) {
                  lastErrorMessage = "Model returned non-JSON text: " + textResponse.substring(0, 30);
                  textResponse = ""; // Reject this response
                  continue; // Try next model
                }
                openRouterSuccess = true;
                break;
              }\
);

// 2. Update Gemini acceptance logic
// find gemini success
content = content.replace(
\            if (res.ok) {
              geminiResponse = res;
              break;
            }\,
\            if (res.ok) {
              // Read json immediately to check if it has valid text
              const tempJson = await res.json();
              const tempText = tempJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
              if (!tempText.includes('{') || !tempText.includes('}')) {
                lastErrorMessage = "Gemini returned non-JSON text: " + tempText.substring(0, 30);
                continue;
              }
              // It's good! Re-create response object for later, or just use tempText directly
              geminiResponse = new Response(JSON.stringify(tempJson), { status: 200 });
              break;
            }\
);

// 3. Fix the JSON parse error fallback
content = content.replace(
\      const jsonStartIndex = cleanJson.indexOf("{");
      const jsonEndIndex = cleanJson.lastIndexOf("}");
      
      if (jsonStartIndex >= 0 && jsonEndIndex >= jsonStartIndex) {
        cleanJson = cleanJson.substring(jsonStartIndex, jsonEndIndex + 1);
      }

      const parsed = JSON.parse(cleanJson);\,
\      const jsonStartIndex = cleanJson.indexOf("{");
      const jsonEndIndex = cleanJson.lastIndexOf("}");
      
      if (jsonStartIndex >= 0 && jsonEndIndex >= jsonStartIndex) {
        cleanJson = cleanJson.substring(jsonStartIndex, jsonEndIndex + 1);
      } else {
        throw new Error("AI did not return any JSON object. Output was: " + cleanJson.substring(0, 50));
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (err: any) {
        throw new Error("Failed to parse AI response as JSON: " + err.message + ". Output: " + cleanJson.substring(0, 30));
      }\
);

fs.writeFileSync(file, content);
