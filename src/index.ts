const cmid = parseInt(new URLSearchParams(document.location.search).get('id')!);
const attempts = document.querySelectorAll("table.quizattemptsummary tbody tr");
const parser = new DOMParser();


attempts.forEach(attemptRow => {
	const reviewCol = attemptRow.getElementsByClassName('c4')[ 0 ];
	const reviewLink = reviewCol.getElementsByTagName('a')[ 0 ]?.getAttribute('href')!;

	if (reviewLink == null) {
		// Not a reviewable attempt
		return;
	}

	const attemptQueryIndex = reviewLink.indexOf('attempt=');
	const attemptQueryEnd = reviewLink.indexOf('&', attemptQueryIndex);
	const attemptId = parseInt(reviewLink.substring(attemptQueryIndex + 8, attemptQueryEnd));


	const monk = document.createElement('img');
	monk.src = browser.runtime.getURL('buddha.png');
	monk.style.height = '2em';
	monk.style.cursor = 'pointer';

	const magicButton = document.createElement('a');
	magicButton.onclick = () => doMonkTask(cmid, attemptId);
	magicButton.appendChild(monk);

	const magicCell = document.createElement('td');
	magicCell.classList.add('$scriba_monk');
	magicCell.appendChild(magicButton);

	attemptRow.getElementsByClassName('$scriba_monk')[ 0 ]?.remove();
	attemptRow.appendChild(magicCell);
})


// Would love to put this in a separate module, but browser extensions are not allowed to use ESM
//  Using a build system just for this seems a bit much

async function doMonkTask(cmid: number, attempt: number) {
	const answers = await getAnswersForAttempt(cmid, attempt);
	console.log(answers);

	//NOW POST answers to ongoing attempt (/processattempt.php?cmid=XYZ)
	
	//SOON display some kind of message (the magical monk has done his magic)
}


async function getAnswersForAttempt(cmid: number, attempt: number): Promise<QuestionAnswer[]> {
	//XXX does this have pagination?
	const response = await fetch(`https://oncourse.tue.nl/2020/mod/quiz/review.php?attempt=${attempt}&cmid=${cmid}`);
	const html = parser.parseFromString(await response.text(), 'text/html');

	const questionAnswers: QuestionAnswer[] = [];

	html.querySelectorAll('.que').forEach(question => {
		const realIndex = parseInt(question.id.substring(question.id.lastIndexOf('-') + 1));

		if (question.classList.contains('informationitem')) {
			console.log(`Question element ${realIndex} in informational -> skipping`);
			return;
		}

		if (!question.classList.contains('multichoice')) {
			throw new Error(`Unknown question type: ${question.classList}`);
		}


		const answerInputs = question.querySelectorAll('.content .formulation .ablock .answer input') as NodeListOf<HTMLInputElement>;


		const answer: { [ answerText: string ]: boolean } = {};

		answerInputs.forEach(answerInput => {
			if (answerInput.type !== 'checkbox' && answerInput.type !== 'radio') {
				throw new Error(`Unknown answer input type: ${answerInput.type}`);
			}
			
			const answerLabel = answerInput.labels![0];
			let answerText = '';
			for (let i = 0; i < answerLabel.childNodes.length; ++i) {
				if (answerLabel.childNodes[i].nodeType === Node.TEXT_NODE) {
					answerText += answerLabel.childNodes[i].textContent;
				}
			}

			answer[answerText] = answerInput.hasAttribute('checked');
		});


		questionAnswers.push({
			realIndex, answer,
			visibleIndex: questionAnswers.length + 1,
			correct: question.classList.contains('correct')
		})
	})

	return questionAnswers;
}
