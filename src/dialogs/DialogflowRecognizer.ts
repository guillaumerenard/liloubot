import * as builder from "botbuilder";
import * as apiai from "apiai";

class DialogflowRecognizer extends builder.IntentRecognizer {

    private apiaiApp: apiai.Application;

    constructor(apiaiToken: string) {
        super();
        this.apiaiApp = apiai(apiaiToken);
    }

    public onRecognize(context: builder.IRecognizeContext, callback: (err: Error, result: builder.IIntentRecognizerResult) => void): void {
        let result: builder.IIntentRecognizerResult = { score: 1, intent: "None", intents: [], entities: [] };
        if (context && context.message && context.message.text) {
            let request = this.apiaiApp.textRequest(context.message.text, {
                sessionId: `${Math.random()}`
            });
            request.on("response", response => {
                result.intent = response.result.metadata.intentName;
                result.score = response.result.score;
                result.intents.push({
                    intent: response.result.metadata.intentName,
                    score: response.result.score
                });
                result.entities.push({
                    type: "fulfillment",
                    entity: response.result.fulfillment
                });
                callback(null, result);
            });
            request.on("error", error => {
                callback(error, null);
            });
            request.end();
        }
        else {
            callback(null, result);
        }
    }

    

}

export default DialogflowRecognizer;