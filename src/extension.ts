import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(getHoverProvider());
  context.subscriptions.push(getSearchProvider());
}

export function deactivate() {}
