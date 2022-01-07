# HomeBridge log clearer

## Introduction

This homebridge plugin automaticly clears the Homebridge.log file after a certain period or when it reaches a certain size. 



## Homebridge sample config


```json
"accessories": [
        {
            "name": "Log cleaner",
            "accessory": "HomebridgeLogCleaner",
            "cleanPeriodInHours": 48, // automatic clear periaod, in hours
            "maxLogSizeInMb": 10, // maximum log size in megabytes, before it will be cleared
            "debugMode": false // just for logging current config size
        },
        // your other accessories
]
```

This accessory behaves like a fan, rotation speed is a percentage value of current log size to your max log size.

To force clean the log file, just tap on a fan.

##Instalation:
````
npm i homebridge-log-cleaner
````
...or use Homebridge built-in search