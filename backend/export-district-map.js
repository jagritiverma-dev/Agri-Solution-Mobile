
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const backendDir = __dirname;
const svgFile = path.join(
  backendDir,
  "Chhattisgarh_districts_map.svg"
);
const jsFile = path.join(backendDir, "js", "maya.js");
const outputDir = path.resolve(
  backendDir,
  "..",
  "mobile",
  "src",
  "data"
);

if (!fs.existsSync(svgFile)) {
  throw new Error(`SVG file not found: ${svgFile}`);
}

if (!fs.existsSync(jsFile)) {
  throw new Error(`District database not found: ${jsFile}`);
}

const svg = fs.readFileSync(svgFile, "utf8");
const source = fs.readFileSync(jsFile, "utf8");

const startMarker = "const districtInformationDatabase =";
const start = source.indexOf(startMarker);

if (start === -1) {
  throw new Error("District database declaration not found.");
}

const objectStart = source.indexOf("{", start);
const endMarker = "\n};";
const objectEnd = source.indexOf(endMarker, objectStart);

if (objectStart === -1 || objectEnd === -1) {
  throw new Error("District database boundaries not found.");
}

// The original file is trusted local project source.
// Do not use this approach with untrusted JavaScript.
const objectSource = source.slice(objectStart, objectEnd + 2);
const districts = Function(
  `"use strict"; return (${objectSource});`
)();

const $ = cheerio.load(svg, { xmlMode: true });

const viewBox = $("svg").first().attr("viewBox");

if (!viewBox) {
  throw new Error("SVG viewBox is missing.");
}

const paths = $("path")
  .toArray()
  .filter((element) => {
    const id = $(element).attr("id");
    return Boolean(id && districts[id]);
  })
  .map((element) => {
    const id = $(element).attr("id");

    const transforms = [
      ...$(element)
        .parents("g")
        .toArray()
        .reverse()
        .map((parent) => $(parent).attr("transform")),
      $(element).attr("transform"),
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id,
      d: $(element).attr("d") || "",
      transform: transforms,
      outline: districts[id].districtName === "Chhattisgarh",
    };
  });

const districtList = Object.entries(districts)
  .filter(([, value]) => value.districtName !== "Chhattisgarh")
  .map(([id, value]) => ({
    id,
    ...value,
  }));

fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
  path.join(outputDir, "districtMapData.json"),
  JSON.stringify({ viewBox, paths }, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, "districtsData.json"),
  JSON.stringify(districtList, null, 2)
);

console.log("District map export completed.");
console.log("Map paths:", paths.length);
console.log("District records:", districtList.length);
console.log("Output:", outputDir);
