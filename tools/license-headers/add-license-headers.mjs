import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { extname, join } from "path";
import process from "node:process";
import console from "console";

const COMMENT_STYLES = {
  ".html": { prefix: "<!--", suffix: "-->" },
  ".scss": { prefix: "// " },
  ".ts": { prefix: "// " },
};

function loadHeaderLines(headerPath) {
  const rawText = readFileSync(headerPath, "utf8");
  return rawText.split("\n").map((t) => {
    return t.replace("%YEAR%", new Date().getFullYear()).trim();
  });
}

function formatHeader(ext, text) {
  const style = COMMENT_STYLES[ext];
  if (!style) {
    return null;
  }
  const resolveSuffix = style.suffix ? " " + style.suffix : "";

  let out = `${style.prefix} ===BEGIN LICENSE===\n`;
  out += text.map((t) => `${style.prefix} ${t}${resolveSuffix}`).join("\n");
  out += `===END LICENSE===${resolveSuffix}`;

  return out;
}

function applyLicense(filePath, headerLines) {
  const ext = extname(filePath);
  const formattedHeader = formatHeader(ext, headerLines);

  if (!formattedHeader) {
    // file's type doesn't match any definition for header annotation
    return;
  }

  const content = readFileSync(filePath, "utf8");

  if (content.match(/^.*?=== BEGIN LICENSE ===.*?=== END LICENSE ===/gm)) {
    return;
  }

  console.log(`Mark: ${filePath}`);
  const newContent = formattedHeader + "\n\n" + content;
  writeFileSync(filePath, newContent, "utf8");
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

if (process.argv.length < 1) {
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
