const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data");

/*
	File format:
	id;;;title;;;solvedBy;;;description;;;userSolvedTimestamp;;;userSolution;;;ttl\n

	description: Base64 encoding of problem description
	ttl: Timestamp when data was retrieved from projecteuler.net
*/

async function saveFile(problems) {
	const problemsText = new Array(problems.length);

	for (let i = 0; i < problems.length; i++) {
		let base64description = "undefined";
		if (problems[i].description !== undefined) {
			Buffer.from(problems[i].description).toString("base64")
		}

		problemsText[i] = [
			problems[i].id ?? "undefined",
			problems[i].title ?? "undefined",
			problems[i].solvedBy ?? "undefined",
			base64description ?? "undefined",
			problems[i].userSolvedTimestamp ?? "undefined",
			problems[i].userSolution ?? "undefined",
			problems[i].ttl ?? "undefined"
		].join(";;;");
	}

	return fs.writeFileSync(DATA_FILE, problemsText.join("\n"));
}

async function loadFile() {
	if (!fs.existsSync(DATA_FILE)) return [];

	const fileContent = fs.readFileSync(DATA_FILE);
	const lines = fileContent.toString().split("\n");

	const problems = [];
	for (let i = 0; i < lines.length; i++) {
		const parts = lines[i].split(";;;");
		parts[3] = Buffer.from(parts[3], "base64").toString();

		for (let j = 0; j < parts.length; j++) {
			if (parts[j] === "undefined") parts[j] = undefined;
		}

		problems.push({
			id: parts[0],
			title: parts[1],
			solvedBy: parts[2],
			description: parts[3],
			userSolvedTimestamp: parts[4],
			userSolution: parts[5],
			ttl: parts[6]
		});
	}
	
	return problems;
}

module.exports = {
	saveFile: saveFile,
	loadFile: loadFile
};