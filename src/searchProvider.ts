import * as vscode from "vscode";

import { performSearch, searchForComponent } from "./utils";

export default (jsonFilePath: string) => {
  return vscode.commands.registerCommand(
    "extension.findAllSearch",
    async () => {
      const searchTerm = await vscode.window.showInputBox({
        prompt: "Enter your search term",
      });

      if (searchTerm) {
        const results = performSearch(searchTerm, jsonFilePath);

        await searchForComponent(results);
      }
    }
  );
};
