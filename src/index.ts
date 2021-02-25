const cmid = parseInt(new URLSearchParams(document.location.search).get('id')!);
const attempts = document.querySelectorAll("table.quizattemptsummary tbody tr");
const parser = new DOMParser();
const t = '  '; // spacer smaller than tabs

// Fucking chrome
const runtime = chrome != undefined ? chrome.runtime : browser!.runtime;


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
	monk.src = runtime.getURL('buddha.png');
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

async function doMonkTask(cmid: number, sourceAttempt: number) {
	console.log('Here we go again... (⇀‸↼‶)')
	
	const answers = await getAnswersForAttempt(cmid, sourceAttempt);
	console.log(answers);
	
	
	const { attemptId, pages } = await fetchNextAttempt();
	console.log(`Next attempt: ${attemptId}`);
	
	
	// We need to skip 'description' type "questions", so we need to keep a global counter
	let visibleIndex = 1;
	
	for (let page = 0; page <= pages; page++) {
		console.log(`Page ${page+1}/${pages+1}`);
		const formData = new FormData();
		
		const attemptPage = await fetch(`https://oncourse.tue.nl/2020/mod/quiz/attempt.php?attempt=${attemptId}&page=${page}&cmid=${cmid}`);
		const form = parser.parseFromString(await attemptPage.text(), 'text/html').getElementById('responseform')!;
		const questions = form.getElementsByClassName('que');
		
		
		for (let realIndex = 0; realIndex < questions.length; realIndex++) {
			const question = questions[realIndex];
			
			if (question.classList.contains('informationitem')) {
				console.log(`${t}Question element ${realIndex} is informational -> skipping`);
				continue;
			} else if (!question.classList.contains('multichoice')) {
				throw new Error(`Unknown question type for element ${realIndex}: ${question.classList}`);
			}
			
			
			const questionNumber = visibleIndex++;
			const questionAnswer = answers[questionNumber-1];
			
			
			console.log(`${t}Question element ${realIndex} is question ${questionNumber}`);
			
			if (questionAnswer.visibleIndex !== questionNumber) {
				throw new Error(`Something is wrong, I can feel it: answer for question #${questionNumber} does not have the correct visibleIndex (${questionAnswer.visibleIndex})`);
			} else if (!questionAnswer.correct) {
				console.log(`${t}${t}Answer for ${questionNumber} was not correct -> skipping`);
				continue;
			}
			
			
			// Copy over the non-hidden inputs
			const answerInputs = question.querySelectorAll('.answer input[type]:not([type=hidden])') as NodeListOf<HTMLInputElement>;
			
			// Assuming uniform input type per question
			if (answerInputs[0].type === 'radio') {
				console.log(`${t}This is a radio question`);
				handleRadio(formData, questionAnswer, answerInputs);
			} else if (answerInputs[0].type === 'checkbox') {
				console.log(`${t}This is a checkbox question`);
				handleCheckbox(formData, questionAnswer, answerInputs);
			} else {
				throw new Error(`Unknown answer input type: ${answerInputs[0].type}`);
			}
			
			
			// Copy over sequencecheck
			const sequenceCheckInput = question.querySelector('input[type=hidden][name$=":sequencecheck"') as HTMLInputElement;
			formData.set(sequenceCheckInput.name, sequenceCheckInput.value);
		}
		
		
		// Copying some additional hidden data
		const hiddenDataKeys = [ 'attempt', 'sesskey', 'followingpage', 'nextpage', 'timeup', 'scrollpos', 'slots' ];
		for (let hiddenKey of hiddenDataKeys) {
			const hiddenInput = form.querySelector(`input[name=${hiddenKey}]`) as HTMLInputElement;
			if (hiddenInput != null) {
				formData.set(hiddenKey, hiddenInput.value);
			}
		}
		
		
		/* console.log(`${t}Submitting data for page ${page+1}:`);
		formData.forEach((value, key) => console.log(`${t}${t}${key} = ${value}`)); */
		
		
		const submitResponse = await fetch(`https://oncourse.tue.nl/2020/mod/quiz/processattempt.php?cmid=${cmid}`, { method: 'post', body: formData, credentials: 'include' });
		console.log(`${t}Response: ${submitResponse.status} ${submitResponse.statusText}`);
		
		if (!submitResponse.ok) {
			throw new Error(`POST response was not OK :(`);
		}
	}
	
	console.log('Done ヾ(￣0￣ )ノ');
	alert('☆ﾟ*｡ The magical monk has copied your correct answers ｡*☆ﾟ');
}


