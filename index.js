const TelegramBot = require ('node-telegram-bot-api')
const request = require ('request')
const fs = require('fs')
const _ = require('lodash')

const TOKEN = '510655656:AAEvMSiTvy5bUiGlkCWID2kRMiX5kpP-7KQ'

const bot = new TelegramBot (TOKEN, {
    polling: true
})

const KB = {
    currency: 'Валюта',
    picture: 'картинка',
    cat: 'Котик',
    car: 'Машина',
    back: 'Назад'
}

const PicScrs = {
    [KB.cat]: [
        'cat1.jpg',
        'cat2.jpg',
        'cat3.jpg'
    ],
    [KB.car]: [
        'car1.jpg',
        'car2.jpg',
        'car3.jpg'
    ]
}

bot.onText(/\/start/, msg => {
    sendGreeting(msg)
})

bot.on ('message', msg => {

switch (msg.text) {
    case KB.picture:
        SendPictureScreen (msg.chat.id)
        break
    case KB.currency:
        sendCurrencyScreen (msg.chat.id)
        break
    case KB.back:
      sendGreeting(msg, false)
        break
    case KB.cat:
    case KB.car:
        sendPictureByName (msg.chat.id, msg.text)
        break

}

})

bot.on('callback_query', query => {
    const base = query.data
    const symbol = 'RUB'

    request(`https://api.fixer.io/latest?symbols=${symbol}&base-${base}`, (error, response, body) => {

        if (error) throw new Error(error)

        if (response.statusCode === 200) {

            const currencyData = JSON.parse (body)

            const html = `1 ${symbol} - ${currencyData.rates[symbol]} ${base}`

            bot.sendMessage(query.message.chat.id, html, {
                parse_mod: 'HTML'
            })

        }
    })
})

function SendPictureScreen (chatId) {
    bot.sendMessage(chatId, 'Выбирите картинку: ', {
        reply_markup: {
            keyboard: [
                [KB.car, KB.cat],
                [KB.back]
            ]
        }
    })
}

function sendGreeting (msg, sayHello = true) {
    const text = sayHello
       ? `Хай, ${msg.from.first_name}\n Что Вы хотите сделать?`
       : 'Что Вы хотите сделать?'

    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: [
                [KB.currency, KB.picture],
            ]
        }
    })
}
    
function sendPictureByName (chatId, picName) {
    const scrs = PicScrs[picName]
    const scr = scrs[_.random(0, scrs.length - 1)]

    bot.sendMessage(chatId, 'Загружаю...')

    fs.readFile(`${__dirname}/picture/${scr}`, (error, picture) => {
        if (error) throw new Error(error)

        bot.sendPhoto(chatId, picture).then(() =>{
            bot.sendMessage(chatId, 'Отправлено.')
        })
    })
}

function sendCurrencyScreen (chatId) {

    bot.sendMessage(chatId, 'Выберите тип валюты', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Доллар',
                        callback_data: 'USD'
                    }
                ],
                [
                    {
                        text: 'Евро',
                        callback_data: 'EUR'
                    }
                ],
                [
                    {
                        text: 'Евро',
                        callback_data: 'RUB'
                    }
                ]
            ]
        }
    })

}