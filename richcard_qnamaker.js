var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
 
const cognitiveServices = require('botbuilder-cognitiveservices');
 
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

    
const recognizer = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId: '91c635b7-5349-4186-a7b3-3d6d03911cd9',
    authKey: 'c40909cd-9e9c-48b7-8ace-8606fa689081',
    endpointHostName: 'https://0613qa.azurewebsites.net/qnamaker'
});
 
// Listen for messages from users 
server.post('/api/messages', connector.listen());
 
/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */
 
var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
 
var qnaMakerDialog = new cognitiveServices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'Sorry, no match found!',
    qnaThreshold: 0.3
});
 
 
const bot = new builder.UniversalBot(connector);
bot.dialog('/', qnaMakerDialog);
 
bot.dialog('showhamburger', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("漬物蝦堡")
            .subtitle("$28.00")
            .text("去不到日本賞櫻花，一於吃個充滿和風的「漬物蝦堡」吧！ ")
            .images([builder.CardImage.create(session, 'https://ddwvksr2jxth2.cloudfront.net/hk/static/1522933912096/assets/852/products/4034.png?')])
            .buttons([
                builder.CardAction.imBack(session, "buy 漬物蝦堡", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("玉子牛堡")
            .subtitle("$20.00")
            .text("滋味牛肉、軟嫩蒸蛋和香濃車打芝士，再配上爽口洋蔥粒")
            .images([builder.CardImage.create(session, 'https://ddwvksr2jxth2.cloudfront.net/hk/static/1522933912096/assets/852/products/4228.png?')])
            .buttons([
                builder.CardAction.imBack(session, "buy 玉子牛堡", "Buy")
            ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^(hamburgers|eat|hamburger)/i });
 
bot.dialog('showdrink', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("熱新鮮檸檬茶")
            .subtitle("$15.50")
            .text("常喝能減少黑斑、雀斑 ... 起床狂打噴嚏自製熱茶飲止鼻過敏")
            .images([builder.CardImage.create(session, 'https://ddwvksr2jxth2.cloudfront.net/hk/static/1522933912096/assets/852/products/3283.png?')])
            .buttons([
                builder.CardAction.imBack(session, "buy 熱新鮮檸檬茶", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("雪碧®檸檬青檸味汽水")
            .subtitle("$12.50")
            .text("常喝能減少黑斑、雀斑")
            .images([builder.CardImage.create(session, 'https://ddwvksr2jxth2.cloudfront.net/hk/static/1522933912096/assets/852/products/3011.png?')])
            .buttons([
                builder.CardAction.imBack(session, "buy 雪碧®檸檬青檸味汽水", "Buy")
            ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^(drink|drinks|cola|juice|coffee)/i });
 
// Add dialog to handle 'Buy' button click
bot.dialog('buyButtonClick', [
    function (session, results) {
        // Save size if prompted
        var item = session.dialogData.item;
        if (results.response) {
            item.size = results.response.entity.toLowerCase();
        }
 
        // Add to cart
        if (!session.userData.cart) {
            session.userData.cart = [];
        }
        session.userData.cart.push(item);
 
        // Send confirmation to users
        session.send("A has been added to your cart.", item).endDialog();
    }
]).triggerAction({ matches: /(buy|add) */i });
