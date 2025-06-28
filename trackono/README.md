# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)



{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": [
    "main"
  ],
  "permissions": [
    "screenshots:default",
    "core:default",
    "opener:default",
    "fs:default",
    {
      "identifier": "fs:scope-appdata",
      "allow": [{ "path": "$$APPDATA/**/*" }]
    },
    {
      "identifier": "fs:scope-appdata-index",
      "allow": [{ "path": "$$APPDATA/**/*" }]
    },
    {
      "identifier": "fs:scope-desktop-index",
      "allow": [{ "path": "$$APPDATA/**/*" }]
    },
    {
      "identifier": "fs:scope-desktop",
      "allow": [{ "path": "$$DESKTOP/**/*" }]
    }
  ]
}