// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk");
const https = require("https");



/**

Tenemos que crear Handlers, cada uno con dos funciones. 
Una determina (canHandle) si el handler se encargara de procesar esta peticion, la otra es la que
se ejecuta cuando la anterior indica true.

en responseBuilder es donde se genera el output, como por ejemplo el repromt, las cards, etc.
en el request es donde viene el imput.



ErrorHandler se va a disparar siempre que haya un error en el codigo fuente, de sintaxis, o lo que sea.


para ver que valores tienen los slots, hay que ir a filledSlots
filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name
En este ejemplo hay una funcion que se llama getSlotValues que automaticamente los mete todos a un array para que los podamos utilizar

para debugear, puedo coger el input y meterlo en Test events - Alexa Start session como template, y pegar el input.
Tambien podemor ir a cloudwatch (al servicio) y buscar con el identificador del ARN, y ahi veremos ejecuciones reales. O DIRECTAMENTE DESDE MONITORING en la pantalla de la funcion lambda

Se puede hacer account linking, con oauth 2.0, en la aplicacion movil de gestion de alexa, y luego eso se tiene disponible (el acceso) durante la sesión del usuario. Pero ojo porque dicen que es bastante tedioso y genera casos de uso muy complejos. Recomiendan evitar matar moscas a cañonazos


HAY algunas notas por el codigo: buscar MJGS NOTA


hay que echar un ojo a: getSessionAttributes y persistenceAttributes (guarda en DynamoDB)

por ejempo: skill-sample-nodejs-highlowgame -> en el repositorio de github de alexa

handlerInput.attributesManager
attributesManager.getPersistentAttributes()
attributes.gamesPlayed  =0;
attributesManager.setSessionAttributes(attributes);
[...]
withTableName('...')
.withAutoCreateTable(true)

hay que dara permisos en dynamo. En la funcion lambda, buscamos como se ve el role (abajo del todo), podermos dar acceso a este rol a Dynamo, o crear un nuevo rol que tenga acceso a las dos cosas.
Vamos a REsource Groups, vamos a roles, y hacemos un Attach permissions. Creamos un policy para vincularlo a Dynamo. Le dmos full access al principio, pero en produccion se lo tenemos que dar lo menos permisivo posible.
**/

// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk");
const https = require("https");



