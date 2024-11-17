import * as vscode from "vscode";

import getHoverProvider from "./hoverProvider";
import getSearchProvider from "./searchProvider";
import { getJsonFilePath, searchForComponent } from "./utils";
import JsonTreeDataProvider from "./treeSidebar";

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

  const treeDataProvider = new JsonTreeDataProvider(context);
  vscode.window.registerTreeDataProvider("jsonTreeView", treeDataProvider);

  // Optional: Register a command to refresh the tree view
  context.subscriptions.push(
    vscode.commands.registerCommand("jsonTreeView.refresh", () => {
      treeDataProvider.refresh();
      treeDataProvider.loadData();
    })
  );

  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    getJsonFilePath().jsonFilePath as string
  );

  fileWatcher.onDidChange(() => {
    treeDataProvider.refresh();
    treeDataProvider.loadData();
  });

  context.subscriptions.push(
    getHoverProvider(jsonFilePath),
    getSearchProvider(jsonFilePath),
    copyTextCommand,
    jsonSearchReferences
  );
}

export function deactivate() {}
