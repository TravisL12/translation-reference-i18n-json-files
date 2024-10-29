import * as vscode from "vscode";
import * as fs from "fs";

import { getHoveredWord, getLineOfMatch, nestedObjRef } from "./utils";

export default (jsonFilePath: string) => {
  return vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" },
    {
      provideHover(document, position) {
        const splitWord = getHoveredWord(document, position);

        if (!splitWord) {
          throw new Error("No word found");
        }

        try {
          const doc = fs.readFileSync(jsonFilePath, "utf8");
          const jsonData = JSON.parse(doc);
          const subtext = nestedObjRef(jsonData, splitWord);

          if (!subtext?.translation) {
            return undefined;
          }

          const lineNumber = getLineOfMatch(doc, subtext.translation);
          const uri = vscode.Uri.file(jsonFilePath).with({
            fragment: `L${lineNumber}`,
          });
          const markdownString = new vscode.MarkdownString(
            `**[Found at L#${lineNumber}](${uri.toString()})**: ${
              subtext.translation
            }`
          );
          markdownString.isTrusted = true;

          return new vscode.Hover(markdownString);
        } catch (e) {
          console.log(e, "ERROR");
          return null;
        }
      },
    }
  );
};