const invocationName = "agencia de viajes";

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],


       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       // "nextIntent":[]

       // "favoriteColor":"",
       // "name":"",
       // "namePronounce":"",
       // "email":"",
       // "mobileNumber":"",
       // "city":"",
       // "state":"",
       // "postcode":"",
       // "birthday":"",
       // "bookmark":0,
       // "wishlist":[],
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        let previousIntent = getPreviousIntent(sessionAttributes);
        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
             say += 'Your last intent was ' + previousIntent + '. ';
         }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const RecommendationIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'RecommendationIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        // delegate to Alexa to collect all the required slots 
        const currentIntent = request.intent; 
        if (request.dialogState && request.dialogState !== 'COMPLETED') {  //mjgs nota: ESTO ES LO QUE HACE QUE EL DIALOGO CONTINUE SI FALTA ALGO
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();

        } 
        let say = 'Hello from RecommendationIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: recurso 
        if (slotValues.recurso.heardAs && slotValues.recurso.heardAs !== '') {
            slotStatus += ' slot recurso was heard as ' + slotValues.recurso.heardAs + '. ';
        } else {
            slotStatus += 'slot recurso is empty. ';
        }
        if (slotValues.recurso.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.recurso.resolved !== slotValues.recurso.heardAs) {
                slotStatus += 'synonym for ' + slotValues.recurso.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.recurso.ERstatus === 'ER_SUCCESS_NO_MATCH') { //MJGS NOTA: SE USA ER_SUCCESS... PARA VALIDAR QUE HA COINCIDIDO ALGUN SINONIMO, SI ES UN NUMERO, POR EJEMPLO, BASTARIA CON PONER UN HEARDAS, QUE SIGNIFICA QUE SE HA ODIDO ALGO
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.recurso.heardAs + '" to the custom slot type used by slot recurso! '); 
        }

        if( (slotValues.recurso.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.recurso.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','recurso'), 'or');
        }
        //   SLOT: tipo 
        if (slotValues.tipo.heardAs && slotValues.tipo.heardAs !== '') {
            slotStatus += ' slot tipo was heard as ' + slotValues.tipo.heardAs + '. ';
        } else {
            slotStatus += 'slot tipo is empty. ';
        }
        if (slotValues.tipo.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.tipo.resolved !== slotValues.tipo.heardAs) {
                slotStatus += 'synonym for ' + slotValues.tipo.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.tipo.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.tipo.heardAs + '" to the custom slot type used by slot tipo! '); 
        }

        if( (slotValues.tipo.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.tipo.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','tipo'), 'or');
        }
        //   SLOT: presupuesto 
        if (slotValues.presupuesto.heardAs && slotValues.presupuesto.heardAs !== '') {
            slotStatus += ' slot presupuesto was heard as ' + slotValues.presupuesto.heardAs + '. ';
        } else {
            slotStatus += 'slot presupuesto is empty. ';
        }
        if (slotValues.presupuesto.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.presupuesto.resolved !== slotValues.presupuesto.heardAs) {
                slotStatus += 'synonym for ' + slotValues.presupuesto.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.presupuesto.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.presupuesto.heardAs + '" to the custom slot type used by slot presupuesto! '); 
        }

        if( (slotValues.presupuesto.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.presupuesto.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','presupuesto'), 'or');
        }
        //   SLOT: temporada 
        if (slotValues.temporada.heardAs && slotValues.temporada.heardAs !== '') {
            slotStatus += ' slot temporada was heard as ' + slotValues.temporada.heardAs + '. ';
        } else {
            slotStatus += 'slot temporada is empty. ';
        }
        if (slotValues.temporada.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.temporada.resolved !== slotValues.temporada.heardAs) {
                slotStatus += 'synonym for ' + slotValues.temporada.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.temporada.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.temporada.heardAs + '" to the custom slot type used by slot temporada! '); 
        }

        if( (slotValues.temporada.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.temporada.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','temporada'), 'or');
        }
        //   SLOT: precio 
        if (slotValues.precio.heardAs && slotValues.precio.heardAs !== '') {
            slotStatus += ' slot precio was heard as ' + slotValues.precio.heardAs + '. ';
        } else {
            slotStatus += 'slot precio is empty. ';
        }
        if (slotValues.precio.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.precio.resolved !== slotValues.precio.heardAs) {
                slotStatus += 'synonym for ' + slotValues.precio.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.precio.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.precio.heardAs + '" to the custom slot type used by slot precio! '); 
        }

        if( (slotValues.precio.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.precio.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','precio'), 'or');
        }
        //   SLOT: precio_cuantificador 
        if (slotValues.precio_cuantificador.heardAs && slotValues.precio_cuantificador.heardAs !== '') {
            slotStatus += ' slot precio_cuantificador was heard as ' + slotValues.precio_cuantificador.heardAs + '. ';
        } else {
            slotStatus += 'slot precio_cuantificador is empty. ';
        }
        if (slotValues.precio_cuantificador.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.precio_cuantificador.resolved !== slotValues.precio_cuantificador.heardAs) {
                slotStatus += 'synonym for ' + slotValues.precio_cuantificador.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.precio_cuantificador.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.precio_cuantificador.heardAs + '" to the custom slot type used by slot precio_cuantificador! '); 
        }

        if( (slotValues.precio_cuantificador.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.precio_cuantificador.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('RecommendationIntent','precio_cuantificador'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'hello' + ' and welcome to ' + invocationName + ' ! Say help to hear some options.';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!', 
              'Hello!\nThis is a card for your skill, ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example: 
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}

 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 
 
 
 
 
function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value || '', // may be null 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name == intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
 
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
    slotValuesFull = shuffleArray(slotValuesFull); 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
 
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
    const hasDisplay = 
        handlerInput.requestEnvelope.context && 
        handlerInput.requestEnvelope.context.System && 
        handlerInput.requestEnvelope.context.System.device && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display; 
 
    return hasDisplay; 
} 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png", 
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png" 
 
 
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
function getPreviousIntent(attrs) { 
 
    if (attrs.history && attrs.history.length > 1) { 
        return attrs.history[attrs.history.length - 2].IntentRequest; 
 
    } else { 
        return false; 
    } 
 
} 
 
function getPreviousSpeechOutput(attrs) { 
 
    if (attrs.lastSpeechOutput && attrs.history.length > 1) { 
        return attrs.lastSpeechOutput; 
 
    } else { 
        return false; 
    } 
 
} 
 
function timeDelta(t1, t2) { 
 
    const dt1 = new Date(t1); 
    const dt2 = new Date(t2); 
    const timeSpanMS = dt2.getTime() - dt1.getTime(); 
    const span = { 
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )), 
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)), 
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)), 
        "timeSpanDesc" : "" 
    }; 
 
 
    if (span.timeSpanHR < 2) { 
        span.timeSpanDesc = span.timeSpanMIN + " minutes"; 
    } else if (span.timeSpanDAY < 2) { 
        span.timeSpanDesc = span.timeSpanHR + " hours"; 
    } else { 
        span.timeSpanDesc = span.timeSpanDAY + " days"; 
    } 
 
 
    return span; 
 
} 
 
 
const InitMemoryAttributesInterceptor = { 
    process(handlerInput) { 
        let sessionAttributes = {}; 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            let memoryAttributes = getMemoryAttributes(); 
 
            if(Object.keys(sessionAttributes).length === 0) { 
 
                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list 
 
                    sessionAttributes[key] = memoryAttributes[key]; 
 
                }); 
 
            } 
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
 
        } 
    } 
}; 
 
