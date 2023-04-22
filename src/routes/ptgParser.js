/*

1 - Split les prestations
2 - Avant de push les prestations 
	
	-> Save original text
	-> GetCoreInfos
	-> SplitData
	-> Replace text



*/
import {codesPrestationsBruto, codesPrestationsInterpreted} from './codesGroupS.js'
import {toBeTagged} from './009_parsing.js'



export function splitPrestation(ptgText) {

	let ptg = ptgText.split('\n')
	let intro = []
	let prestations = []
	let currentPrestation = []

	for (let i = 0; i < ptg.length ; i++) {

		let line = ptg[i]

		if (line.length === 0) {
			continue
		}

		if (line.startsWith('006')) {

			let coreInfos = getCoreInfos(currentPrestation)
			let splitInfos = splitData(currentPrestation)

			prestations.push( {
				original : currentPrestation,
				coreInfos,
				splitInfos
			})

			currentPrestation = []
		}

		currentPrestation.push(line)
	}
	return prestations.slice(1)
}


function getCoreInfos(prestation) {

	let coreInfos = {
		nom : '008NOM',
		prenom : '008PRE'
	}

	let infos = {}
	// nom prenom

	for (let line of prestation) {

		for (let info in coreInfos) {
			if (line.startsWith(coreInfos[info])) {
				infos[info] = line.replace(coreInfos[info], '')
			}
		}
	}

	// 

	return infos
}


function splitData(prestation) {

	let typeInfos = {
		personalInfos : "008",
		workerHours : "009",
		prestationsCode : "011",
		contractLine : '026',
		payType : "003",
		workPeriod : "006"
	}

	let prestationInfos = {

	}


	for (let line of prestation) {
		for (let info in typeInfos) {
			if (line.startsWith(typeInfos[info])) {

				if (prestationInfos[info]) { prestationInfos[info].push(line)}
				else {prestationInfos[info] = [line]} 
			}
		}
	}
	return prestationInfos
}


export function tagPrefix(line) {

	for (let i = 0 ; i < toBeTagged.length; i++) {
		let highlight = toBeTagged[i]
		if (line.startsWith(highlight.condition)) {
			let repl_value = `<span class="${highlight.className}"> ${line.slice(highlight.startIndex, highlight.endIndex)} </span>`
			line = line.slice(0, highlight.startIndex) + repl_value + line.slice(highlight.endIndex) 
		}
	}
	return line

}

export function workedHoursDetails(line) {

	let part1 = line.split()[0]
	let part2 = line.split(/[+-]/)[1]
	let code = ''

	let date = part1.slice(3,11)
	date = date.slice(6,8) + " - " + date.slice(4,6) + " - " + date.slice(0,4)

	let codePrestation = part1.slice(11, 14)
	if (codesPrestationsBruto[codePrestation]) {
		code = codesPrestationsBruto[codePrestation]
	}

	let duration = part2.slice(0, 4)
	duration = "Durée :" + duration.slice(0,2)+ "h" + duration.slice(2,4) + "m"

	let value = part2.slice(24,30)
	value = '  Salaire horaire :  ' + (parseFloat(value)/10000).toFixed(4).toString() + ' €'


	let allInfos = [code, date, duration, value]
	return allInfos.join(' | ')


}

export function prestationCodeDetails(line) {

	let part1 = line.split()[0]
	let part2 = line.split(/[+-]/)[1]
	let code = ''

	let codePrestation = part1.slice(3, 7)
	if (codesPrestationsInterpreted[codePrestation]) {
		code = codesPrestationsInterpreted[codePrestation]
	}


	let quantite = part2.slice(0,11)
	quantite = (parseFloat(quantite)/10000).toString() + " unités" 

	let montant = part2.slice(12,22)
	montant = (parseFloat(montant)/10000).toString() + ' € / u'

	let pourcentage = part2.slice(22, 25) + ' %'


	let allInfos = [code, quantite, montant, pourcentage]
	return allInfos.join(' | ')


}