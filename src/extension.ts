import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import { getJsonFilePath } from "./utils";
import {
  copyTextCommand,
  jsonSearchReferences,
  findAllSearch,
} from "./commands";
import { APP_NAME } from "./constants";

export function activate(context: vscode.ExtensionContext) {
  const {
    jsonFilePath,
    err,
  }: { jsonFilePath: string[] | undefined; err: vscode.Hover | undefined } =
    getJsonFilePath();

  if (!jsonFilePath || err) {
    return err;
  }

  const reloadOnSettingsChange = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration(APP_NAME)) {
        vscode.window.showInformationMessage(
          "Configuration changed, reloading..."
        );
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    }
  );

  context.subscriptions.push(
    getHoverProvider(jsonFilePath),
    copyTextCommand(),
    jsonSearchReferences(),
    findAllSearch(jsonFilePath),
    reloadOnSettingsChange
  );
}

export function deactivate() {}
