# Translation Reference for i18n JSON Files

For translation json files that have a nested hiearchy.

### Get Started

Use the settings to point to your translation .json file.

`"translation-reference-for-i18n-json.jsonFilePath"`

This path should be relative to your project. Example:

```
  {
    "translation-reference-for-i18n-json.jsonFilePath": "./myFiles/i18n/data.json"
  }
```

- Note: after updating this setting VSCode should do a quick reload of your window to load the new settings file. If it does not reload, or you notice your JSON file doesn't seem to be be loaded you can manually reload your window through the command pallette (cmd/ctrl+Shift+P) and trigger "Reload Window".

## Search by the translation string to find any components that text exists within.

![alt text](translation_search.png)

Use the command prompt (`Command+Shift+P`) and use the "Translation search" function. Enter in a string you are searching for and the results will be provided with any components that have a translation string that match your query.

## Hover over translation to display the translation text

![alt text](hover_over.png)

## Copy new translation references and search for references with your JSON file

![alt text](find_references.png)

Within the translation json file you can hover over a key to see the combined string of the parent keys. Copy this text with the "Copy text" button, and do a Find All search for components that reference this string.

#### Installing from VSIX

If you have the VSIX file you can install this by opening the "Extensions" panel in VSCode and choosing "Install from VSIX" from the sub-menu at the top of the sidebar.

![alt text](vsix_menu.png)

### Publishing/Updating

If personal access token (PAT) has expired then go get a new one: https://dev.azure.com/myUserName/_usersSettings/tokens

Then in the cli use `vsce` (use npx if package `@vscode/vsce` not installed locally) to package and then publish (also login if a new PAT is used). In this order:
`vsce login <publishName>` (only if PAT is new)
`vsce package`
`vsce publish`

Then go verify your publisher page that the version was received:
https://marketplace.visualstudio.com/manage/publishers/<publisherName>
