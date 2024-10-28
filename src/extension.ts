import * as vscode from "vscode";

import * as fs from "fs";
import * as path from "path";

const getHoveredWord = (
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

const getJsonFilePath = () => {
  const config = vscode.workspace.getConfiguration(
    "json-text-lookup-for-vscode"
  );
  let jsonFilePath: string | undefined = config.get("jsonFilePath");
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

const nestedObjRef = (obj: Record<string, any>, keyPath: string[]) =>
  keyPath.reduce((acc, key) => acc?.[key], obj);

const recurseObjSearch = (
  query: string,
  obj: Record<string, any>,
  results: string[],
  keyPath: string[] = []
) => {
  const nested = nestedObjRef(obj, keyPath) || {};
  const keys = Object.keys(nested);

  if (!!nested?.translation) {
    const hasMatch = nested.translation
      ?.toLowerCase()
      .includes(query.toLowerCase());

    if (hasMatch) {
      results.push(`${keyPath.join(".")} - ${nested.translation}`);
    }
  } else {
    keys.forEach((key) => {
      recurseObjSearch(query, obj, results, [...keyPath, key]);
    });
  }
};

function performSearch(query: string, jsonFilePath?: string): string[] {
  if (!jsonFilePath) {
    return [];
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  const results: string[] = [];
  recurseObjSearch(query, jsonData, results);

  return results;
}

export function activate(context: vscode.ExtensionContext) {
  const {
    jsonFilePath,
    err,
  }: { jsonFilePath: string | undefined; err: vscode.Hover | undefined } =
    getJsonFilePath();

  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" },
    {
      provideHover(document, position) {
        const splitWord = getHoveredWord(document, position);

        if (!jsonFilePath || err || !splitWord) {
          return err;
        }

        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          const subtext = nestedObjRef(jsonData, splitWord);

          const output = subtext
            ? `**Description:** ${subtext.translation}`
            : "No text found!";

          return new vscode.Hover(output);
        } catch (e) {
          console.log(e, "ERROR");
          return null;
        }
      },
    }
  );

  const searchProvider = vscode.commands.registerCommand(
    "extension.search",
    async () => {
      // Show input box to enter the search term
      const searchTerm = await vscode.window.showInputBox({
        prompt: "Enter your search term",
      });

      if (searchTerm) {
        // Log the search term in the Output console
        const outputChannel =
          vscode.window.createOutputChannel("Search Results");
        outputChannel.show();

        // Perform the search (you can customize this function)
        const results = performSearch(searchTerm, jsonFilePath);

        // Display results in output channel
        outputChannel.appendLine(`Results for "${searchTerm}":`);
        results.forEach((result) => outputChannel.appendLine(result));
      }
    }
  );

  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(searchProvider);
}

export function deactivate() {}
