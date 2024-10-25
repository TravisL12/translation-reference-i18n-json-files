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
        const jsonFilePath = path.join(__dirname, "data.json");
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
