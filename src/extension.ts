import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";
import { getJsonFilePath } from "./utils";

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

  context.subscriptions.push(
    getHoverProvider(jsonFilePath),
    getSearchProvider(jsonFilePath),
    copyTextCommand
  );
}

export function deactivate() {}
