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
	//magicButton.onclick = NOW
	magicButton.appendChild(monk);

	const magicCell = document.createElement('td');
	magicCell.classList.add('$scriba_monk');
	magicCell.appendChild(magicButton);

	attemptRow.getElementsByClassName('$scriba_monk')[ 0 ]?.remove();
	attemptRow.appendChild(magicCell);
})
