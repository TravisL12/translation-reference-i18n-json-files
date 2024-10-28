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

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" },
    {
      provideHover(document, position) {
        const {
          jsonFilePath,
          err,
        }: { jsonFilePath: string | undefined; err: vscode.Hover | undefined } =
          getJsonFilePath();

        const splitWord = getHoveredWord(document, position);

        if (!jsonFilePath || err || !splitWord) {
          return err;
        }

        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          const subtext = splitWord.reduce((word, param) => {
            return word[param];
          }, jsonData);

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

  context.subscriptions.push(provider);
}

export function deactivate() {}
