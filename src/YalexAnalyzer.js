import { Token } from "./Token";
export class YalexAnalyzer{
    constructor(data){
        this.regex = this.readFile(data);
    };
    // Use an async function to wait for the data
    readFile(data) {
            let commentaryToken = "";
            let isCommentary = false;
            let tokensSet = []
            let newTokensSet = []
            for (let line of data.split('\n')){

                // let oldIsCommentary = isCommentary;
                // [newTokensSet, isCommentary, commentaryToken] = this.processLines(line, isCommentary, commentaryToken);
                // if (oldIsCommentary!==isCommentary){
                //     [newTokensSet, isCommentary, commentaryToken] = this.processLines(line, isCommentary, commentaryToken);
                // }
                // newTokensSet.forEach(token => tokensSet.push(token));
                // if (!isCommentary){
                //     tokensSet.push(commentaryToken);
                // }
                console.log(`Line: ${line}`);
                for (let i = 0; i < line.length; ++i){
                    let c = line[i];
                    let new_token = "";
                    // Start commentary
                    if (c === '(' && line[i+1] === '*'){
                        while (i<line.length){
                            new_token += line[i];
                            if (line[i]===')' ){
                                if (line[i-1]==='*' ){
                                    i++
                                    tokensSet.push(new Token(new_token, "COMMENTARY"));
                                    break; 
                                }
                            }
                            i++;
                        }
                    }
                    
                }
            }
            console.log(tokensSet);
        }
    processLines(line, isCommentary, commentaryToken){
        let i = 0
        if (isCommentary){
            while (i<line.length && line[i]!==')' && line[i-1]!=='*'){
                commentaryToken+=line[i]
                console.log(commentaryToken)
                i++;
            }
            // It gets out of the commentary type
            if (line[i]!==')' && line[i-1]!=='*'){
                isCommentary = false;
            }
        }
        let tokensSet = []
        for (i; i<line.length;i++){
            let c = line[i]
            if (c === '(' && line[i+1] === '*'){
                isCommentary = true;
                return [tokensSet, isCommentary, commentaryToken];
            }
        };
        return [tokensSet, isCommentary, commentaryToken];
    };
};