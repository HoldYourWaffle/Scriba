import { Browser } from 'webextension-polyfill-ts'

declare global {
	// Ambient module declaration to expose modular definitions as global
	const browser: Browser;
}


