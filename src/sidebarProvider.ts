import * as vscode from "vscode";
import { jsonToTree } from "./utils";
import * as fs from "fs";

class TreeSidebarViewProvider extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly tooltip?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
  }
}

class JsonTreeDataProvider
  implements vscode.TreeDataProvider<TreeSidebarViewProvider>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeSidebarViewProvider | undefined | void
  > = new vscode.EventEmitter<TreeSidebarViewProvider | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<
    TreeSidebarViewProvider | undefined | void
  > = this._onDidChangeTreeData.event;

  private jsonData: any;
  private jsonFilePath: any;

  constructor(jsonFilePath: string) {
    this.jsonFilePath = jsonFilePath;
    this.loadData();

    const fileWatcher = vscode.workspace.createFileSystemWatcher(jsonFilePath);
    fileWatcher.onDidChange(this.refreshSidebar);
  }

  loadData(): void {
    if (!this.jsonFilePath) {
      return;
    }

    const doc = fs.readFileSync(this.jsonFilePath, "utf8");
    this.jsonData = jsonToTree(JSON.parse(doc));
  }

  refreshSidebar = () => {
    this.loadData();
    this._onDidChangeTreeData.fire();
  };

  getTreeItem(element: TreeSidebarViewProvider): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeSidebarViewProvider): TreeSidebarViewProvider[] {
    if (!element) {
      return this.jsonData.children.map(
        (child: any) =>
          new TreeSidebarViewProvider(
            child.name,
            vscode.TreeItemCollapsibleState.Collapsed
          )
      );
    } else {
      const parentItem = this.findItemByName(this.jsonData, element.label);
      return (
        parentItem?.children?.map(
          (child: any) =>
            new TreeSidebarViewProvider(
              child.name,
              child.children
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
            )
        ) || []
      );
    }
  }

  private findItemByName(node: any, name: string): any {
    if (node.name === name) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = this.findItemByName(child, name);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

export default (jsonFilePath: string) => {
  const treeDataProvider = new JsonTreeDataProvider(jsonFilePath);
  vscode.window.registerTreeDataProvider("jsonTreeView", treeDataProvider);

  return vscode.commands.registerCommand(
    "extension.refreshTranslation",
    treeDataProvider.refreshSidebar
  );
};
