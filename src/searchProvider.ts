import * as vscode from "vscode";

import { performSearch } from "./utils";

export default (jsonFilePath: string) => {
  return vscode.commands.registerCommand(
    "extension.findAllSearch",
    async () => {
      const searchTerm = await vscode.window.showInputBox({
        prompt: "Enter your search term",
      });

      if (searchTerm) {
        const results = performSearch(searchTerm, jsonFilePath);

        await vscode.commands.executeCommand("workbench.action.findInFiles", {
          query: results.join("|"),
          isRegex: true,
          triggerSearch: true,
        });
      }
    }
  );
};
