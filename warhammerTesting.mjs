import {dgpbinom} from "./gpbd.mjs"
import { woundRoll,simulate, aproximatePdf } from "./simulate.mjs";

var KEYWORDS = ["Sustained Hits 1", "Lethal Hits", "Reroll All Fails", "Reroll all non 6's", "Devastating Wounds"]

function getCombatChance(numDice,diceSides,toHit,toWound,armorSave,keywords){
    var hitChance = (diceSides-toHit+1)/diceSides;
    var woundChance = (diceSides-toWound+1)/diceSides
    var saveChance = (armorSave-1)/diceSides
    var combinedChance = saveChance * woundChance * hitChance;
    var modifier = 1;
    console.log(keywords)
    if(keywords.includes("Sustained Hits 1")){
        modifier += 1/(6.0 * hitChance)
        numDice += numDice;
    }
    if(keywords.includes("Lethal Hits")){
        modifier += (1-woundChance)/(6*hitChance*woundChance)
    }
    if(keywords.includes("Devastating Wounds")){
        modifier = modifier * (1 + (1/(6 * woundChance * saveChance)) - (1/(6*woundChance)))
    }
    if(keywords.includes("Reroll All Fails")){
        modifier = modifier * (2-hitChance);
    }
    if(keywords.includes("Reroll all non 6's")){
        modifier = modifier * (11/6.0) + (1/(6*hitChance)) - 1
    }
    console.log(modifier)
    if(keywords.includes("Sustained Hits 1")){
        modifier = modifier/2;
        //iterations = iterations*4
    }
    return {"p":combinedChance * modifier,"dice":numDice}
}

function chancesForWeapon(ws,attacks,str,save,toughness,keywords){
    var toWound = woundRoll(str,toughness)
    var res = getCombatChance(attacks,6,ws,toWound,save,keywords)
    return Array(res.dice).fill(res.p)
}

function weaponToGPBD(ws,attacks,str,save,toughness,keywords,ap,damage){
    save = Math.min(7,save+ap)
    var ps = chancesForWeapon(ws,attacks,str,save,toughness,keywords)
    var as = Array(ps.length).fill(damage)
    var bs = Array(ps.length).fill(0)
    return {
        "ps":ps,
        "as":as,
        "bs":bs
    }
}

var target = {"t":3,"sv":4}
var bolter = {"ws":3,"a":16,"str":4,"ap":0,"dmg":1,"keywords":["Sustained Hits 1","Reroll All Fails"]}

//having both sustained hits and rerolling fails raises the error from .1% to .3%
var stormBolter = weaponToGPBD(3,16,4,target.sv,target.t,["Sustained Hits 1","Reroll All Fails"],0,1)
var missileLauncher = weaponToGPBD(3,2,12,target.sv,target.t,[],3,1)
console.time("gpbinom")
var pdf = dgpbinom(null,stormBolter.ps,stormBolter.as,stormBolter.bs)
console.timeEnd("gpbinom")
var average = 0;
for(var i = 0; i < pdf.length; i++){
    console.log("Probabilitiy of %i damage: %f",i,pdf[i])
    average += i * pdf[i]
}
console.log("Calculated average damage is %f",average)
//estimate the pdf by runnning simulations
console.time("simulate")
var aproxPdf = aproximatePdf(3,16,4,0,1,4,3,["Sustained Hits 1","Reroll All Fails"],1000000)
console.timeEnd("simulate")
var simAvg = 0;
for(var i = 0; i < pdf.length; i++){
    console.log("Simulated probabilitiy of %i damage: %f",i,aproxPdf[i])
    simAvg += i * aproxPdf[i]
}
console.log("Simulated average damage is %f",simAvg)

//find the error of the two
var error = 0
var maximumError = 0
for(var i = 0; i < pdf.length; i++){
    var termError = Math.abs(pdf[i] - aproxPdf[i])
    error += termError
    maximumError = termError > maximumError ? termError : maximumError

}
console.log("The absolute error between the two is %f",error)
console.log("The maximum term error is %f",maximumError)