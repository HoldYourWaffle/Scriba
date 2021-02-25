import { Browser } from 'webextension-polyfill-ts'

declare global {
	// Ambient module declaration to expose modular definitions as global
	const browser: Browser;
	
	// Declaring in global scope because modules would require a build setup

	interface QuestionAnswer {
		/** Question number visible to user */
		visibleIndex: number;
		
		/** XXX for now we're only dealing with simple yes/no questions */
		answer: { [answerText: string]: boolean };
		
		//TODO partial correctness, i.e. some answers of a checkbox were correct
		correct: boolean;
		
		//TODO flagedness
	}
}


