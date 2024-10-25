import * as vscode from "vscode";

import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" }, // Specify the language
    {
      provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position, /'(.*?)'/);
        const hoveredWord = document.getText(wordRange);
        const jsonFilePath = path.join(__dirname, "data.json");
        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          const splitWord = hoveredWord.replaceAll("'", "").split(".");
          const subtext = splitWord.reduce((word, param) => {
            return word[param];
          }, jsonData);
          if (subtext) {
            return new vscode.Hover(`**Description:** ${subtext.translation}`);
          } else {
            return new vscode.Hover(`No Text Found!`);
          }
        } catch (e) {
          return new vscode.Hover(`ERROR!`);
        }
      },
    }
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
