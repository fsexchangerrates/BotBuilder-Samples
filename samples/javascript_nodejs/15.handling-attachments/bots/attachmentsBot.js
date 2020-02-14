// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { AdaptiveCard, ActivityHandler, ActionTypes, ActivityTypes, CardFactory, MessageFactory, CardAction, Connector } = require('botbuilder');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const channelId = 'Line';
const ChannelData1 = require('./channelDatas/channelData-1.json');
const ChannelData2 = require('./channelDatas/channelData-2.json');

class AttachmentsBot extends ActivityHandler {
    /**
     * @param {*} turnContext
     * @param {Object} channelData1
     * @param {Object} channelData2
     * 
     */
    

    constructor(conversationUpdate)
        this.conversationUpdate(turnContext) => {

        }

        super();

        this.onMembersAdded(async (context, next) => {

            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // If the Activity is a ConversationUpdate, send a greeting message to the user.
                    await context.sendActivity('Welcome to the Attachment Handling sample! Send me an attachment and I will save it.');
                    await context.sendActivity('Alternatively, I can send you an attachment.');

                    // Send a HeroCard with potential options for the user to select.
                    await this.displayOptions(context);

                    // By calling next() you ensure that the next BotHandler is run.
                    await next();
                }
            }
        });

        this.onMessage(async (context, next) => {
            // Determine how the bot should process the message by checking for attachments.
            if (context.activity.attachments && context.activity.attachments.length > 0) {
                // The user sent an attachment and the bot should handle the incoming attachment.
                await this.handleIncomingAttachment(context);
            } else {
                // Since no attachment was received, send an attachment to the user.
                await this.handleOutgoingAttachment(context);
            }
            // Send a HeroCard with potential options for the user to select.
            await this.displayOptions(context);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.on('conversationUpdate', (message) => {
            console.console.log("conversationUpdate", message);
            switch (message.text) {
                case 'follow':
                    
                    break;
            
                default:
                    break;
            }
        });
    }

    /**
     * Saves incoming attachments to disk by calling `this.downloadAttachmentAndWrite()` and
     * responds to the user with information about the saved attachment or an error.
     * @param {Object} turnContext
     */
    async handleIncomingAttachment(turnContext) {
        // Prepare Promises to download each attachment and then execute each Promise.
        const promises = turnContext.activity.attachments.map(this.downloadAttachmentAndWrite);
        const successfulSaves = await Promise.all(promises);

        // Replies back to the user with information about where the attachment is stored on the bot's server,
        // and what the name of the saved file is.
        async function replyForReceivedAttachments(localAttachmentData) {
            if (localAttachmentData) {
                // Because the TurnContext was bound to this function, the bot can call
                // `TurnContext.sendActivity` via `this.sendActivity`;
                await this.sendActivity(`Attachment "${ localAttachmentData.fileName }" ` +
                    `has been received and saved to "${ localAttachmentData.localPath }".`);
            } else {
                await this.sendActivity('Attachment was not successfully saved to disk.');
            }
        }

        // Prepare Promises to reply to the user with information about saved attachments.
        // The current TurnContext is bound so `replyForReceivedAttachments` can also send replies.
        const replyPromises = successfulSaves.map(replyForReceivedAttachments.bind(turnContext));
        await Promise.all(replyPromises);
    }

    /**
     * Downloads attachment to the disk.
     * @param {Object} attachment
     */
    async downloadAttachmentAndWrite(attachment) {
        // Retrieve the attachment via the attachment's contentUrl.
        const url = attachment.contentUrl;

        // Local file path for the bot to save the attachment.
        const localFileName = path.join(__dirname, attachment.name);

        try {
            // arraybuffer is necessary for images
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            // If user uploads JSON file, this prevents it from being written as "{"type":"Buffer","data":[123,13,10,32,32,34,108..."
            if (response.headers['content-type'] === 'application/json') {
                response.data = JSON.parse(response.data, (key, value) => {
                    return value && value.type === 'Buffer' ? Buffer.from(value.data) : value;
                });
            }
            fs.writeFile(localFileName, response.data, (fsError) => {
                if (fsError) {
                    throw fsError;
                }
            });
        } catch (error) {
            console.error(error);
            return undefined;
        }
        // If no error was thrown while writing to disk, return the attachment's name
        // and localFilePath for the response back to the user.
        return {
            fileName: attachment.name,
            localPath: localFileName
        };
    }

    /**
     * Responds to user with either an attachment or a default message indicating
     * an unexpected input was received.
     * @param {Object} turnContext
     */
    async handleOutgoingAttachment(turnContext) {
        const reply = { type: ActivityTypes.Message };

        // Look at the user input, and figure out what type of attachment to send.
        // If the input matches one of the available choices, populate reply with
        // the available attachments.
        // If the choice does not match with a valid choice, inform the user of
        // possible options.
        const firstChar = turnContext.activity.text[0];
        if (firstChar === '1') {
            // create handler for flex message layout 
            reply.displayText = this.sendActivity(message);
            reply.attachments = [this.attachmentLayout()];
            // original layout
            reply.attachments = [this.getInlineAttachment()];
        } else if (firstChar === '2') {
            reply.attachments = [this.getInternetAttachment()];
            reply.text = 'This is an internet attachment.';
        } else if (firstChar === '3') {
            reply.attachments = [await this.getUploadedAttachment(turnContext)];
            reply.text = 'This is an uploaded attachment.';
        } else {
            // The user did not enter input that this bot was built to handle.
            reply.text = 'Your input was not recognized, please try again.';
        }
        await turnContext.sendActivity(reply);
    }

    /**
     * Sends a Flex Message such as carousel
     * @param {object} turnContext
     */
    async attachmentLayout(turnContext) {
        const reply = { type: ActivityTypes.Message };
        const flex1 = new botbuilder.AdaptiveCard()
        turnContext.AttachmentLayout(botbuilder.AttachmentLayout.carousel);
        turnContext.attachments([
            new botbuilder.AdaptiveCard(s)
                .bo
        ])
    }

    /**
     * Sends a HeroCard with choices of attachments.
     * @param {Object} turnContext
     */
    async displayOptions(turnContext) {
        const reply = { type: ActivityTypes.Message };

        // Note that some channels require different values to be used in order to get buttons to display text.
        // In this code the emulator is accounted for with the 'title' parameter, but in other channels you may
        // need to provide a value for other parameters like 'text' or 'displayText'.
        const buttons = [
            { type: ActionTypes.Postback, label: '1. Inline Attachment', value: '' },
            { type: ActionTypes.Postback, label: '2. Internet Attachment', value: '2' },
            { type: ActionTypes.Postback, label: '3. Uploaded Attachment', value: '3' }
        ];

        const card = CardFactory.heroCard('', undefined,
            buttons, { text: 'You can upload an image or select one of the following choices.' });

        reply.attachments = [card];

        await turnContext.sendActivity(reply);
    }

    /**
     * Returns an inline attachment.
     */
    getInlineAttachment() {
        const imageData = fs.readFileSync(path.join(__dirname, '../resources/architecture-resize.png'));
        const base64Image = Buffer.from(imageData).toString('base64');

        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: `data:image/png;base64,${ base64Image }`
        };
    }

    /**
     * Returns an attachment to be sent to the user from a HTTPS URL.
     */
    getInternetAttachment() {
        // NOTE: The contentUrl must be HTTPS.
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
        };
    }

    /**
     * Returns an attachment that has been uploaded to the channel's blob storage.
     * @param {Object} turnContext
     */
    async getUploadedAttachment(turnContext) {
        const imageData = fs.readFileSync(path.join(__dirname, '../resources/architecture-resize.png'));
        const connector = turnContext.adapter.createConnectorClient(turnContext.activity.serviceUrl);
        const conversationId = turnContext.activity.conversation.id;
        const response = await connector.conversations.uploadAttachment(conversationId, {
            name: 'architecture-resize.png',
            originalBase64: imageData,
            type: 'image/png'
        });

        // Retrieve baseUri from ConnectorClient for... something.
        const baseUri = connector.baseUri;
        const attachmentUri = baseUri + (baseUri.endsWith('/') ? '' : '/') + `v3/attachments/${ encodeURI(response.id) }/views/original`;
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: attachmentUri
        };
    }
}

module.exports.AttachmentsBot = AttachmentsBot;
