import * as vscode from "vscode";
import * as fs from "fs";

import { getHoveredWord, getJsonFilePath, nestedObjRef } from "./utils";

export default () => {
  const {
    jsonFilePath,
    err,
  }: { jsonFilePath: string | undefined; err: vscode.Hover | undefined } =
    getJsonFilePath();

  return vscode.languages.registerHoverProvider(
    { scheme: "file", language: "javascript" },
    {
      provideHover(document, position) {
        const splitWord = getHoveredWord(document, position);

        if (!jsonFilePath || err || !splitWord) {
          return err;
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
