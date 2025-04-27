import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { APP_NAME, JSON_PATH_SETTING } from "./constants";
import { TreeNode } from "./types";

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
  let err,
    jsonFilePath: string | string[] | undefined = config.get(JSON_PATH_SETTING);

  const jsonFilePathArray: string[] = Array.isArray(jsonFilePath)
    ? jsonFilePath || ""
    : [jsonFilePath || ""];
  const validPaths: string[] = jsonFilePathArray.filter((filePath) => filePath);

  if (!jsonFilePath || validPaths.length === 0) {
    err = new vscode.Hover("JSON file not found. Check your path setting.");
    return { jsonFilePath: jsonFilePathArray, err };
  }

  const workspaceFolder = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : "";

  if (!workspaceFolder) {
    err = new vscode.Hover("Workspace folder not found.");
    return { jsonFilePath: jsonFilePathArray, err };
  }

  const output = validPaths.map((filePath) => {
    if (!filePath) {
      return filePath;
    }

    return !path.isAbsolute(filePath)
      ? path.join(workspaceFolder, filePath)
      : filePath;
  });

  return { jsonFilePath: output, err };
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

export const searchForComponent = async (results: string[]) => {
  await vscode.commands.executeCommand("workbench.action.findInFiles", {
    query: results.join("|"),
    isRegex: true,
    triggerSearch: true,
  });
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

  // in case you hover and you get the text of the whole doc
  if (word.split("\n").length > 1) {
    return;
  }

  let parentKeyOne;
  let parentKeyTwo;
  let has2Indent = false;
  const lines = jsonContent.split("\n");
  for (let i = 0; i < position.line + 1; i++) {
    const line = lines[i];

    has2Indent = has2Indent || /^\s{2}"/.test(line);

    // check if indentation is 2 or 4 for top level key.
    // I tried a function with `new RegExp` but it didn't want to work
    // for the /^\s{2}"/ pattern
    if (has2Indent) {
      if (/^\s{2}"/.test(line)) {
        parentKeyOne = line.replace(/['":{]/gi, "").trim();
      }
      if (/^\s{4}"/.test(line)) {
        parentKeyTwo = line.replace(/['":{]/gi, "").trim();
      }
    } else {
      if (/^\s{4}"/.test(line)) {
        parentKeyOne = line.replace(/['":{]/gi, "").trim();
      }
      if (/^\s{6}"/.test(line)) {
        parentKeyTwo = line.replace(/['":{]/gi, "").trim();
      }
    }
  }

  if (parentKeyOne && parentKeyTwo && word && word !== parentKeyTwo) {
    const copyLine = `${parentKeyOne}.${parentKeyTwo}.${word}`;

    const output = new vscode.MarkdownString(`${copyLine}\n\n`);

    // append copy feature
    output.appendMarkdown(
      `**[Copy text](command:extension.copyText?${encodeURIComponent(
        JSON.stringify([`"${copyLine}"`])
      )})** - `
    );

    // append find references
    output.appendMarkdown(
      `**[Find References](command:extension.searchCommand?${encodeURIComponent(
        JSON.stringify([copyLine])
      )} "Click to search for components using this string")**`
    );

    output.supportHtml = true;
    output.isTrusted = true;

    return output;
  }

  return undefined;
}

export function jsonToTree(obj: any, nodeName: string = "Root"): TreeNode {
  const node: TreeNode = { name: nodeName };

  if (typeof obj === "object" && obj !== null) {
    node.children = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        node.children!.push(jsonToTree(item, `Item ${index + 1}`));
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          node.children!.push(jsonToTree(obj[key], key));
        }
      }
    }
  } else {
    node.name = `${nodeName}: ${obj}`;
  }

  return node;
}
