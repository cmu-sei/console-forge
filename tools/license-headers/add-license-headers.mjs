import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { extname, join } from "path";
import process from "node:process";
import console from "console";

const LICENSE_START = "===BEGIN LICENSE===";
const LICENSE_END = "===END LICENSE===";
const COMMENT_STYLES = {
  // TODO: problem stripping old license text in HTML files because of the suffix coming after the "end license" token
  // ".html": { prefix: "<!--", suffix: "-->" },
  ".scss": { prefix: "// " },
  ".ts": { prefix: "// " },
};

function loadHeaderLines(headerPath) {
  const rawText = readFileSync(headerPath, "utf8");
  const lines = rawText
    .split("\n")
    .map((t) => {
      return t.replace("%YEAR%", new Date().getFullYear()).trim();
    })
    .filter((t) => !!t.trim());

  return [LICENSE_START, ...lines, LICENSE_END];
}

function formatHeader(ext, text) {
  const style = COMMENT_STYLES[ext];
  if (!style) {
    return null;
  }

  return text
    .map((t) => `${style.prefix} ${t}${style.suffix ? " " + style.suffix : ""}`)
    .join("\n");
}

function applyLicense(filePath, headerLines) {
  const ext = extname(filePath);
  const formattedHeader = formatHeader(ext, headerLines);

  if (!formattedHeader) {
    // file's type doesn't match any definition for header annotation
    return;
  }

  const content = readFileSync(filePath, "utf8");

  console.log(`Mark: ${filePath}`);
  const contentLicenseStripped = stripOldLicense(content);
  const newContent = formattedHeader.trim() + "\n\n" + contentLicenseStripped;
  writeFileSync(filePath, newContent, "utf8");
}

/**
 * @param {string} content
 */
function stripOldLicense(content) {
  const regex = /[\s\S]*?===BEGIN LICENSE===([\s\S]*?)===END LICENSE===\n?/g;
  return content.replace(regex, "").trimStart();
}

function getAllFiles(dirPath, extensions, fileList = []) {
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, extensions, fileList);
    } else {
      if (extensions.indexOf(extname(filePath)) >= 0) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

if (process.argv.length < 2) {
  console.log(
    "Pass the root directory from which to mark and the file containing the license header text."
  );
}

const files = getAllFiles(process.argv[2], Object.keys(COMMENT_STYLES));

if (files.length === 0) {
  console.log("No files found for marking.");
} else {
  console.log(`Marking ${files.length} files...`);
}

const header = loadHeaderLines(process.argv[3]);
for (const file of files) {
  applyLicense(file, header);
}
