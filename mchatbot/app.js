/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

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

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
                knowledgeBaseId:"38fe1119-d237-4bde-9964-153934a03177",
                subscriptionKey: "b88da98823064cba9af09cdc13566467"});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try changing the query terms!',
                qnaThreshold: 0.3}
);

bot.on('conversationUpdate', function(update){
    if (update.membersAdded) {
        update.membersAdded.forEach(function (identity) {
            if (identity.id === update.address.bot.id) {
                bot.beginDialog(update.address, 'greeting');
            }
        });
    }
});
bot.dialog('greeting',[
    function(session){
         session.send("想吃麥當勞嗎?現在就訂餐!請輸入\"我想吃套餐\"或是\"我要單點\"選擇餐點");
         session.send("如果對我們的服務有問題，請直接輸入問題");
    }
]);
bot.dialog('/',
    [
        function (session){
             var qnaKnowledgebaseId = "38fe1119-d237-4bde-9964-153934a03177";
             var qnaSubscriptionKey = "b88da98823064cba9af09cdc13566467";


        // QnA Subscription Key and KnowledgeBase Id null verification
            if((qnaSubscriptionKey == null || qnaSubscriptionKey == '') || (qnaKnowledgebaseId == null || qnaKnowledgebaseId == ''))
                session.send('Please set QnAKnowledgebaseId and QnASubscriptionKey in App Settings. Get them at https://qnamaker.ai.');
            else
                session.replaceDialog('basicQnAMakerDialog');
                }

    ]
 );

bot.dialog('orderset', function (session) {
    session.sendTyping();
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("雙層四盎司牛肉堡套餐")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is NT138")
            .images([builder.CardImage.create(session, 'https://oooooxxxxx.weebly.com/uploads/2/5/1/5/25151871/2726870_orig.png')])
            .buttons([
                builder.CardAction.imBack(session, "來一份雙層四盎司牛肉堡套餐", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("大麥克套餐")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is NT148")
            .images([builder.CardImage.create(session, 'http://www.mcdonalds.com.tw/tw_assets/meal_bundle_lunch/images/lunch_1/em_01.png')])
            .buttons([
                builder.CardAction.imBack(session, "來一份大麥克套餐", "Buy")
            ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^我想吃套餐/i });

bot.dialog('ordersingle', function (session) {

    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("薯條")
            .subtitle("美國進口馬鈴薯")
            .text("Price is NT55")
            .images([builder.CardImage.create(session, 'https://i.kinja-img.com/gawker-media/image/upload/s--9OrVZK41--/c_fill,fl_progressive,g_center,h_450,q_80,w_800/18nu7vyx8m3yjjpg.jpg')])
            .buttons([
                builder.CardAction.imBack(session, "我要買這個", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("雞塊")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is NT54")
            .images([builder.CardImage.create(session, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRicxXhyIuh8uS1DIkcrehZJUctVqS1AReOL4CnPEkfevtPC7TZ')])
            .buttons([
                builder.CardAction.imBack(session, "我要買這個", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("蘋果派")
            .subtitle(",,,")
            .text("Price is NT62")
            .images([builder.CardImage.create(session,'http://img.chinatimes.com/newsphoto/2017-02-01/656/20170201001009.jpg')])
            .buttons([builder.CardAction.imBack(session,"我要買這個","Buy")
            ])
    ]);
    session.sendTyping();
    session.send(msg).endDialog();
}).triggerAction({ matches: /^我要單點/i });



bot.dialog('buyButtonClick', [
    function (session, args, next) {
        session.send("不要，先給我你的信用卡資訊");

        // Get color and optional size from users utterance
        // var utterance = args.intent.matched[0];
        // var color = /(white|gray)/i.exec(utterance);
        // var size = /\b(Extra Large|Large|Medium|Small)\b/i.exec(utterance);
        // if (color) {
        //     // Initialize cart item
        //     var item = session.dialogData.item = {
        //         product: "classic " + color[0].toLowerCase() + " t-shirt",
        //         size: size ? size[0].toLowerCase() : null,
        //         price: 25.0,
        //         qty: 1
        //     };
        //     if (!item.size) {
        //         builder.Prompts.choice(session, "What size would you like?", "Small|Medium|Large|Extra Large");
        //     } else {
        //         next();
        //     }
        // } else {
        //     session.send("I'm sorry... That product wasn't found.").endDialog();
        // }
    },
    function (session, results) {
        // Save size if prompted
        // Add to cart
        session.send("A '%items' has been added to your cart.", args.intent.matched[0]).endDialog();
    }
]).triggerAction({ matches:/^我要買這個/i });

bot.dialog('help',[(session,args,next)=>{
    session.send("想吃麥當勞嗎?現在就訂餐!請輸入\"我想吃套餐\"或是\"我要單點\"選擇餐點");
    session.send("如果對我們的服務有問題，請直接輸入問題");
}]).triggerAction({
    matches: /^help$/i
});

// bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);
// var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
//     recognizers: [recognizer],
//     defaultMessage: 'No match! Try changing the query terms!',
//     qnaThreshold: 0.3
// });

bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);


bot.dialog('FAQ', //basicQnAMakerDialog);
[
    function (session){
        var qnaKnowledgebaseId = "38fe1119-d237-4bde-9964-153934a03177";
        var qnaSubscriptionKey = "b88da98823064cba9af09cdc13566467";


        // QnA Subscription Key and KnowledgeBase Id null verification
        if((qnaSubscriptionKey == null || qnaSubscriptionKey == '') || (qnaKnowledgebaseId == null || qnaKnowledgebaseId == ''))
            session.send('Please set QnAKnowledgebaseId and QnASubscriptionKey in App Settings. Get them at https://qnamaker.ai.');
        else
            session.replaceDialog('basicQnAMakerDialog');
    }
]).triggerAction({ matches:/^我想問問題/i });






// POST /knowledgebases/38fe1119-d237-4bde-9964-153934a03177/generateAnswer
// Host: https://westus.api.cognitive.microsoft.com/qnamaker/v2.0
// Ocp-Apim-Subscription-Key: b88da98823064cba9af09cdc13566467
// Content-Type: application/json
// {"question":"hi"}
