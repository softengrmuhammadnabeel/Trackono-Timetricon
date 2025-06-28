
// import { useEffect, useRef } from "react";
// import { getScreenshotableWindows, getWindowScreenshot } from "tauri-plugin-screenshots-api";

// function useContinuousScreenshots(isActive:boolean, interval = 5000) {
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     if (!isActive) {
//       // Stop taking screenshots if not active
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//       return;
//     }

//     async function captureScreenshot() {
//       try {
//         const windows = await getScreenshotableWindows();
//         console.log(`${windows.length} screenshotable windows found`);

//         if (windows.length > 0) {
//           const path = await getWindowScreenshot(windows[0].id);
//           console.log(`Screenshot saved at: ${path}`);
//         } else {
//           console.warn("No screenshotable windows found");
//         }
//       } catch (error) {
//         console.error("Error capturing screenshot:", error);
//       }
//     }

//     // Start the interval to continuously capture screenshots
//     intervalRef.current = setInterval(() => {
//       captureScreenshot();
//     }, interval);

//     // Cleanup interval on unmount or deactivation
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [isActive, interval]);

//   return null; // Hooks don't render anything
// }

// export default useContinuousScreenshots;
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
// import { readBinaryFile } from "@tauri-apps/plugin-fs";

import { useEffect, useRef } from "react";
import { getScreenshotableMonitors, getMonitorScreenshot } from "tauri-plugin-screenshots-api";

function useContinuousScreenshots(isActive: boolean, interval = 5000) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Stop taking screenshots if not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    async function captureScreenshot() {
      try {
        const windows = await getScreenshotableMonitors();
        console.log(`${windows.length} screenshotable windows found`);

        if (windows.length > 0) {
          console.log(windows);
          let defaultPath = await getMonitorScreenshot(windows[0].id);
          console.log(`Screenshot saved at: ${defaultPath}`);
          // const binaryData = await readFile(defaultPath);
          if (defaultPath.startsWith("\\\\")) {
            defaultPath = defaultPath.replace(/^\\\\\\?\\/, "");
            console.log("defaultPath after sanitization:", defaultPath);
          }

          // Read the file after sanitizing the path
          const binaryData = await readFile(defaultPath, {  }); // Null baseDir for absolute paths
          console.log("-----------------", binaryData);

          // const binaryData = await readFile(defaultPath, { baseDir: BaseDirectory.Resource });
          // console.log("-----------------", binaryData);
        } else {
          console.warn("No screenshotable windows found");
        }
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    }

    // Start the interval to continuously capture screenshots
    intervalRef.current = setInterval(() => {
      captureScreenshot();
    }, interval);

    // Cleanup interval on unmount or deactivation
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, interval]);

  return null; // Hooks don't render anything
}

export default useContinuousScreenshots;
