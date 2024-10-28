import * as vscode from "vscode";

import { performSearch } from "./utils";

export default (jsonFilePath: string) => {
  return vscode.commands.registerCommand("extension.search", async () => {
    const searchTerm = await vscode.window.showInputBox({
      prompt: "Enter your search term",
    });

    if (searchTerm) {
      const outputChannel = vscode.window.createOutputChannel("Search Results");
      outputChannel.show();

      const results = performSearch(searchTerm, jsonFilePath);

      outputChannel.appendLine(`Results for "${searchTerm}":`);
      results.forEach((result) => outputChannel.appendLine(result));
    }
  });
};
