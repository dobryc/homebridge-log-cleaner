"use strict";

let Service, Characteristic;
import { get, request } from 'http';   // HTTP POST / GET method.
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

export default function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-log-cleaner',
        'Dobryc homebridge log cleaner', logClean);
};


const logClean = function(log, config, api) {
    const period = this.period = this.config.cleanPeriod ? this.config.cleanPeriod : 10;
    let cleaner;

    this.cleaner = new Service.Switch(this.config.name);

    this.cleaner.getCharacteristic(Characteristic.On)
        .on("get", this.getPower.bind(this))
        .on("set", this.setPower.bind(this));

    setInterval(function() {
         console.log("Cleaning logs...")
    },period / 1000)
}

logClean.prototype = {
    getServices: function() {
        if (!this.cleaner) return [];
        const infoService =  
            new Service.AccessoryInformation();
        infoService
            .setCharacteristic(Characteristic.Manufacturer,
                'Dobryc')
        return [infoService, this.cleaner];
    },
    getPower: function(callback) {
        callback(null, true);
        //TODO return true if last clean was successfull
    },
    setPower: function(callback) {
        callback(null);
        //TODO clean now
    },
    updateUI: function () {
        setTimeout( () => {
            this.bulb.getCharacteristic(Characteristic.On).updateValue(true);
        }, 100);
    },
}