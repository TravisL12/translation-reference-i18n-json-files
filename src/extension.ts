import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";
import { getJsonFilePath } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  // import settings
  const {
    jsonFilePath,
    err,
  }: { jsonFilePath: string | undefined; err: vscode.Hover | undefined } =
    getJsonFilePath();

  if (!jsonFilePath || err) {
    return err;
  }

  context.subscriptions.push(getHoverProvider(jsonFilePath));
  context.subscriptions.push(getSearchProvider(jsonFilePath));
}

export function deactivate() {}
