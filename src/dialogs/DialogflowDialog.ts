import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class DialogflowDialog extends BaseDialog{

    private static readonly fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

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
                    if(session.message.source === "skypeforbusiness") {
                        this.skypeForBusinessResponse(session, messages);
                    }
                    else {
                        this.defaultResponse(session, messages);
                    }
                }
                session.endDialog();
            }
        ]
    }

    private defaultResponse(session: builder.Session, messages: any[]): void {
        let responseMessage = new builder.Message(session);
        let responseMessageAttachments: builder.AttachmentType[] = [];
        for(let message of messages) {
            switch(message.type) {
                case 0:
                    // Text
                    if(responseMessageAttachments.length > 0) {
                        session.send(responseMessage);
                        responseMessage = new builder.Message(session);
                        responseMessageAttachments = [];
                    }
                    responseMessage.text(message.speech);
                    session.send(responseMessage);
                    responseMessage = new builder.Message(session);
                    break;
                case 1:
                    // Card
                    responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                    let card =  new builder.HeroCard(session)
                        .title(message.title)
                        .subtitle(message.subtitle)
                        .images([builder.CardImage.create(session, message.imageUrl)]);
                    let buttons: builder.ICardAction[] = [];
                    for(let button of message.buttons) {
                        buttons.push({
                            type: /^http|https:\/\/*/.test(button.postback) ? "openUrl" : "postBack",
                            title: button.text,
                            text: button.text,
                            diplayText: button.text,
                            value: button.postback || button.text
                        });
                    }
                    card.buttons(buttons)
                    responseMessageAttachments.push(card);
                    responseMessage.attachments(responseMessageAttachments);
                    break;
                case 2:
                    // Quick replies
                    if(responseMessageAttachments.length > 0) {
                        session.send(responseMessage);
                        responseMessage = new builder.Message(session);
                        responseMessageAttachments = [];
                    }
                    responseMessage.text(message.title);
                    responseMessage.attachmentLayout(builder.AttachmentLayout.list);
                    let quickRepliesCard =  new builder.HeroCard(session);
                    let quickRepliesButtons: builder.ICardAction[] = [];
                    for(let replie of message.replies) {
                        quickRepliesButtons.push({
                            type: "postBack",
                            title: replie,
                            text: replie,
                            diplayText: replie,
                            value: replie
                        });
                    }
                    quickRepliesCard.buttons(quickRepliesButtons);
                    responseMessageAttachments.push(quickRepliesCard);
                    responseMessage.attachments(responseMessageAttachments);
                    break;
                case 3:
                    // Image
                    responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                    responseMessageAttachments.push(new builder.HeroCard(session)
                        .images([builder.CardImage.create(session, message.imageUrl)]));
                    responseMessage.attachments(responseMessageAttachments);
                    break;
                default:
                    break;
            }
        }
        if(responseMessageAttachments.length > 0) {
            session.send(responseMessage);
        }
    }

    private skypeForBusinessResponse(session: builder.Session, messages: any[]) {
        let responseMessage = new builder.Message(session);
        for(let message of messages) {
            switch(message.type) {
                case 0:
                    // Text
                    responseMessage = new builder.Message(session)
                        .textFormat(builder.TextFormat.xml)
                        .text(`<span style="font-family: ${DialogflowDialog.fontFamily}">${message.speech}</span>`);                    
                    session.send(responseMessage);
                    break;
                case 1:
                    // Card
                    responseMessage = new builder.Message(session)
                        .textFormat(builder.TextFormat.xml)
                        .text(`<div style="font-family: ${DialogflowDialog.fontFamily}"><h3>${message.title}</h3><p>${message.subtitle || ""}</p><img src="${message.imageUrl}" alt="${message.title}"></div>`);
                    session.send(responseMessage);
                    break;
                case 2:
                    // Quick replies
                    responseMessage = new builder.Message(session)
                        .textFormat(builder.TextFormat.xml)
                        .text(`<span style="font-family: ${DialogflowDialog.fontFamily}">${message.title}</span>`);
                    session.send(responseMessage);
                    for(let replie of message.replies) {
                        responseMessage = new builder.Message(session)
                            .textFormat(builder.TextFormat.xml)
                            .text(`<span style="font-family: ${DialogflowDialog.fontFamily}">${replie}</span>`);
                        session.send(responseMessage);
                    }
                    break;
                case 3:
                    // Image
                    responseMessage = new builder.Message(session)
                        .textFormat(builder.TextFormat.xml)
                        .text(`<img src="${message.imageUrl}">`);
                    session.send(responseMessage);
                    break;
                default:
                    break;
            }
        }
    }
}

export default DialogflowDialog;