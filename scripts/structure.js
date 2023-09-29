// @ts-ignore
/** @typedef {import("./components/archive.js")} */
// @ts-ignore
/** @typedef {import("./components/manager.js")} */

"use strict";

//#region Them key
/**
 * @extends {Set<String>}
 */
class ThemeKey extends Set {
	/**
	 * @param {ThemeKey} source 
	 */
	static export(source) {
		return source.#source;
	}
	/**
	 * @param {ThemeKey} first 
	 * @param {ThemeKey} second 
	 * @returns [0 - 1]
	 */
	static compare(first, second) {
		/** @type {Map<String, Number>} */ const counter = new Map();
		for (const part of [...first, ...second]) {
			counter.set(part, (counter.get(part) ?? 0) + 1);
		}
		let length = 0, match = 0;
		for (const [part, count] of counter) {
			if (count > 1) {
				match++;
			}
			length++;
		}
		return (match / length);
	}
	/**
	 * @param {String} text 
	 */
	constructor(text) {
		super(text.split(/(?=[A-Z])|(?:_)/).map(part => {
			part = part.toLowerCase();
			switch (part) {
				case `fg`: return `foreground`;
				case `bg`: return `background`;
				default: return part;
			}
		}));
		this.#source = text;
	}
	/** @type {String} */ #source;
	toString() {
		return Array.from(this).join(`-`);
	}
}
//#endregion
//#region Theme property
class ThemeProperty {
	/**
	 * @param {ThemeProperty} source 
	 */
	static export(source) {
		return `${ThemeKey.export(source.key)}: ${source.value}`;
	}
	/**
	 * @param {ThemeProperty} first 
	 * @param {ThemeProperty} second 
	 */
	static compare(first, second) {
		return ThemeKey.compare(first.key, second.key);
	}
	/**
	 * @param {ThemeProperty} source 
	 */
	static clone(source) {
		return new ThemeProperty(source.key, source.value);
	}
	/**
	 * @param {ThemeKey} key 
	 * @param {String} value 
	 */
	constructor(key, value) {
		this.key = key;
		this.value = value;
	}
	/** @type {ThemeKey} */ #key = new ThemeKey(``);
	get key() {
		return this.#key;
	}
	set key(value) {
		this.#key = value;
	}
	/** @type {String} */ #value = ``;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
	}
	clone() {
		ThemeProperty.clone(this);
	}
	toString() {
		return `${this.key}: ${this.value}`;
	}
}
//#endregion
//#region Theme sheet
/**
 * @extends {Array<ThemeProperty>}
 */
class ThemeSheet extends Array {
	/**
	 * @param {ThemeSheet} source 
	 */
	static export(source) {
		return source.map(property => ThemeProperty.export(property)).join(`\n`);
	}
	/**
	 * @param {String} text 
	 */
	static parse(text) {
		const sheet = new ThemeSheet();
		for (const row of text.split(/\s*\n\s*/)) {
			if (row) {
				const match = /(\S+)\s*:\s*(\S+)/.exec(row);
				if (match === null) {
					throw new SyntaxError(`Invalid '${row}' row syntax`);
				}
				const [, key, value] = match;
				sheet.push(new ThemeProperty(new ThemeKey(key), value));
			}
		}
		return sheet;
	}
	/** @type {Number} */ static #minFactor = 0.4;
	static get minFactor() {
		return this.#minFactor;
	}
	static set minFactor(value) {
		if (0 <= value && value <= 1) {
			this.#minFactor = value;
		} else throw new RangeError(`Value ${value} out of range [0 - 1]`);
	}
	/**
	 * @param {ThemeSheet} from 
	 * @param {ThemeSheet} to 
	 */
	static convert(from, to) {
		for (const fromProperty of from) {
			for (const toProperty of to) {
				const factor = ThemeProperty.compare(fromProperty, toProperty);
				if (factor >= ThemeSheet.minFactor) {
					console.log(`${ThemeKey.export(toProperty.key)}: ${toProperty.value} → ${fromProperty.value}`);
					toProperty.value = fromProperty.value;
				}
			}
		}
	}
}
//#endregion
//#region Settings
/**
 * @typedef {{}} SettingsNotation
 */

class Settings {
	/**
	 * @param {SettingsNotation} source 
	 */
	static import(source) {
		const result = new Settings();
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		return result;
	}
	reset() {
		const settings = new Settings();
		// TODO
	}
}
//#endregion
//#region Metadata
const metaAuthor = document.querySelector(`meta[name="author"]`);
if (!(metaAuthor instanceof HTMLMetaElement)) {
	throw new TypeError(`Invalid element: ${metaAuthor}`);
}
const developer = metaAuthor.content;

const metaApplicationName = document.querySelector(`meta[name="application-name"]`);
if (!(metaApplicationName instanceof HTMLMetaElement)) {
	throw new TypeError(`Invalid element: ${metaApplicationName}`);
}
const title = metaApplicationName.content;

const search = Manager.getSearch();
const reset = search.get(`reset`);
if (reset !== undefined) {
	if (reset === `all`) {
		for (let index = 0; index < localStorage.length; index++) {
			const value = localStorage.key(index);
			if (value === null) {
				throw new RangeError(`Index out of range`);
			}
			localStorage.removeItem(value);
		}
	} else {
		localStorage.removeItem(reset);
	}
}

/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${developer}.${title}.Settings`, Settings.export(new Settings()));

const settings = Settings.import(archiveSettings.data);
//#endregion
