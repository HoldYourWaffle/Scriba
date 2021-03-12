import { Browser } from 'webextension-polyfill-ts'

declare global {
	// Ambient module declaration to expose modular definitions as global
	const browser: Browser | undefined;
	
	// Fucking chrome
	const chrome: Browser | undefined;
	
	// Declaring in global scope because modules would require a build setup

	interface AnsweredQuestion {
		/** Question number visible to user */
		visibleIndex: number;
		
		type: QuestionType;
		
		/** XXX for now we're only dealing with simple yes/no questions */
		answer: Answer;
		
		//TODO partial correctness, i.e. some answers of a checkbox were correct
		correct: boolean;
		
		//TODO flagedness
	}
	
	
	type Answer = MultiChoiceAnswer | NumericalAnswer;
	
	interface MultiChoiceAnswer {
		[answerText: string]: boolean;
	}
	
	type NumericalAnswer = number;
}
