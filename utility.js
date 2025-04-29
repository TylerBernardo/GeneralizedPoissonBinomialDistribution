export function check_args_GPB(x,probs,val_p,val_q,wts,method){
    //check if x only contains integers
    var isInt = x.reduce(((a,b) => a && (b - Math.round(b) != 0),true))
    if(x != null && !isInt){
        //x contains non-integers
        x = x.map((item,index)=>Math.floor(item))
    }

    //check if 'probs' contains only probabilities
    var isValid = x.reduce(((a,b) => a && (b != null && b!= NaN),true))
    var isInRange = x.reduce(((a,b) => a && (b >= 0 && b <= 1),true))
    if(!isValid || !isInRange){
        throw new error("'probs' must contain real numbers between 0 and 1!")
    }
    //number of probabilities
    var n = probs.length

    //check if val_p and val_q have the same length
    if(val_p.length != n || val_q.length != n){
        throw new error("'probs', 'val_p', and 'val_q' must have the same length!")
    }

    if(wts != null && wts.length != n){
        throw new error("'probs' and 'wts' must have the same length")
    }

    //check if val_p and val_q contain only integers
    var pIsInt = val_p.reduce(((a,b) => a && (b - Math.round(b) != 0),true))
    var qIsInt = val_q.reduce(((a,b) => a && (b - Math.round(b) != 0),true))
    if(!pIsInt){
        val_p = val_p.map((item,index)=>Math.floor(item))
    }
    if(!qIsInt){
        val_q = val_q.map((item,index)=>Math.floor(item))
    }

    var wtsCheck = wts.reduce((a,b) => a && (b != NaN && b >= 0 && Math.abs(b-Math.round(b)) <= Math.pow(10,-7)),true)
    if(wts != null && !wtsCheck){
        throw new error("'wts' must contain non-negative integers")
    }

    if(!(["DivideFFT","Convolve","Characteristic","Normal","Refined Normal"].contains(method))){
        throw new error("Method does nto exist")
    }
    
    return method
}

export function transformGPB(x,probls,val_p,val_q,wts){

}