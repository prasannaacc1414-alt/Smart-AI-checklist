import { Task } from '../types';

export const initSpreadsheetClientSide = async (token: string) => {
  // Search for existing file named "Smart Checklist"
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='Smart%20Checklist'%20and%20mimeType='application/vnd.google-apps.spreadsheet'%20and%20trashed=false`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    throw new Error(`Drive Search Failed: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json() as { files?: { id: string }[] };
  if (searchData.files && searchData.files.length > 0) {
    return { spreadsheetId: searchData.files[0].id, isNew: false };
  }

  // Create a new spreadsheet
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title: "Smart Checklist" },
      sheets: [{ properties: { title: "Tasks" } }],
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Create Sheets Failed: ${createRes.statusText}`);
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
      values: [["Task_ID", "Date", "Timestamp", "Task_Description", "Status", "Last_Updated"]],
    }),
  });

  if (!headersRes.ok) {
    throw new Error(`Write Headers Failed: ${headersRes.statusText}`);
  }

  return { spreadsheetId, isNew: true };
};

export const fetchTasksClientSide = async (token: string, spreadsheetId: string): Promise<Task[]> => {
  const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F`;
  const fetchRes = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fetchRes.ok) {
    throw new Error(`Fetch Sheets Failed: ${fetchRes.statusText}`);
  }

  const data = await fetchRes.json() as { values?: string[][] };
  const rows = data.values || [];

  if (rows.length <= 1) {
    return [];
  }

  return rows.slice(1).map((row) => ({
    id: row[0] || "",
    date: row[1] || "",
    timestamp: row[2] || "",
    description: row[3] || "",
    status: (row[4] === 'Completed' ? 'Completed' : 'Pending') as 'Pending' | 'Completed',
    lastUpdated: row[5] || "",
  })).filter((t) => t.id);
};

export const addTaskClientSide = async (
  token: string,
  spreadsheetId: string,
  description: string,
  date: string,
  timestamp: string
): Promise<Task> => {
  const taskId = `task_${Math.floor(100000 + Math.random() * 900000)}`;
  const status = "Pending";
  const lastUpdated = `${date} ${timestamp}`;

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
      values: [[taskId, date, timestamp, description, status, lastUpdated]],
    }),
  });

  if (!appendRes.ok) {
    throw new Error(`Append Task Failed: ${appendRes.statusText}`);
  }

  return {
    id: taskId,
    date,
    timestamp,
    description,
    status,
    lastUpdated,
  };
};

export const updateTaskStatusClientSide = async (
  token: string,
  spreadsheetId: string,
  taskId: string,
  nextStatus: 'Pending' | 'Completed',
  lastUpdated: string
): Promise<Task> => {
  // 1. Fetch current rows
  const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tasks!A:F`;
  const fetchRes = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fetchRes.ok) {
    throw new Error(`Fetch Task Index Failed: ${fetchRes.statusText}`);
  }

  const data = await fetchRes.json() as { values?: string[][] };
  const rows = data.values || [];

  const rowIndex = rows.findIndex((row) => row[0] === taskId);
  if (rowIndex === -1) {
    throw new Error("Task not found in the spreadsheet");
  }

  const sheetRowNumber = rowIndex + 1;
  const targetRow = rows[rowIndex];

  const updatedRow = [
    targetRow[0], // Task_ID
    targetRow[1], // Date
    targetRow[2], // Timestamp
    targetRow[3], // Task_Description
    nextStatus,   // Status
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
    throw new Error(`Update Row Failed: ${updateRes.statusText}`);
  }

  return {
    id: targetRow[0],
    date: targetRow[1],
    timestamp: targetRow[2],
    description: targetRow[3],
    status: nextStatus,
    lastUpdated,
  };
};
