import * as vscode from "vscode";

import { performSearch, searchForComponent } from "./utils";

export const copyTextCommand = () =>
  vscode.commands.registerCommand("extension.copyText", (text: string) => {
    vscode.env.clipboard.writeText(text).then(() => {
      vscode.window.showInformationMessage(`Copied: ${text}`);
    });
  });

export const jsonSearchReferences = () =>
  vscode.commands.registerCommand(
    "extension.searchCommand",
    async (results: string) => {
      await searchForComponent([results]);
    }
  );

export const findAllSearch = (jsonFilePath: string[]) =>
  vscode.commands.registerCommand("extension.findAllSearch", async () => {
    const searchTerm = await vscode.window.showInputBox({
      prompt: "Enter your search term",
    });

    if (searchTerm) {
      const output = jsonFilePath
        .map((filePath) => {
          return performSearch(searchTerm, filePath);
        })
        .flat();

      if (output) {
        const results = await searchForComponent(output);
        return results;
      }

      return [];
    }
  });
