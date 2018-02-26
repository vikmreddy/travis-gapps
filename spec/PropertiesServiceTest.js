/**
 * PropertiesServiceTest - Class used to simulate the PropertiesService in tests
 * @constructor
 */

this['TestLib'] = this['TestLib'] || {};

TestLib.properties = {};

function PropertiesServiceTest(){
    this.properties = new PropertiesTest();
}

PropertiesServiceTest.prototype.getDocumentProperties = function(){
    return TestLib.properties;
};

function PropertiesTest(){

}

PropertiesTest.prototype.getProperty = function(key){
    //TODO: error management
    if(TestLib.properties[key]){return Lib[key];}
};

PropertiesTest.prototype.setProperty = function(key, propertyValue){
    TestLib.properties[key] = propertyValue;
    return TestLib.properties;
};

PropertiesTest.prototype.deleteProperty = function(key){
    if(TestLib.properties[key]){delete TestLib.properties[key];}
    return TestLib.properties;
};