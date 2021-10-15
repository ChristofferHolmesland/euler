const axios = require("axios");
const htmlparser = require("htmlparser");
const select = require("soupselect").select;

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
			solvedBy: tds[i+2].children[0].children[0].data
		};
	}

	return problems;
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

		listItem.appendChild(id);
		listItem.appendChild(title);
		listItem.appendChild(solvedBy);

		problemList.appendChild(listItem);
	}
}

window.addEventListener("DOMContentLoaded", async () => {
	const frontPage = await getSiteDOM("https://projecteuler.net/archives");

	const paginationDiv = select(frontPage, "div.pagination");
	const numPages = paginationDiv[0].children.length - 1;

	const problems = [...getProblems(frontPage)];

	displayProblemsList(problems);
});