// @ts-ignore
/** @typedef {import("./structure.js")} */

"use strict";

void async function () {
	try {
		//#region Definition
		const inputDataFrom = document.querySelector(`input#data-from`);
		if (!(inputDataFrom instanceof HTMLInputElement)) {
			throw new TypeError(`Invalid element: ${inputDataFrom}`);
		}

		const labelDataFrom = document.querySelector(`label[for="data-from"]`);
		if (!(labelDataFrom instanceof HTMLLabelElement)) {
			throw new TypeError(`Invalid element: ${labelDataFrom}`);
		}

		const inputDataTo = document.querySelector(`input#data-to`);
		if (!(inputDataTo instanceof HTMLInputElement)) {
			throw new TypeError(`Invalid element: ${inputDataTo}`);
		}

		const labelDataTo = document.querySelector(`label[for="data-to"]`);
		if (!(labelDataTo instanceof HTMLLabelElement)) {
			throw new TypeError(`Invalid element: ${labelDataTo}`);
		}

		const inputMinFactor = document.querySelector(`input#min-factor`);
		if (!(inputMinFactor instanceof HTMLInputElement)) {
			throw new TypeError(`Invalid element: ${inputMinFactor}`);
		}

		const buttonConvertData = document.querySelector(`button#convert-data`);
		if (!(buttonConvertData instanceof HTMLButtonElement)) {
			throw new TypeError(`Invalid element: ${buttonConvertData}`);
		}
		//#endregion
		//#region Initialize
		inputDataFrom.addEventListener(`change`, (event) => {
			labelDataFrom.setAttribute(`aria-checked`, (inputDataFrom.files ? inputDataFrom.files[0] !== undefined : false).toString());
			buttonConvertData.disabled = !(labelDataFrom.getAttribute(`aria-checked`) === `true` && labelDataTo.getAttribute(`aria-checked`) === `true`);
		});

		inputDataTo.addEventListener(`change`, (event) => {
			labelDataTo.setAttribute(`aria-checked`, (inputDataTo.files ? inputDataTo.files[0] !== undefined : false).toString());
			buttonConvertData.disabled = !(labelDataFrom.getAttribute(`aria-checked`) === `true` && labelDataTo.getAttribute(`aria-checked`) === `true`);
		});

		inputMinFactor.value = `${ThemeSheet.minFactor}`;
		inputMinFactor.addEventListener(`change`, (event) => {
			ThemeSheet.minFactor = Number(inputMinFactor.value);
		});

		buttonConvertData.addEventListener(`click`, async (event) => {
			try {
				const fromFiles = inputDataFrom.files;
				if (fromFiles === null || fromFiles[0] === undefined) {
					throw new TypeError(`From files not detected`);
				}
				const toFiles = inputDataTo.files;
				if (toFiles === null || toFiles[0] === undefined) {
					throw new TypeError(`To files not detected`);
				}
				const fromFile = fromFiles[0];
				const toFile = toFiles[0];
				const fromData = await fromFile.text();
				const toData = await toFile.text();
				const fromSheet = ThemeSheet.parse(fromData);
				const toSheet = ThemeSheet.parse(toData);
				ThemeSheet.convert(fromSheet, toSheet);
				Manager.download(new File([ThemeSheet.export(toSheet)], `${toFile.name}`));
			} catch (error) {
				Manager.prevent(error);
			}
		});
		//#endregion
	} catch (error) {
		Manager.prevent(error);
	}
}();