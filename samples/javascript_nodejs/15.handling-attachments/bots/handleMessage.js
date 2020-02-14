const { CardAction, CardFactory, MessageFactory, ActionTypes, ActivityHandler } = require('botbuilder');
const ChannelData1 = require('../channelDatas/ChannelData1.json');
const ChannelData2 = require('../channelDatas/ChannelData2.json');

class HandleMessage {
    /**
     * @param {Array} channelDatas
     * @param {Object} channelData1
     * @param {Object} channelData2
     */

    constructor(channelDatas) {
        this.channelDatas = channelDatas;
        channelData1 = JSON.pare(ChannelData1, 'channelData1');
        channelData2 = JSON.pare(ChannelData2, 'channelData2');

        super('handleMessage');
        channelDatas = [{ channelData1 }, { channelData2 }];

        this.addAttachments();
    }

}

module.exports.HandleMessage = HandleMessage;