async function getAnswersForAttempt(cmid: number, attempt: number): Promise<QuestionAnswer[]> {
	console.log(`Fetching answers for attempt ${attempt}`);
	
	//XXX does this have pagination?
	const response = await fetch(`https://oncourse.tue.nl/2020/mod/quiz/review.php?attempt=${attempt}&cmid=${cmid}`);
	const html = parser.parseFromString(await response.text(), 'text/html');

	const questionAnswers: QuestionAnswer[] = [];

	html.querySelectorAll('.que').forEach(question => {
		const realIndex = getQuestionId(question);

		if (question.classList.contains('informationitem')) {
			//console.log(`${t}Question element ${realIndex} is informational -> skipping`);
			return;
		}

		if (!question.classList.contains('multichoice')) {
			throw new Error(`Unknown question type for ${realIndex}: ${question.classList}`);
		}


		const answerInputs = question.querySelectorAll('.content .formulation .ablock .answer input') as NodeListOf<HTMLInputElement>;


		const answer: { [ answerText: string ]: boolean } = {};

		answerInputs.forEach(answerInput => {
			if (answerInput.type !== 'checkbox' && answerInput.type !== 'radio') {
				throw new Error(`Unknown answer input type: ${answerInput.type}`);
			}
			
			const answerLabel = answerInput.labels![0];
			const answerText = getOrphanInnerText(answerLabel);

			answer[answerText] = answerInput.hasAttribute('checked');
		});


		questionAnswers.push({
			answer,
			visibleIndex: questionAnswers.length + 1,
			correct: question.classList.contains('correct')
		})
	})

	return questionAnswers;
}


async function fetchNextAttempt(): Promise<{ attemptId: number, pages: number }> {
	const action = 'https://oncourse.tue.nl/2020/mod/quiz/startattempt.php';
	
	// 'Continue' button is contained in a form which we need to submit to get the attempt id
	const continueForms = document.querySelectorAll(`form[action="${action}"]`);
	if (continueForms.length !== 1) {
		throw new Error(`Incorrect amount of 'startattempt' forms: ${continueForms.length}`);
	}
	
	//XXX not documented on MDN, but seems to be working
	// https://stackoverflow.com/a/46642899/10434371
	const continueFormData = new URLSearchParams(new FormData(continueForms[0] as HTMLFormElement) as any);
	
	// Will redirect to the last visited page of the attempt
	const lastVisited = await fetch(action, { method: 'post', body: continueFormData });
	
	const url = new URLSearchParams(new URL(lastVisited.url).search);
	const attemptId = parseInt(url.get('attempt')!);
	
	if (cmid != parseInt(url.get('cmid')!)) {
		throw Error(`Something is wrong, I can feel it: currently on cmid ${cmid}, but next attempt reports ${url.get('cmid')}`);
	}
	
	const lastVisitedDocument = parser.parseFromString(await lastVisited.text(), 'text/html');
	const questionNavigators = lastVisitedDocument.querySelectorAll('a.qnbutton[data-quiz-page]');
	
	// The list of navigators is sorted, the last element will report the last page index
	const pages = parseInt(questionNavigators[questionNavigators.length-1].getAttribute('data-quiz-page')!);
	
	return { attemptId, pages };
}


function handleRadio(formData: FormData, questionAnswer: QuestionAnswer, answerInputs: NodeListOf<HTMLInputElement>) {
	// Find the answer option that was set to true
	for (let answerOption in questionAnswer.answer) {
		if (!questionAnswer.answer[answerOption]) {
			// This aint it
			continue;
		}
		
		
		// Find the input that corresponds to this input
		let answerOptionName = null as string | null;
		let answerOptionValue = null as string | null;
		
		for (let i = 0; i < answerInputs.length; i++) {
			const answerInputLabel = getOrphanInnerText(answerInputs[i].labels![0]);
			
			if (answerOption !== answerInputLabel) {
				// This aint it
				continue;
			}
			
			answerOptionName = answerInputs[i].name;
			answerOptionValue = answerInputs[i].value;
			
			console.log(`${t}${t}Answer ${answerInputLabel} (${answerOptionValue}) was chosen`);
			break;
		}
		
		if (answerOptionName == null || answerOptionValue == null) {
			throw new Error(`Something is wrong, I can feel it: no answer selected in radio question`);
		}
		
		formData.set(answerOptionName, answerOptionValue);
		break;
	}
}


function handleCheckbox(formData: FormData, questionAnswer: QuestionAnswer, answerInputs: NodeListOf<HTMLInputElement>) {
	// Check for each option if it was set to true
	answerInputs.forEach(answerOption => {
		const answerOptionText = getOrphanInnerText(answerOption.labels![0]);
		const wasSelected = questionAnswer.answer[answerOptionText];
		
		console.log(`${t}${t}Answer '${answerOptionText}' was set to ${wasSelected}`);
		formData.set(answerOption.name, wasSelected ? '1' : '0');
	})
}


/** Returns X in #question-YYYYY-XX */
function getQuestionId(questionElement: Element) {
	return parseInt(questionElement.id.substring(questionElement.id.lastIndexOf('-') + 1))
}


/** Returns the innertext of an element that's not contained in a subelement */
function getOrphanInnerText(el: Element): string {
	let answerText = '';
	for (let i = 0; i < el.childNodes.length; ++i) {
		if (el.childNodes[i].nodeType === Node.TEXT_NODE) {
			answerText += el.childNodes[i].textContent;
		}
	}
	return answerText;
}
