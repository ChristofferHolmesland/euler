const axios = require("axios");
const htmlparser = require("htmlparser");
const select = require("soupselect").select;

const { saveFile, loadFile } = require("./dataloader");

async function getSiteDOM(url) {
	const resp = await axios({
		method: "GET",
		url: url
	});

	const htmlHandler = new htmlparser.DefaultHandler(function(error, dom) {
		return dom;
	});

	const htmlParser = new htmlparser.Parser(htmlHandler);
	htmlParser.parseComplete(resp.data);

	return htmlHandler.dom;
}

function getProblems(page) {
	const tds = select(page, "td");
	const problems = new Array(tds.length / 3);

	for (let i = 0; i < tds.length; i += 3) {
		problems[i / 3] = {
			id: tds[i].children[0].data,
			title: tds[i+1].children[0].children[0].data,
			solvedBy: tds[i+2].children[0].children[0].data,
			description: undefined,
			userSolvedTimestamp: undefined,
			userSolution: undefined,
			ttl: Date.now()
		};
	}

	return problems;
}

async function viewProblemDetails(i, problems) {
	document.getElementById("problem-id").innerHTML = problems[i].id;
	document.getElementById("problem-title").innerHTML = problems[i].title;
	document.getElementById("problem-solvedby").innerHTML = problems[i].solvedBy;

	if (problems[i].description !== undefined) {
		document.getElementById("problem-description").innerHTML = problems[i].description;
		return;
	}

	const resp = await axios({
		method: "GET",
		url: "https://projecteuler.net/minimal=" + problems[i].id
	});

	const problemHtml = resp.data;
	document.getElementById("problem-description").innerHTML = problemHtml;
	problems[i].description = problemHtml;
	saveFile(problems);
}

function displayProblemsList(problems) {
	const problemList = document.getElementById("problem-list");

	for (let i = 0; i < problems.length; i++) {
		const id = document.createElement("span");
		const title = document.createElement("span");
		const solvedBy = document.createElement("span");

		id.innerHTML = problems[i].id;
		title.innerHTML = problems[i].title;
		solvedBy.innerHTML = problems[i].solvedBy;

		const listItem = document.createElement("div");
		listItem.classList.add("problem-list-item");
		listItem.addEventListener("click", () => viewProblemDetails(i, problems));

		listItem.appendChild(id);
		listItem.appendChild(title);
		listItem.appendChild(solvedBy);

		problemList.appendChild(listItem);
	}
}

window.addEventListener("DOMContentLoaded", async () => {
	const problems = await loadFile();

	const frontPage = await getSiteDOM("https://projecteuler.net/archives");

	if (problems.length === 0) {
		const paginationDiv = select(frontPage, "div.pagination");
		const numPages = paginationDiv[0].children.length;
		problems.push(...getProblems(frontPage));

		for (let i = 2; i < numPages; i++) {
			const page = await getSiteDOM("https://projecteuler.net/archives;page=" + i);
			problems.push(...getProblems(page));
		}

		saveFile(problems);
	}

	displayProblemsList(problems);
});