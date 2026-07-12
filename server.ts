import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini API client (fallback)
const defaultAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "fallback-dummy-key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function getAiClient(req: express.Request): GoogleGenAI {
  const customKeyRaw = req.headers["x-gemini-api-key"];
  let customKey = "";
  if (Array.isArray(customKeyRaw)) {
    customKey = customKeyRaw[0] || "";
  } else if (typeof customKeyRaw === "string") {
    customKey = customKeyRaw;
  }

  // Normalize, trim, and filter out stringified falsy headers like "undefined" or "null"
  if (customKey) {
    customKey = customKey.trim();
    if (customKey === "undefined" || customKey === "null" || customKey === "placeholder" || customKey === "") {
      customKey = "";
    }
  }

  const systemKey = process.env.GEMINI_API_KEY;
  const activeKey = customKey || systemKey;

  if (!activeKey || activeKey === "undefined" || activeKey === "null" || activeKey === "") {
    throw new Error("Gemini API key is not configured. Please add your own Gemini API key in the App Settings to unlock the AI Assistant.");
  }

  return new GoogleGenAI({
    apiKey: activeKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to extract authorization token
function getAuthToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// 1. Spreadsheet Initialization & Search Endpoint
app.get("/api/sheets/init", async (req, res) => {
  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing Google OAuth token" });
  }

  try {
    // Search for existing file named "Smart Checklist"
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='Smart Checklist' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      return res.status(searchRes.status).json({ error: `Drive Search Error: ${errText}` });
    }

    const searchData = await searchRes.json() as { files?: { id: string }[] };
    if (searchData.files && searchData.files.length > 0) {
      // Existing sheet found!
      return res.json({ spreadsheetId: searchData.files[0].id, isNew: false });
    }

    // No sheet found. Create a new one.
    const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: "Smart Checklist",
        },
        sheets: [
          {
            properties: {
              title: "Tasks",
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return res.status(createRes.status).json({ error: `Create Sheets Error: ${errText}` });
    }

    const sheetData = await createRes.json() as { spreadsheetId: string };
    const spreadsheetId = sheetData.spreadsheetId;

    // Initialize headers: Task_ID, Date, Timestamp, Task_Description, Status, Last_Updated
    const headersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A1:F1?valueInputOption=RAW`;
    const headersRes = await fetch(headersUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: "Tasks!A1:F1",
        majorDimension: "ROWS",
        values: [
          ["Task_ID", "Date", "Timestamp", "Task_Description", "Status", "Last_Updated"],
        ],
      }),
    });

    if (!headersRes.ok) {
      const errText = await headersRes.text();
      return res.status(headersRes.status).json({ error: `Write Headers Error: ${errText}` });
    }

    return res.json({ spreadsheetId, isNew: true });
  } catch (error: any) {
    console.error("Sheet Init Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. Fetch Tasks Endpoint
app.get("/api/tasks", async (req, res) => {
  const token = getAuthToken(req);
  const spreadsheetId = req.query.spreadsheetId as string;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!spreadsheetId) {
    return res.status(400).json({ error: "Missing spreadsheetId query parameter" });
  }

  try {
    const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F`;
    const fetchRes = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: `Fetch Sheets Error: ${errText}` });
    }

    const data = await fetchRes.json() as { values?: string[][] };
    const rows = data.values || [];

    if (rows.length <= 1) {
      return res.json([]); // Only headers or completely empty
    }

    // Map rows to task objects (skipping headers at index 0)
    const tasks = rows.slice(1).map((row) => ({
      id: row[0] || "",
      date: row[1] || "",
      timestamp: row[2] || "",
      description: row[3] || "",
      status: row[4] || "Pending",
      lastUpdated: row[5] || "",
    })).filter((t) => t.id); // Filter out rows with empty ID

    return res.json(tasks);
  } catch (error: any) {
    console.error("Fetch Tasks Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. Add Task Endpoint
app.post("/api/tasks", async (req, res) => {
  const token = getAuthToken(req);
  const { spreadsheetId, description, date, timestamp } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!spreadsheetId || !description) {
    return res.status(400).json({ error: "Missing spreadsheetId or task description" });
  }

  const taskId = `task_${Math.floor(100000 + Math.random() * 900000)}`;
  const status = "Pending";
  const lastUpdated = `${date} ${timestamp}`;

  try {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F:append?valueInputOption=USER_ENTERED`;
    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: "Tasks!A:F",
        majorDimension: "ROWS",
        values: [
          [taskId, date, timestamp, description, status, lastUpdated],
        ],
      }),
    });

    if (!appendRes.ok) {
      const errText = await appendRes.text();
      return res.status(appendRes.status).json({ error: `Append Task Error: ${errText}` });
    }

    return res.json({
      id: taskId,
      date,
      timestamp,
      description,
      status,
      lastUpdated,
    });
  } catch (error: any) {
    console.error("Add Task Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 4. Update Task Endpoint
app.put("/api/tasks", async (req, res) => {
  const token = getAuthToken(req);
  const { spreadsheetId, taskId, status, lastUpdated } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!spreadsheetId || !taskId || !status) {
    return res.status(400).json({ error: "Missing spreadsheetId, taskId, or status" });
  }

  try {
    // 1. Fetch current rows to find row index
    const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F`;
    const fetchRes = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: `Fetch Task Index Error: ${errText}` });
    }

    const data = await fetchRes.json() as { values?: string[][] };
    const rows = data.values || [];

    const rowIndex = rows.findIndex((row) => row[0] === taskId);
    if (rowIndex === -1) {
      return res.status(404).json({ error: "Task not found in the spreadsheet" });
    }

    // Google Sheets rows are 1-indexed. The matched row is index + 1.
    const sheetRowNumber = rowIndex + 1;
    const targetRow = rows[rowIndex];

    // Maintain other cells, update status and last updated timestamp
    const updatedRow = [
      targetRow[0], // Task_ID
      targetRow[1], // Date
      targetRow[2], // Timestamp
      targetRow[3], // Task_Description
      status,       // Status
      lastUpdated,  // Last_Updated
    ];

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A${sheetRowNumber}:F${sheetRowNumber}?valueInputOption=USER_ENTERED`;
    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: `Tasks!A${sheetRowNumber}:F${sheetRowNumber}`,
        majorDimension: "ROWS",
        values: [updatedRow],
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      return res.status(updateRes.status).json({ error: `Update Row Error: ${errText}` });
    }

    return res.json({
      id: targetRow[0],
      date: targetRow[1],
      timestamp: targetRow[2],
      description: targetRow[3],
      status,
      lastUpdated,
    });
  } catch (error: any) {
    console.error("Update Task Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 5. Intelligent MCP Gemini API Query Endpoint
app.post("/api/chat", async (req, res) => {
  const token = getAuthToken(req);
  const { spreadsheetId, query, localTime } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }
  if (!spreadsheetId) {
    return res.status(400).json({ error: "Missing spreadsheetId" });
  }

  // 1. Fetch current rows as context for Gemini
  let tasksContext = "No tasks currently exist in the database.";
  try {
    const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F`;
    const fetchRes = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (fetchRes.ok) {
      const data = await fetchRes.json() as { values?: string[][] };
      const rows = data.values || [];
      if (rows.length > 1) {
        tasksContext = rows.slice(1).map((row, idx) => {
          return `${idx + 1}. [ID: ${row[0]}] [Scheduled Date: ${row[1]}] [Time: ${row[2]}] Description: "${row[3]}" | Status: ${row[4]} | Last Updated: ${row[5]}`;
        }).join("\n");
      }
    }
  } catch (err) {
    console.error("Error reading context for Gemini:", err);
  }

  // 2. Query Gemini
  try {
    const systemInstruction = `You are the AI engine of the Smart Checklist Web App. Your database is a Google Sheet containing the user's checklist tasks.
You are given the absolute latest real-time task data extracted from the Google Sheet, along with the user's query and their local current date and time.
Analyze the database rows, filter out what matches the user's criteria, and list or summarize them conversationally.

User's local current time: ${localTime || "Unknown"}

Database Tasks:
${tasksContext}

CRITICAL RULES:
- If asked about "Today", "Tomorrow", "Yesterday", compare dates with the provided User's local current time (${localTime}).
- When the user asks you to add, write, save, create, or schedule a task (e.g., "Tomorrow at 10 AM, I need to go to the theater"), you MUST use the "addTaskToSheet" tool to create and add the task into the database.
- Parse the relative date and time correctly. If current local time is Friday, 2026-07-10, "Tomorrow" means "2026-07-11". "10 AM" is formatted as "10:00:00".
- Make sure to separate the core task description (e.g. "Go to the theater") from the date and time variables, and put them into the respective fields.
- Format scheduled dates nicely (e.g. "Friday, July 10, 2026").
- Be concise, friendly, and structured. Use Markdown bullet points, bold text, or checklists to make the list extremely readable.
- If no tasks match, state that clearly and offer tips or ask if they'd like to add one.
- Do not make up any tasks that are not in the Database. Refer only to the provided tasks list.`;

    const aiClient = getAiClient(req);
    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [
          {
            functionDeclarations: [
              {
                name: "addTaskToSheet",
                description: "Adds a task to the user's checklist in Google Sheets. Call this when the user requests to create, add, schedule, or list a new task. Extract the core task description, target date, and target time. If the date is not explicitly specified, calculate it relative to the user's local current date. If the time is not specified, default to the user's current local time.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    description: {
                      type: Type.STRING,
                      description: "The core description of the task (e.g., 'Draft presentation slides'). Do NOT include dates or times in this description."
                    },
                    date: {
                      type: Type.STRING,
                      description: "The scheduled/specified date in YYYY-MM-DD format."
                    },
                    timestamp: {
                      type: Type.STRING,
                      description: "The scheduled/specified time in HH:MM:SS format."
                    }
                  },
                  required: ["description", "date", "timestamp"]
                }
              }
            ]
          }
        ]
      },
    });

    let addedTask = null;
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "addTaskToSheet") {
        const args = call.args as { description: string; date: string; timestamp: string };
        const taskDesc = args.description;
        let taskDate = args.date || "";
        let taskTime = args.timestamp || "";

        // Robust normalization of date & timestamp to prevent ISO/relative formatting in spreadsheet cells
        if (taskDate.includes("T")) {
          const parts = taskDate.split("T");
          taskDate = parts[0];
          if (parts[1] && (!taskTime || taskTime === "tomorrow" || taskTime === "today")) {
            taskTime = parts[1].substring(0, 8);
          }
        }
        if (taskTime.includes("T")) {
          const parts = taskTime.split("T");
          if (parts[1]) {
            taskTime = parts[1].substring(0, 8);
          } else {
            taskTime = parts[0].substring(0, 8);
          }
        }
        taskTime = taskTime.replace("Z", "").split("+")[0].split("-")[0].trim();

        // If the model output still falls back to tomorrow/today strings, fall back to current date
        const todayStr = new Date().toISOString().split("T")[0];
        if (taskDate.toLowerCase() === "today" || !/^\d{4}-\d{2}-\d{2}$/.test(taskDate)) {
          taskDate = todayStr;
        } else if (taskDate.toLowerCase() === "tomorrow") {
          const tom = new Date();
          tom.setDate(tom.getDate() + 1);
          taskDate = tom.toISOString().split("T")[0];
        }

        if (taskTime.toLowerCase() === "today" || taskTime.toLowerCase() === "tomorrow" || !/^\d{2}:\d{2}(:\d{2})?$/.test(taskTime)) {
          taskTime = new Date().toTimeString().split(" ")[0];
        }

        const taskId = `task_${Math.floor(100000 + Math.random() * 900000)}`;
        const status = "Pending";
        const lastUpdated = `${taskDate} ${taskTime}`;

        // Append to Google Sheet placing the task properties into the relevant row and columns
        const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F:append?valueInputOption=USER_ENTERED`;
        const appendRes = await fetch(appendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            range: "Tasks!A:F",
            majorDimension: "ROWS",
            values: [
              [taskId, taskDate, taskTime, taskDesc, status, lastUpdated],
            ],
          }),
        });

        if (!appendRes.ok) {
          const errText = await appendRes.text();
          throw new Error(`Failed to append task via Sheet API: ${errText}`);
        }

        addedTask = {
          id: taskId,
          date: taskDate,
          timestamp: taskTime,
          description: taskDesc,
          status,
          lastUpdated,
        };

        const successText = `I have successfully added your task **"${taskDesc}"** to the Google Sheet!
- **Date**: ${taskDate} (Column B)
- **Time**: ${taskTime} (Column C)
- **Description**: ${taskDesc} (Column D)
- **Status**: ${status} (Column E)
It is now properly positioned in the relevant columns and rows!`;

        return res.json({
          text: successText,
          addedTask,
        });
      }
    }

    let textResponse = "";
    try {
      textResponse = response.text || "";
    } catch {
      textResponse = "I have completed the request.";
    }

    return res.json({ text: textResponse });
  } catch (error: any) {
    console.error("Gemini Query Error:", error);

    const errorObj = error || {};
    const status = errorObj.status || errorObj.statusCode || 500;
    
    // Convert error message to a string safely to prevent TypeErrors
    let rawMessage = "Failed to query AI assistant.";
    if (typeof errorObj.message === "string") {
      rawMessage = errorObj.message;
    } else if (typeof errorObj === "string") {
      rawMessage = errorObj;
    } else {
      try {
        rawMessage = JSON.stringify(errorObj);
      } catch {
        rawMessage = String(errorObj);
      }
    }

    if (status === 429 || rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        error: "Daily AI query limit reached. You can still manage and view your tasks manually below!"
      });
    }

    // Clean up raw JSON error messages from Google API to make them user-friendly
    let cleanMessage = rawMessage;
    try {
      const trimmed = rawMessage.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const parsed = JSON.parse(trimmed);
        cleanMessage = parsed.error?.message || cleanMessage;
      }
    } catch {
      // Keep original message if parsing fails
    }

    return res.status(500).json({ error: cleanMessage });
  }
});

// Vite Middleware & Static Asset Routing
async function startViteDev() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startViteDev();
}

export default app;
