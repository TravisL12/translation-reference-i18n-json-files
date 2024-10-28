import * as vscode from "vscode";
import * as fs from "fs";
import {
  getHoveredWord,
  getJsonFilePath,
  nestedObjRef,
  performSearch,
} from "./utils";

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
      const searchTerm = await vscode.window.showInputBox({
        prompt: "Enter your search term",
      });

      if (searchTerm) {
        const outputChannel =
          vscode.window.createOutputChannel("Search Results");
        outputChannel.show();

        const results = performSearch(searchTerm, jsonFilePath);

        outputChannel.appendLine(`Results for "${searchTerm}":`);
        results.forEach((result) => outputChannel.appendLine(result));
      }
    }
  );

  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(searchProvider);
}

export function deactivate() {}
