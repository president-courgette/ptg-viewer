/*

1 - Split les prestations
2 - Avant de push les prestations 
	
	-> Save original text
	-> GetCoreInfos
	-> SplitData
	-> Replace text



*/

import {codesMaladie, codesPrestationsBruto, codesPrestationsInterpreted} from './codesGroupS.js'
import {toBeTagged} from './009_parsing.js'


export function splitPrestation(ptgText) {

    let ptg = ptgText.split('\n')
    let intro = []
    let prestations = []
    let currentPrestation = []
    let rectificatif
    let got003 = false
    let periods = {
        startPeriod: undefined,
        endPeriod: undefined
    }

    for (let i = 0; i < ptg.length; i++) {

        let line = ptg[i]

        if (line.length === 0) {
            continue
        }
        if (line.startsWith('000')) {
            continue
        }

        if (line.startsWith('003')) {
            
            periods.startPeriod = reverseDate(line.slice(20, 28))
            periods.endPeriod = reverseDate(line.slice(28, 36))
            let value = line.slice(11, 13)

            if (value === "02") {
                rectificatif = false
            } else if (value === "04") {
                rectificatif = true
            } else {
                rectificatif = undefined
            }
            continue
        }

        if (line.startsWith('006')) {
            if (currentPrestation.length > 1) {
                prestations.push(prestationToPush(currentPrestation, rectificatif, periods))
            }
            currentPrestation = []
            
        }

        if (!line.startsWith('003')) {
            currentPrestation.push(line)
        }

    } // end of loop

    prestations.push(prestationToPush(currentPrestation, rectificatif, periods))
    console.log(prestations)
    return prestations

}


function prestationToPush(current, rectificatif, periods) {

    let coreInfos = getCoreInfos(current)
    let splitInfos = splitData(current)
    let absence = hasAbsence(splitInfos.workerHours)
    let noPrestation = !splitInfos.workerHours

    return {
        original: current,
        absence,
        noPrestation,
        periods,
        coreInfos,
        splitInfos,
        rectificatif,
    }
}

function getCoreInfos(prestation) {

    let coreInfos = {
        nom: '008NOM',
        prenom: '008PRE'
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
        personalInfos: "008",
        workerHours: "009",
        prestationsCode: "011",
        contractLine: '026',
        payType: "003",
        workPeriod: "006"
    }

    let prestationInfos = {}

    for (let line of prestation) {
        for (let info in typeInfos) {
            if (line.startsWith(typeInfos[info])) {

                if (prestationInfos[info]) {
                    prestationInfos[info].push(line)
                } else {
                    prestationInfos[info] = [line]
                }
            }
        }
    }
    return prestationInfos
}


export function tagPrefix(line) {

    for (let i = 0; i < toBeTagged.length; i++) {
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

    let date = part1.slice(3, 11)
    date = date.slice(6, 8) + " - " + date.slice(4, 6) + " - " + date.slice(0, 4)

    let codePrestation = part1.slice(11, 14)
    if (codesPrestationsBruto[codePrestation]) {
        code = codesPrestationsBruto[codePrestation]
    }

    let duration = part2.slice(0, 4)
    duration = "Durée :" + duration.slice(0, 2) + "h" + duration.slice(2, 4) + "m"

    let value = part2.slice(24, 30)
    value = '  Salaire horaire :  ' + (parseFloat(value) / 10000).toFixed(4).toString() + ' €'


    let allInfos = [code, date, duration, value]
    return allInfos.join(' | ')

}

export function hasAbsence(prestationsCodes) {

    if (prestationsCodes === undefined) {
        return false
    }

    for (let i = 0; i < prestationsCodes.length; i++) {
        let line = prestationsCodes[i]
        let code = line.slice(11, 14)
        if (codesMaladie.includes(code)) {
            return true
        }
    }
    return false
}

function reverseDate(date) {
    return date.slice(6, 8) + " - " + date.slice(4, 6) + " - " + date.slice(0, 4)
}

export function prestationCodeDetails(line) {

    let part1 = line.split()[0]
    let part2 = line.split(/[+-]/)[1]
    let code = ''

    let codePrestation = part1.slice(3, 7)
    if (codesPrestationsInterpreted[codePrestation]) {
        code = codesPrestationsInterpreted[codePrestation]
    }


    let quantite = part2.slice(0, 11)
    quantite = (parseFloat(quantite) / 10000).toString() + " unités"

    let montant = part2.slice(12, 22)
    montant = (parseFloat(montant) / 10000).toString() + ' € / u'

    let pourcentage = part2.slice(22, 25) + ' %'


    let allInfos = [code, quantite, montant, pourcentage]
    return allInfos.join(' | ')


}

export function contractPrestationDetail(line) {
    let startPeriod = line.slice(3, 11)
    startPeriod = "Début : " + startPeriod.slice(6, 8) + " - " + startPeriod.slice(4, 6) + " - " + startPeriod.slice(0, 4)
    let endPeriod = line.slice(11, 19)
    endPeriod = "Fin : " + endPeriod.slice(6, 8) + " - " + endPeriod.slice(4, 6) + " - " + endPeriod.slice(0, 4)

    let allInfos = [startPeriod, endPeriod]
    return allInfos.join(' | ')

}