const RequestHistoryInterceptor = { 
    process(handlerInput) { 
 
        const thisRequest = handlerInput.requestEnvelope.request; 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
        let history = sessionAttributes['history'] || []; 
 
        let IntentRequest = {}; 
        if (thisRequest.type === 'IntentRequest' ) { 
 
            let slots = []; 
 
            IntentRequest = { 
                'IntentRequest' : thisRequest.intent.name 
            }; 
 
            if (thisRequest.intent.slots) { 
 
                for (let slot in thisRequest.intent.slots) { 
                    let slotObj = {}; 
                    slotObj[slot] = thisRequest.intent.slots[slot].value; 
                    slots.push(slotObj); 
                } 
 
                IntentRequest = { 
                    'IntentRequest' : thisRequest.intent.name, 
                    'slots' : slots 
                }; 
 
            } 
 
        } else { 
            IntentRequest = {'IntentRequest' : thisRequest.type}; 
        } 
        if(history.length > maxHistorySize - 1) { 
            history.shift(); 
        } 
        history.push(IntentRequest); 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
 
}; 
 
 
 
 
const RequestPersistenceInterceptor = { 
    process(handlerInput) { 
 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            return new Promise((resolve, reject) => { 
 
                handlerInput.attributesManager.getPersistentAttributes() 
 
                    .then((sessionAttributes) => { 
                        sessionAttributes = sessionAttributes || {}; 
 
 
                        sessionAttributes['launchCount'] += 1; 
 
                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
                        handlerInput.attributesManager.savePersistentAttributes() 
                            .then(() => { 
                                resolve(); 
                            }) 
                            .catch((err) => { 
                                reject(err); 
                            }); 
                    }); 
 
            }); 
 
        } // end session['new'] 
    } 
}; 
 
 
const ResponseRecordSpeechOutputInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
        let lastSpeechOutput = { 
            "outputSpeech":responseOutput.outputSpeech.ssml, 
            "reprompt":responseOutput.reprompt.outputSpeech.ssml 
        }; 
 
        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput; 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
}; 
 
const ResponsePersistenceInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession); 
 
        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 
 
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime(); 
 
            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes); 
 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.savePersistentAttributes() 
                    .then(() => { 
                        resolve(); 
                    }) 
                    .catch((err) => { 
                        reject(err); 
                    }); 
 
            }); 
 
        } 
 
    } 
}; 
 
 
function shuffleArray(array) {  // Fisher Yates shuffle! 
 
    let currentIndex = array.length, temporaryValue, randomIndex; 
 
    while (0 !== currentIndex) { 
 
        randomIndex = Math.floor(Math.random() * currentIndex); 
        currentIndex -= 1; 
 
        temporaryValue = array[currentIndex]; 
        array[currentIndex] = array[randomIndex]; 
        array[randomIndex] = temporaryValue; 
    } 
 
    return array; 
} 
// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        AMAZON_NavigateHomeIntent_Handler, 
        RecommendationIntent_Handler, 
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

   // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 // .addRequestInterceptors(RequestPersistenceInterceptor)
 // .addResponseInterceptors(ResponsePersistenceInterceptor)

 // .withTableName("askMemorySkillTable")
 // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "agencia de viajes",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "RecommendationIntent",
          "slots": [
            {
              "name": "recurso",
              "type": "RECURSO_TYPE"
            },
            {
              "name": "tipo",
              "type": "TIPO_TYPE"
            },
            {
              "name": "presupuesto",
              "type": "PRESUPUESTO_TYPE"
            },
            {
              "name": "temporada",
              "type": "TEMPORADA_TYPE",
              "samples": [
                "para {temporada}",
                "sería para este {temporada}",
                "quiero ir en {temporada}"
              ]
            },
            {
              "name": "precio",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "precio_cuantificador",
              "type": "PRECIO_CUANTIFICADOR_TYPE"
            }
          ],
          "samples": [
            "encuentra {recurso} con un presupuesto {precio_cuantificador} {precio} euros",
            "encuentra {recurso} con un presupuesto {precio_cuantificador} a {precio} euros",
            "encuentra {recurso} a la {tipo}",
            "quiero hacer una {recurso} a la {tipo}",
            "necesito {recurso} de {presupuesto}",
            "necesito {recurso} {presupuesto}",
            "buscame {recurso} {tipo}",
            "donde puedo ir {temporada} para hacer {tipo} {presupuesto}",
            "recomiendame donde puedo ir para {tipo}",
            "busca {recurso} {presupuesto} en la {tipo} {temporada}",
            "{recurso} {presupuesto}",
            "necesito unas {recurso} {temporada}"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "RECURSO_TYPE",
          "values": [
            {
              "name": {
                "value": "hoteles",
                "synonyms": [
                  "restaurantes"
                ]
              }
            },
            {
              "name": {
                "value": "vacaciones",
                "synonyms": [
                  "viajes",
                  "escapada",
                  "excursion",
                  "descanso"
                ]
              }
            }
          ]
        },
        {
          "name": "TIPO_TYPE",
          "values": [
            {
              "name": {
                "value": "deportes",
                "synonyms": [
                  "surf",
                  "ski"
                ]
              }
            },
            {
              "name": {
                "value": "cultural",
                "synonyms": [
                  "arte",
                  "artistico"
                ]
              }
            },
            {
              "name": {
                "value": "gastronomico",
                "synonyms": [
                  "comer bien",
                  "comer",
                  "comida",
                  "gastronomica"
                ]
              }
            },
            {
              "name": {
                "value": "montaña",
                "synonyms": [
                  "sierra",
                  "monte"
                ]
              }
            },
            {
              "name": {
                "value": "playa",
                "synonyms": [
                  "mar",
                  "costa"
                ]
              }
            }
          ]
        },
        {
          "name": "PRESUPUESTO_TYPE",
          "values": [
            {
              "name": {
                "value": "barato",
                "synonyms": [
                  "menos de 200 ",
                  "sin gastarme mucho",
                  "baratos",
                  "baratas",
                  "barata",
                  "a lo pobre",
                  "poco dinero"
                ]
              }
            },
            {
              "name": {
                "value": "caro",
                "synonyms": [
                  "mas de 200",
                  "a todo lujo",
                  "lujo"
                ]
              }
            }
          ]
        },
        {
          "name": "TEMPORADA_TYPE",
          "values": [
            {
              "name": {
                "value": "invierno",
                "synonyms": [
                  "invernales",
                  "invernal",
                  "fresco"
                ]
              }
            },
            {
              "name": {
                "value": "verano",
                "synonyms": [
                  "veraniego",
                  "calorcito",
                  "calor"
                ]
              }
            }
          ]
        },
        {
          "name": "PRECIO_CUANTIFICADOR_TYPE",
          "values": [
            {
              "name": {
                "value": "menor que",
                "synonyms": [
                  "igual a",
                  "inferior a",
                  "menos de"
                ]
              }
            },
            {
              "name": {
                "value": "mayor que",
                "synonyms": [
                  "superior a",
                  "mas de"
                ]
              }
            }
          ]
        }
      ]
    },
    "dialog": {
      "intents": [
        {
          "name": "RecommendationIntent",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "recurso",
              "type": "RECURSO_TYPE",
              "confirmationRequired": false,
              "elicitationRequired": false,
              "prompts": {}
            },
            {
              "name": "tipo",
              "type": "TIPO_TYPE",
              "confirmationRequired": false,
              "elicitationRequired": false,
              "prompts": {}
            },
            {
              "name": "presupuesto",
              "type": "PRESUPUESTO_TYPE",
              "confirmationRequired": false,
              "elicitationRequired": false,
              "prompts": {}
            },
            {
              "name": "temporada",
              "type": "TEMPORADA_TYPE",
              "confirmationRequired": false,
              "elicitationRequired": true,
              "prompts": {
                "elicitation": "Elicit.Slot.1115325665738.1306280433157"
              }
            },
            {
              "name": "precio",
              "type": "AMAZON.NUMBER",
              "confirmationRequired": false,
              "elicitationRequired": false,
              "prompts": {}
            },
            {
              "name": "precio_cuantificador",
              "type": "PRECIO_CUANTIFICADOR_TYPE",
              "confirmationRequired": false,
              "elicitationRequired": false,
              "prompts": {}
            }
          ]
        }
      ]
    },
    "prompts": [
      {
        "id": "Elicit.Slot.1115325665738.1306280433157",
        "variations": [
          {
            "type": "PlainText",
            "value": "cuándo quieres éstas {recurso}"
          },
          {
            "type": "PlainText",
            "value": "Cuándo quieres tomarte esas vacaciones"
          }
        ]
      }
    ]
  }
};
