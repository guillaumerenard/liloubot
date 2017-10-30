import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class DialogflowDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                let fulfillment = builder.EntityRecognizer.findEntity(args.intent.entities, "fulfillment");
                if(fulfillment && (fulfillment.entity.messages.length > 0)) {
                    let messages = fulfillment.entity.messages.filter(message => {
                        return message.platform === "facebook";
                    });
                    if(messages.length === 0) {
                        messages = fulfillment.entity.messages;
                    }
                    let responseMessage = new builder.Message(session);
                    let responseMessageAttachments: builder.AttachmentType[] = [];
                    messages.forEach(message => {
                        switch(message.type) {
                            case 0:
                                responseMessage.text(message.speech);
                                session.send(responseMessage);
                                responseMessage = new builder.Message(session);
                                break;
                            case 1:
                                responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                                let card =  new builder.HeroCard(session)
                                    .title(message.title)
                                    .subtitle(message.subtitle)
                                    .text("")
                                    .images([builder.CardImage.create(session, message.imageUrl)]);
                                let buttons: builder.ICardAction[] = [];
                                message.buttons.forEach(button => {
                                    buttons.push({
                                        type: button.postback ? "openUrl" : "postBack",
                                        title: button.text,
                                        text: button.text,
                                        diplayText: button.text,
                                        value: button.postback || button.text
                                    });
                                });
                                card.buttons(buttons)
                                responseMessageAttachments.push(card);
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            case 2:
                                responseMessage.text(message.title);
                                responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                                message.replies.forEach(replie => {
                                    let card =  new builder.HeroCard(session)
                                    .buttons([{
                                        type: "postBack",
                                        title: replie,
                                        text: replie,
                                        diplayText: replie,
                                        value: replie
                                    }]);
                                    responseMessageAttachments.push(card);
                                });
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            case 3:
                                responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                                responseMessageAttachments.push(new builder.HeroCard(session)
                                    .images([builder.CardImage.create(session, message.imageUrl)]));
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            default:
                                break;
                        }
                    });
                    if(responseMessageAttachments.length > 0) {
                        session.send(responseMessage);
                    }
                }
                session.endDialog();
            }
        ]
    }
}

export default DialogflowDialog;