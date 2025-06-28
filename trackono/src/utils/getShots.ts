import {
  getScreenshotableWindows,
  getWindowScreenshot,
} from "tauri-plugin-screenshots-api";

const windows = await getScreenshotableWindows();
const path = await getWindowScreenshot(windows[0].id);
console.log(path); // xx/tauri-plugin-screenshots/window-{id}.png