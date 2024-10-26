import * as vscode from "vscode";

import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" },
    {
      provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(
          position,
          /['"](.*?)['"]/
        );

        if (!wordRange) {
          return;
        }

        const hoveredWord = document.getText(wordRange);

        const config = vscode.workspace.getConfiguration(
          "json-text-lookup-for-vscode"
        );
        let jsonFilePath: string | undefined = config.get("jsonFilePath");

        if (!jsonFilePath || fs.existsSync(jsonFilePath)) {
          return new vscode.Hover(
            "JSON file not found. Check your path setting."
          );
        }

        if (!path.isAbsolute(jsonFilePath)) {
          const workspaceFolder = vscode.workspace.workspaceFolders
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : "";

          if (!workspaceFolder) {
            return new vscode.Hover("Workspace folder not found.");
          }

          jsonFilePath = path.join(workspaceFolder, jsonFilePath);
        }

        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          const splitWord = hoveredWord.replace(/['"]/gi, "").split(".");
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
  console.log("RUNNING");
  context.subscriptions.push(provider);
}

export function deactivate() {}
