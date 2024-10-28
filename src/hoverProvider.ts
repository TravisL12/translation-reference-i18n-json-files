import * as vscode from "vscode";
import * as fs from "fs";

import { getHoveredWord, nestedObjRef } from "./utils";

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
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
          const subtext = nestedObjRef(jsonData, splitWord);

          const output = subtext
            ? `**Description:** ${subtext.translation}`
            : "No text found!";

          return new vscode.Hover(output);
        } catch (e) {
          console.log(e, "ERROR");
          return null;
        }
      },
    }
  );
};
