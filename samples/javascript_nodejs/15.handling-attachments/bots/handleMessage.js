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

        super('handleMessage');
        channelDatas = JSON.pare()

        this.addAttachments();
    }
}