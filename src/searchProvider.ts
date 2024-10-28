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

        console.log(results, "results");

        await vscode.commands.executeCommand("workbench.action.findInFiles", {
          query: results.join("|"),
          isRegex: true,
          triggerSearch: true,
        });

        // SEARCHES AND FINDS DIRECTLY IN A FILE
        // let regex: RegExp;
        // try {
        //   regex = new RegExp(results.join("|"), "g");
        // } catch (error) {
        //   vscode.window.showErrorMessage("Invalid regex pattern.");
        //   return;
        // }
        // const files = await vscode.workspace.findFiles("**/*");
        // for (const file of files) {
        //   const document = await vscode.workspace.openTextDocument(file);
        //   const text = document.getText();
        //   let match;

        //   while ((match = regex.exec(text)) !== null) {
        //     const position = document.positionAt(match.index);
        //     const range = new vscode.Range(
        //       position,
        //       document.positionAt(match.index + match[0].length)
        //     );

        //     await vscode.window.showTextDocument(document).then((editor) => {
        //       editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        //       editor.selection = new vscode.Selection(range.start, range.end);
        //     });
        //   }
        // }
      }
    }
  );
};
