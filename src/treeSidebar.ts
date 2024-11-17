import * as vscode from "vscode";
import { getJsonFilePath } from "./utils";
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

  constructor(private context: vscode.ExtensionContext) {
    // Load JSON data (this can be from a file, API, etc.)
    this.jsonData = {
      name: "Root",
      children: [
        {
          name: "Item 1",
          children: [{ name: "Subitem 1.1" }, { name: "Subitem 1.2" }],
        },
        { name: "Item 2", children: [{ name: "Subitem 2.1" }] },
      ],
    };
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeSidebarViewProvider): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeSidebarViewProvider): TreeSidebarViewProvider[] {
    if (!element) {
      // Root level items
      return this.jsonData.children.map(
        (child: any) =>
          new TreeSidebarViewProvider(
            child.name,
            vscode.TreeItemCollapsibleState.Collapsed
          )
      );
    } else {
      // Get children of a specific item
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

export default JsonTreeDataProvider;
