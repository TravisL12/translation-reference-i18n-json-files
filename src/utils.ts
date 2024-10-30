import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { APP_NAME, JSON_PATH_SETTING } from "./constants";

export const getHoveredWord = (
  document: vscode.TextDocument,
  position: vscode.Position
) => {
  const wordRange = document.getWordRangeAtPosition(position, /['"](.*?)['"]/);

  if (!wordRange) {
    return;
  }

  const hoveredWord = document.getText(wordRange);
  return hoveredWord.replace(/['"]/gi, "").split(".");
};

export const getLineOfMatch = (doc: string, text: string) => {
  let lineNumber = -1;
  const lines = doc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text)) {
      lineNumber = i + 1;
      break;
    }
  }
  return lineNumber;
};

export const getJsonFilePath = () => {
  const config = vscode.workspace.getConfiguration(APP_NAME);
  let jsonFilePath: string | undefined = config.get(JSON_PATH_SETTING);
  let err;

  if (!jsonFilePath || fs.existsSync(jsonFilePath)) {
    err = new vscode.Hover("JSON file not found. Check your path setting.");
    return { jsonFilePath, err };
  }

  if (!path.isAbsolute(jsonFilePath)) {
    const workspaceFolder = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

    if (!workspaceFolder) {
      err = new vscode.Hover("Workspace folder not found.");
      return { jsonFilePath, err };
    }

    jsonFilePath = path.join(workspaceFolder, jsonFilePath);
  }

  return { jsonFilePath, err };
};

export const nestedObjRef = (obj: Record<string, any>, keyPath: string[]) =>
  keyPath.reduce((acc, key) => acc?.[key], obj);

export const recurseObjSearch = (
  query: string,
  obj: Record<string, any>,
  results: string[],
  keyPath: string[] = []
) => {
  const nested = nestedObjRef(obj, keyPath);
  const keys = Object.keys(nested);

  if (!!nested?.translation) {
    const hasMatch = nested.translation
      ?.toLowerCase()
      .includes(query.toLowerCase());

    if (hasMatch) {
      results.push(keyPath.join("."));
    }
  } else if (typeof nested === "object") {
    keys.forEach((key) => {
      recurseObjSearch(query, obj, results, [...keyPath, key]);
    });
  }
};

export function performSearch(query: string, jsonFilePath?: string): string[] {
  if (!jsonFilePath) {
    return [];
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
  const results: string[] = [];
  recurseObjSearch(query, jsonData, results);

  return results;
}

export const recurseChildKeySearch = (
  query: string,
  obj: Record<string, any>,
  results: string[],
  keyPath: string[] = []
) => {
  const nested = nestedObjRef(obj, keyPath);
  const keys = Object.keys(nested);

  if (keys.includes(query)) {
    results.push(keyPath.join("."));
  } else if (typeof nested === "object") {
    keys.forEach((key) => {
      recurseChildKeySearch(query, obj, results, [...keyPath, key]);
    });
  }
};

export function findHoveredJsonKey(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const hoveredKey = document.getText(
    document.getWordRangeAtPosition(position, /.*['"]: {/)
  );
  const word = hoveredKey.replace(/['":{]/gi, "").trim();
  const jsonContent = document.getText();

  let parentOneLine;
  let parentTwoLine;
  const lines = jsonContent.split("\n");
  for (let i = 0; i < position.line + 1; i++) {
    const line = lines[i];
    if (line.substring(0, 5) === '    "') {
      parentOneLine = line.replace(/['":{]/gi, "").trim();
    }
    if (line.substring(0, 7) === '      "') {
      parentTwoLine = line.replace(/['":{]/gi, "").trim();
    }
  }

  if (parentOneLine && parentTwoLine && word) {
    return new vscode.MarkdownString(
      `${parentOneLine}.${parentTwoLine}.${word}`
    );
  }

  return undefined;
}
