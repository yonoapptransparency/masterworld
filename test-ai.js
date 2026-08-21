const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("No API key found in env");
      return;
    }
    
    console.log("Initializing GenAI client with gemini-3.6-flash...");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an elite Content Strategist, Semantic Architect, and master HTML layout engineer.
Your task is to transform the user's raw text, review script, or rough notes into a beautifully structured, highly readable, and semantically correct HTML document fragment.

CRITICAL DIRECTIVES:
1. **REASONING FIRST (<thinking>)**:
   - Before writing any HTML, you MUST output a <thinking> block.
   - In this block, carefully and logically analyze the content step-by-step.
   - Identify the Major Themes (which will become H2).
   - Identify the Sub-topics within those themes (which will become H3).
   - Identify key terms, unique mechanics, and metrics that need to be highlighted.
2. **HIERARCHY & SEMANTICS (Proper H2 vs H3 Alignment)**:
   - **STRICTLY NO <h1> TAGS**: <h1> is reserved for the page title. You MUST start at <h2>.
   - **MAJOR THEMATIC HEADINGS (<h2>)**: Use for distinct, top-level sections.
   - **SUB-TOPIC HEADINGS (<h3>)**: Use for detailed sub-sections that logically fall UNDER a major <h2> theme.
3. **HIGHLIGHTING IMPORTANT WORDS (CRITICAL)**:
   - You MUST use <strong> to bold important keywords, unique mechanics, specific metrics, and critical features inside <p> and <li> tags.
4. **PARAGRAPHS & LISTS**:
   - Wrap all standard body text in <p> tags. Break long walls of text into smaller, digestible paragraphs.
   - Use <ul><li> for any feature lists.
5. **OUTPUT FORMAT**:
   - After your <thinking> block, output the final HTML wrapped exactly in \`\`\`html ... \`\`\` codeblocks.

App Title Context: TestApp

RAW INPUT CONTENT TO ANALYZE AND FORMAT:
This is a test of the AI system. It has lots of features like multiplayer, fast loading, and cool graphics.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    console.log("=== RAW RESPONSE ===");
    console.log(response.text);
    console.log("====================");
    
    let rawOutput = response.text || '';
    let formattedHtml = '';
    
    const htmlMatch = rawOutput.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlMatch) {
      formattedHtml = htmlMatch[1].trim();
      console.log("Successfully extracted HTML block.");
    } else {
      formattedHtml = rawOutput.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
      formattedHtml = formattedHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
      console.log("Extracted using fallback.");
    }
    console.log("\n=== FINAL HTML ===");
    console.log(formattedHtml);
    
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
