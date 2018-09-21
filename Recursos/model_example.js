

{
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
}