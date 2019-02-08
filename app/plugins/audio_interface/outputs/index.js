'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = outputs;
function outputs(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

	this.output = {"availableOutputs": []};

}



outputs.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	return libQ.resolve();
}

outputs.prototype.onStart = function() {
	var self = this;
	var defer=libQ.defer();


	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

	return defer.promise;
};

outputs.prototype.onStop = function() {
	var self = this;
	var defer=libQ.defer();

	// Once the Plugin has successfull stopped resolve the promise
	defer.resolve();

	return libQ.resolve();
};

outputs.prototype.onRestart = function() {
	var self = this;
	// Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

outputs.prototype.getUIConfig = function() {
	var defer = libQ.defer();
	var self = this;

	var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
		__dirname+'/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
		.then(function(uiconf)
		{


			defer.resolve(uiconf);
		})
		.fail(function()
		{
			defer.reject(new Error());
		});

	return defer.promise;
};


outputs.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

outputs.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

outputs.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

/**
 * This function adds an output to the list, checking whether it's already there
 * notifies the system via broadcast
 * @param data: a json containing the new output parameters
 */
outputs.prototype.addAudioOutput = function (data) {
	var self = this;

	let new_output = data;

	self.logger.info("Adding audio output: ", new_output.id);

	if(new_output.id && new_output.name && new_output.type){

		let i = self.checkElement(new_output.id)

		if(!(i >= 0)) {
			self.output.availableOutputs.push(new_output);

			self.pushAudioOutputs();
		}
		else{
			self.logger.error("Can't add: ", new_output.id, " output is already in list");
		}
	}
	else {
		self.logger.error("Audio Outputs: can't add new output, because of " +
			"missing parameters");
	}
}

/**
 * This function updates an output already in the list with new parameters,
 * notifies the system via broadcast
 * @param data: a json containing the new parameters
 */
outputs.prototype.updateAudioOutput = function (data) {
	var self = this;

	var new_output = data;

	self.logger.info("Updating audio output: ", new_output.id);

	if(new_output.id && new_output.name && new_output.type){

		let i = self.checkElement(new_output.id);

		if (i >= 0) {
			self.output.availableOutputs[i-1] = new_output;

			self.pushAudioOutputs();
		}
	}
	else {
		self.logger.error("Audio Outputs: can't add new output, because of " +
			"missing parameters");
	}
}

/**
 * This function removes an output from the list, checking whether present,
 * notifies the system via broadcast
 * @param id: the id of the output to be removed
 */
outputs.prototype.removeAudioOutput = function (id) {
	var self = this;

	self.logger.info("Removing audio output: ", id);

	let i = self.checkElement(id);

	if (i >= 0) {
		self.output.availableOutputs.splice(i-1);

		self.pushAudioOutputs();
	}
}

/**
 * This function checks the existence of an id in the list, returns the position
 * @param id: the output to find
 * @returns the corresponding index or -1
 */
outputs.prototype.checkElement = function (id) {
	var self = this;
	let i = 0;
	let existing = false;

	while (i < self.output.availableOutputs.length && !existing){
		if (self.output.availableOutputs[i].id === id){
			existing = true;
		}
		i += 1;
	}

	if(existing)
		return i;
	else
		return -1;
}

outputs.prototype.getAudioOutputs = function () {
	var self = this;

	return self.output;
}

/**
 * This function broadcasts the outputs list
 */
outputs.prototype.pushAudioOutputs = function () {
	var self = this;

	self.commandRouter.broadcastMessage('pushAudioOutputs', self.getAudioOutputs());
}

outputs.prototype.setOutputs = function (data) {
	var self = this;

	self.output = data;
}