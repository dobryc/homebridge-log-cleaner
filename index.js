"use strict";

let Service, Characteristic;
const fs = require('fs/promises');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-log-cleaner', 'HomebridgeLogCleaner', LogCleaner);
};

class LogCleaner {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.currentLogSize = 0;
        this.lastCleanDate = new Date();
        this.islastClearSuccessful = true;
        this.logFilePath = `${api.user.customStoragePath}/homebridge.log`;

        this.cleanPeriodInHours =  config.cleanPeriodInHours ? config.cleanPeriodInHours : 24;
        this.maxLogSizeInMb = config.maxLogSizeInMb ? config.maxLogSizeInMb : 10;
        this.debugMode = config.debugMode ? config.debugMode : false;

        this.cleaner = new Service.Fan(this.config.name);

        this.cleaner.getCharacteristic(Characteristic.On)
            .on("get", this.getPower.bind(this))
            .on("set", this.setPower.bind(this));

        this.cleaner.getCharacteristic(Characteristic.RotationSpeed)
            .on("get", this.getLogSize.bind(this));

        setInterval( () => {
            fs.stat(this.logFilePath) 
                .then((stats) => {
                    this.currentLogSize = (stats.size / (Math.pow(1024,2))).toFixed(4);

                    if (this.debugMode) {
                        this.log(`Current log size is ${this.currentLogSize}Mb`);
                    }

                    if (this.currentLogSize > this.maxLogSizeInMb) {
                        this.cleanLog(`log size is greater than ${this.maxLogSizeInMb}Mb`);
                    }

                    let currentDateTime = new Date();
                    var interval = (currentDateTime - this.lastCleanDate) / 1000 / 60 / 60;

                    if (interval > this.cleanPeriodInHours) {
                        this.cleanLog(`cleaning interval reached`);
                        this.lastCleanDate = currentDateTime;
                    }
                })
                .catch(err => {
                    this.log(`Error while accessing to log file ${err.message}`);
                });
        }, 2000);
    }

    getServices = function() {
        if (!this.cleaner) {
            return [];
        }
            
        const infoService = new Service.AccessoryInformation();
        infoService.setCharacteristic(Characteristic.Manufacturer, 'Ivdobryakov');
        return [infoService, this.cleaner];
    }

    getPower = function(callback) {
        callback(null, this.islastClearSuccessful);
    }

    setPower = function(callback) {
        this.cleanLog(`user forced clear`);
        callback(null);
    }

    getLogSize = function(callback) {
        callback(null, this.currentLogSize / this.maxLogSizeInMb * 100);
    }

    updateUI = function() {
        setTimeout(() => {
            this.cleaner.getCharacteristic(Characteristic.On).updateValue(true);
            this.cleaner.getCharacteristic(Characteristic.RotationSpeed).updateValue(this.currentLogSize.toFixed(2));
        }, 100);
    }

    cleanLog = function(reason) {
        fs.writeFile(this.logFilePath, `Log file ${this.logFilePath} cleared, reason : ${reason}\n`)
        .then(() => {
            this.islastClearSuccessful = true;
        })
        .catch(err => {
            this.islastClearSuccessful = false;
            this.log(`Error clearing log file at ${this.logFilePath} : ${err.message}`);
        });
    }
}