import {Dice, multiD6} from "./dice.mjs"

var KEYWORDS = ["Sustained Hits 1", "Lethal Hits", "Reroll All Fails", "Reroll all non 6's", "Devastating Wounds"]

export function woundRoll(s,t){
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

function hitCount(diceResult, ws, keywords){
    var toReturn;
    var critical = false;
    if(keywords.includes("Reroll All Fails")){
        if(diceResult >= ws) {
            toReturn = 1;
            critical = diceResult == 6
        }else{
            //reroll fail
            var newResult = Math.floor(Math.random() * (6))+1;
            toReturn = newResult >= ws ? 1 : 0
            critical = newResult == 6
        }
    }else if(keywords.includes("Reroll all non 6's")){
        if(diceResult == 6) {
            toReturn = 1;
            critical = true
        }else{
            //reroll fail
            var newResult = Math.floor(Math.random() * (6))+1;
            toReturn = newResult >= ws ? 1 : 0
            critical = newResult == 6
        }
    }else{
        toReturn = diceResult >= ws ? 1 : 0
    }
    if(critical && keywords.includes("Sustained Hits 1")){
        toReturn *= 2
    }
    return toReturn
}

function woundCount(diceResult, toWound, keywords){
    return diceResult >= toWound ? 1 : 0
}

function damageCount(diceResult,save,keywords){
    return diceResult >= save ? 0 : 1
}

export function simulate(ws,attacks,str,ap,dmg,save,toughness,keywords){
    var hitRolls = multiD6(attacks)
    var numHit6 = hitRolls.reduce((a,b) => b == 6 ? a+1 : a, 0)
    var numHits = hitRolls.reduce((a,b) => a + hitCount(b,ws,keywords),0)
    //TODO: Current fails for rereollign with lethal hits. Refactor hitCount to return a flag for a critical hit and move logic for num hits outside of reduce
    if(keywords.includes("Lethal Hits")){
        numHits -= numHit6
    }

    var woundRolls = multiD6(numHits)
    var toWound = woundRoll(str,toughness)
    var numWound6 = woundRolls.reduce((a,b) => b == 6 ? a+1 : a, 0)
    var numWounds = woundRolls.reduce((a,b) => a + woundCount(b,toWound,keywords),0)

    if(keywords.includes("Lethal Hits")){
        numWounds += numHit6
    }

    if(keywords.includes("Devastating Wounds")){
        numWounds -= numWound6
    }

    var saveThrows = multiD6(numWounds)
    save = Math.min(7,save + ap)
    var numDamage = saveThrows.reduce((a,b) => a+damageCount(b,save,keywords),0)

    if(keywords.includes("Devastating Wounds")){
        numDamage += numWound6
    }

    return numDamage
}

export function aproximatePdf(ws,attacks,str,ap,dmg,save,toughness,keywords, iterations){
    var results;
    if(keywords.includes("Sustained Hits 1")){
        results = Array(dmg * 2 * attacks+1).fill(0)
    }else{
        results = Array(dmg * attacks+1).fill(0)
    }
    for(var i = 0; i < iterations; i++){
        var result = simulate(ws,attacks,str,ap,dmg,save,toughness,keywords)
        results[result] += 1/iterations
    }
    return results
}