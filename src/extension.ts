import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";
import { getJsonFilePath, searchForComponent } from "./utils";
import JsonSidebarViewProvider from "./sidebar";

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

  const sidebarProvider = new JsonSidebarViewProvider(context);
  const sideBarView = vscode.window.registerWebviewViewProvider(
    "jsonSidebar",
    sidebarProvider
  );

  const reloadSidebar = vscode.commands.registerCommand(
    "jsonSidebar.reloadJson",
    async () => {
      sidebarProvider.loadDefaultJsonData();
    }
  );

  context.subscriptions.push(
    getHoverProvider(jsonFilePath),
    getSearchProvider(jsonFilePath),
    copyTextCommand,
    jsonSearchReferences,
    sideBarView,
    reloadSidebar
  );
}

export function deactivate() {}
