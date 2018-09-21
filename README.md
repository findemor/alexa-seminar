README.md

## Launch Phrases:

Son elementos que tenemos que especificar para que alexa sepa que queremos hacer.

* Wake word: __Alexa,__

Puede cambiarse

* Launch: Alexa, __open__

PUede ser busca, lanza, abre, inicia, comienza, dile a...
Trata de jugar con ellas y tu Invocation name para ver cual queda bien y que todas encajan.

* Invocation name: Alexa, open __pet match__

Hay que intentar evitar articulos. Elegirlo de dos palabras o mas y ser facil de pronunciar en el pais de destino (las cosas como suenan). Si solo hay una palabra, la gente de certificacion va a pedir validacion de que eres el dueño de la marca (suelen ser reservados para marcas).

* Utterance: Alexa, open pet match __for a dog__.

"we like small dogs", "for a big dog", "we like small dogs", "i want a dog that plays fetch"

Es material de entrenamiento, vamos a tener que darle ejemplos para que entrene el modelo. No tenemos que meter todos los posibles casos, pero si dar casos de todas las formas parecidas que se nos ocurran.


Sinonmos = slots

### Privacidad:

No vas a tener nunca acceso a la frase completa ni al audio. En el proceso de desarrollo si, de tu informaicó, pero en la aplicacion publicada no es así.

## Intents

Detectara la launch phrase y esto provocará la invoación de un  Intent. 

Hay __AMAZON.helpIntent__ __AMAZON.stopIntent__ y el custom __RecommendationIntent__ que es el que desarrollaremos.

Tambien puedes hacer distintos intents para tu aplicacion, en funcion de las frases usadas, por ejemplo __Favourite intents__ que puede recordar cosas que ya has hecho.


## Slots

Alexa, pregunta a X por __un perro__,
Alexa, quiero que preguntes a X por __lagartos__,

Cada uno de estos terminos son realmente Slots (variables), en el RecommendationIntent recibiremos 

{ Name: pet, value: dog }

## Alexa for business / Alexa BetaTesting

El primero se puede activar en ciertos dispositivos, empresas, etc.

El segundo es hasta 500 usarios.