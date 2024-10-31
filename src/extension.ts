import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";
import { getJsonFilePath, searchForComponent } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  const {
    jsonFilePath,
    err,
  }: { jsonFilePath: string | undefined; err: vscode.Hover | undefined } =
    getJsonFilePath();

  if (!jsonFilePath || err) {
    return err;
  }

  const copyTextCommand = vscode.commands.registerCommand(
    "extension.copyText",
    (text: string) => {
      vscode.env.clipboard.writeText(text).then(() => {
        vscode.window.showInformationMessage(`Copied: ${text}`);
      });
    }
  );

  const jsonSearchReferences = vscode.commands.registerCommand(
    "extension.executeFunctionCommand",
    async (results: string) => {
      await searchForComponent([results]);
    }
  );

  context.subscriptions.push(
    getHoverProvider(jsonFilePath),
    getSearchProvider(jsonFilePath),
    copyTextCommand,
    jsonSearchReferences
  );
}

export function deactivate() {}
