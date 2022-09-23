#!/usr/bin/env node

var fs = require('fs');
var path = require("path");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var semver = require('semver');
var builder = new xml2js.Builder({
    xmldec: {
        version: '1.0',
        encoding: 'UTF-8'
    }
});

module.exports = function (context) {

    if(context.opts.platforms.indexOf('android') === -1) return;

    console.log('Attempting to set app name');

    var projectRoot = context.opts.projectRoot;

    const usesNewStructure = fs.existsSync(path.join(projectRoot, 'platforms', 'android', 'app'));
    const basePath = usesNewStructure ? path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main') : path.join(projectRoot, 'platforms', 'android');
    var configPath = path.join(basePath, 'res', 'xml', 'config.xml');
    var stringsPath = path.join(basePath, 'res', 'values', 'strings.xml');
    var gradleNamePath = path.join(projectRoot, 'platforms', 'android', 'cdv-gradle-name.gradle');
    var stringsXml, name;

    // make sure the android config file exists
    try {
        fs.accessSync(configPath, fs.F_OK);
    } catch(e) {
        console.error(`Could not find android config.xml at ${configPath}`);
        return;
    }

    name = getConfigParser(context, configPath).getPreference('AppName');

    if (name) {
        var gradleName = name.replace(/^\.*/, '');
        gradleName = gradleName.replace(/\.*$/, '');
        console.log('Change GradleName from ' + name + ' to ' + gradleName);
        fs.writeFileSync(gradleNamePath, 'rootProject.name = ' + gradleName);
    }
};

function getConfigParser(context, config) {

    if (semver.lt(context.opts.cordova.version, '5.4.0')) {
        ConfigParser = require('cordova-lib/src/ConfigParser/ConfigParser');
    } else {
        ConfigParser = require('cordova-common/src/ConfigParser/ConfigParser');
    }

    return new ConfigParser(config);
}
