
//compute the greatest common divisor of 2 numbers
function gcd(a, b) {
    if (a === 0)
        return b;
    return gcd(b % a, a);
}

//compute the greatest common divisor of an array of numbers
function arrayGCD(array){
    var result = array[0]
    for(var i = 1; i < array.length; i++){
        result = gcd(array[i],result)
        if(result === 1){return 1}
    }
    return result
}

function norm_dpb(pmf){
    new_sum = postMessage.reduce((a,b)=>a+b,0)
    old_sum = 0
    older_sum = 0
    oldest_sum = 0
    while(new_sum != 1){
        oldest_sum = older_sum
        older_sum = old_sum
        old_sum = new_sum
        var old_pmf = pmf
        pmf = pmf.map((item,index)=> item/new_sum)
        new_sum = pmf.reduce((a,b)=>a+b,0)
        if(new_sum >= 1 || new_sum == old_sum || new_sum == older_sum || new_sum == oldest_sum) break;
        if(new_sum < 1 && new_sum <= old_sum){
        pmf = old_pmf;
        break;
        }
    }
    return pmf
}

function dpb_conv(){
    console.log("NOT IMPLEMENTED")
}

function dgpb_conv_int(probs, diffs, sizeIn, sizeOut){
    var results = Array(sizeOut)
    // initialize result of first convolution step
    results[0] = 1.0;
    //ending position of the last computed iteration
    var end = 0;
    //perform convolution
    for(var i = 0; i < sizeIn; i++){
        if(diffs[i]){
            for(var j = end; j >= 0; j--){
                if(results[j]){
                    if(diffs[i]>0){
                        results[j+diffs[i]] += results[j] * probs[i]
                        results[j] *= 1 - probs[i]
                    }else{
                        results[j + diffs[i]] += results[j] * (1 - probs[i]);
                        results[j] *= probs[i];
                    }
                }
            }
            if(diffs[i] > 0){end += diffs[i]}else{end -=diffs[i]}
        }
    }
    //correct numerically false (and thus useless) results
    results = results.map(function(item,index){if(item > 1){return 1;}return item;})
    //make sure that probability masses sum up to 1
    results = norm_dpb(results)
    //return final results
    return results
}

function dgpb_conv(obs, probs, val_p, val_q){
    //number of probabilities of success
    const sizeIn = probs.length
    //determine pairwise minimum and maximum
    const v = pmin(val_p,val_q)
    //compute differences
    var diffs = val_p.map((item,index)=> item - val_q[index])
    //final output size
    const sizeOut = diffs.reduce((a,b) => a + Math.abs(b),0)
    //greatest common divisor of the differences 
    const gcd = arrayGCD(d.filter((v)=> v != 0))
    //rescale differences according to gcd
    if(gcd > 1){
        d = d.map((item,index) => item / gcd)
    }
    //theoritical rescaled maximum
    const max_rescaled = d.reduce((a,b)=> a+b,0)

    //results vectors
    var results = new Array(sizeOut)
    var results_rescaled

    //if maximum  absolution difference equals 1, we have an odinary poisson binomial distribution
    //TODO: implement dpb_conv and add this area back
    if(max(diffs) == 1 && min(diffs) == -1 && console.log("if statement passed") && false){
        // if val_p[i] was not the larger one, the respective probs[i] has to be 'flipped'
        // furthermore: if difference is 0 (i.e. u[i] equals v[i]), a non-zero outcome is impossible
        var probs_flipped = new Array(sizeIn)
        for(var i = 0; i < sizeIn; i++){
            if(d[i] == 0){probs_flipped[i] = 0}
            else if(val_p[i] < u[i]){probs_flipped[i] = 1-probs[i]}
            else{probs_flipped[i] = probs[i]}
        }
        //compute odinary difference
        results_rescaled = dpb_conv([],probs_flipped.filter((value,index) => diffs[index] != 0));
    }else{
        results_rescaled = dgpb_conv_int(probs, diffs, sizeIn, sizeOut_rescaled);
    }

    //map results to generalized distribution (scale-back)
    for(var i = 0; i < sizeOut_rescaled; i++){
        results[i * gcd] = results_rescaled[i]
    }

    if(obs.length != 0){
        //TODO: Figure out what goes here and what obs is?
        return results
    }else{
        return results
    }
}

//https://github.com/fj86/PoissonBinomial/blob/master/src/PoissonBinomial.cpp#L862
//in progress
function dgpb_dc(ops, probs, val_p, val_q){
    //number of probabilities of success
    const sizeIn = probs.length
    //determine pairwise minimum and maximum
    v = pmin(val_p,val_q)
    u = pmax(val_p,val_q)
    //theoritical minimum
    const min_v = v.reduce((a,b) => a+b,0)
    //compute differences
    var d = u.map(function(item,index){return item - v[index]})
    //final output size
    const sizeOut = d.reduce((a,b)=> a+b,0) + 1
    //greatest common divisor of differences
    const gcd = arrayGCD(d.filter((v)=> v != 0))
    //rescale differences according to gcd
    if(gcd > 1){
        d = d.map((item,index) => item / gcd)
    }
    //theoritical rescaled maximum
    const max_rescaled = d.reduce((a,b)=> a+b,0)
    //output size
    const sizeOut_rescaled = max_rescaled + 1

    // if val_p[i] was not the larger one, the respective probs[i] has to be 'flipped'
    // furthermore: if difference is 0 (i.e. u[i] equals v[i]), a non-zero outcome is impossible
    var probs_flipped = new Array(sizeIn)
    for(var i = 0; i < sizeIn; i++){
        if(d[i] == 0){probs_flipped[i] = 0}
        else if(val_p[i] < u[i]){probs_flipped[i] = 1-probs[i]}
        else{probs_flipped[i] = probs[i]}
    }

    //results vectors
    var results = new Array(sizeOut)
    var results_rescaled

    // if max_rescaled equals input size, we have an ordinary poisson binomial distribution
    if(Math.max(d) == 1){
        //compute oridinary distribution
        //results_rescaled = dpb_dc(IntegerVector(),probs_flipped)
    }else{
        //number of tree splits
        var num_splits = sizeIn > 860 ? Math.max(0,Math.ceil(Math.log(sizeIn/860)/Math.log(2))) : 0
        //direct convolution is sufficient in the case of 0 splits
        if(num_splits == 0){return 0}//dgpb_conv(obs,probs_flipped,u,v)
        //number of groups
        num_groups = Math.pow(2,num_splits)
        //fraction of total size per group
        var frac = (sizeOut_rescaled - 1)/num_groups
        while(num_splits > 0 && (num_groups > sizeIn || frac < Math.max(d))){
            num_splits -= 1;
            num_groups /= 2;
            frac *= 2
        }
        //direct convolution is sufficient, if no splits are necessary
        if(num_splits == 0){return 0}//dgpb_conv(obs,probs_flipped,u,v)

        //compute group sizes with minimum size disparity
        var group_sizes = Array(num_groups)
        var group_indicies = Array(sizeIn).fill(-1)

        //assign each probability to a group
        var ord = d.sort((a,b) => a-b)
    }
}