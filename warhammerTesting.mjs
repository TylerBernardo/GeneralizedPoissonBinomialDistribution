import {dgpbinom} from "./gpbd.mjs"

var KEYWORDS = ["Sustained Hits 1", "Lethal Hits", "Reroll All Fails", "Reroll all non 6's", "Devastating Wounds"]

function getCombatChance(numDice,diceSides,toHit,toWound,armorSave,keywords){
    var hitChance = (diceSides-toHit+1)/diceSides;
    var woundChance = (diceSides-toWound+1)/diceSides
    var saveChance = (armorSave-1)/diceSides
    var combinedChance = saveChance * woundChance * hitChance;
    var modifier = 1;
    console.log(keywords)
    if(keywords.includes("Sustained Hits 1")){
        modifier += 1/(6 * hitChance)
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
        iterations = iterations*4
    }
    return combinedChance * modifier
}


function woundRoll(s,t){
    if(s >= 2 * t){
        return 2;
    }

    if(s > t){
        return 3;
    }

    if(s == t){
        return 4
    }

    if(s * 2 <= t){
        return 6
    }

    return 5;
}

function chancesForWeapon(ws,attacks,str,save,toughness,keywords){
    var toWound = woundRoll(str,toughness)
    var p = getCombatChance(attacks,6,ws,toWound,save,keywords)
    return Array(attacks).fill(p)
}

function weaponToGPBD(ws,attacks,str,save,toughness,keywords,ap,damage){
    save = Math.min(7,save+ap)
    var ps = chancesForWeapon(ws,attacks,str,save,toughness,keywords)
    var as = Array(attacks).fill(damage)
    var bs = Array(attacks).fill(0)
    return {
        "ps":ps,
        "as":as,
        "bs":bs
    }
}

var target = {"t":3,"sv":4}

var stormBolter = weaponToGPBD(3,16,4,target.sv,target.t,[],0,1)
var missileLauncher = weaponToGPBD(3,2,12,target.sv,target.t,[],3,1)
var pdf = dgpbinom(null,stormBolter.ps.concat(missileLauncher.ps),stormBolter.as.concat(missileLauncher.as),stormBolter.bs.concat(missileLauncher.bs))

for(var i = 0; i < pdf.length; i++){
    console.log("Probabilitiy of %i damage: %f",i,pdf[i])
}