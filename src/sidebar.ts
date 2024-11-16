import * as vscode from "vscode";

class JsonSidebarViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    // Set HTML content
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showInformationMessage(message.text);
          break;
      }
    });
  }

  // Send JSON data to the webview
  setJsonData(data: object) {
    if (this._view) {
      this._view.webview.postMessage({ type: "jsonData", data });
    }
  }

  // Define HTML for the sidebar view
  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSON Sidebar</title>
      </head>
      <body>
        <div id="jsonData">Loading...</div>
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'jsonData') {
              document.getElementById('jsonData').textContent = JSON.stringify(message.data, null, 2);
            }
          });
        </script>
      </body>
      </html>`;
  }
}

// Utility function for nonce generation
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export default JsonSidebarViewProvider;
