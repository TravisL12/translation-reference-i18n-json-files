import * as vscode from "vscode";
import * as fs from "fs";

import {
  findHoveredJsonKey,
  getHoveredWord,
  getLineOfMatch,
  nestedObjRef,
} from "./utils";

export default (jsonFilePath: string[]) => {
  return vscode.languages.registerHoverProvider(
    [
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "json" },
    ],
    {
      provideHover(document, position) {
        if (document.languageId === "json") {
          const word = findHoveredJsonKey(document, position);
          return word ? new vscode.Hover(word) : undefined;
        }

        const splitWord = getHoveredWord(document, position);

        if (!splitWord) {
          throw new Error("No word found");
        }

        try {
          const output = jsonFilePath
            .map((filePath) => {
              const doc = fs.readFileSync(filePath, "utf8");
              const jsonData = JSON.parse(doc);
              const subtext = nestedObjRef(jsonData, splitWord);

              if (!subtext?.translation) {
                return undefined;
              }

              const lineNumber = getLineOfMatch(doc, subtext.translation);
              const uri = vscode.Uri.file(filePath).with({
                fragment: `L${lineNumber}`,
              });
              const markdownString = new vscode.MarkdownString(
                `<h4>Translation:</h4>\n\n${
                  subtext.translation
                }\n\n**[View in file](${uri.toString()})** - **[Copy text](command:extension.copyText?${encodeURIComponent(
                  JSON.stringify([`"${splitWord.join(".")}"`])
                )})**`
              );
              markdownString.supportHtml = true;
              markdownString.isTrusted = true;

              return markdownString;
            })
            .filter((x) => x);

          return output?.[0]
            ? new vscode.Hover(output[0])
            : new vscode.Hover("");
        } catch (e) {
          console.log(e, "ERROR");
          return null;
        }
      },
    }
  );
};
