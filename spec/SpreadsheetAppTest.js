/**
 * SpreadsheetAppTest - Class object used for tests that simulate a spreadsheet as close as possible from SpreadsheetApp
 * @constructor
 */
function SpreadsheetAppTest(){
    this.activeSpreadsheet = new SpreadsheetTest();
}

SpreadsheetAppTest.prototype.getActiveSpreadsheet = function(){
    return this.activeSpreadsheet;
};

/**
 * SpreadsheetTest - Class object used for tests that simulate a spreadsheet as close as possible from Spreadsheet
 * @constructor
 */
function SpreadsheetTest(){
    this.sheets = [new SheetTest("Sheet1", this)];
    this.activeSheet = 0;
}

SpreadsheetTest.prototype.getActiveSheet = function(){
    return this.sheets[this.activeSheet];
};

SpreadsheetTest.prototype.getSheetByName = function(name){
    for(var i=0; i < this.sheets.length; i++){
        if (this.sheets[i].name === name){
            return this.sheets[i];
        }
    }
};

SpreadsheetTest.prototype.getSheets = function(){
    return this.sheets;
};

SpreadsheetTest.prototype.insertSheet = function(sheetName, position){
    var newSheet;
    if(typeof position !== "undefined") {
        if (this.getSheetByName(sheetName)) {
            throw "You cannot create two sheets with the same name";
        }
        newSheet = new SheetTest(sheetName, this);
        this.sheets.splice(position, 0, newSheet);
        return newSheet;
    } else {
        if (this.getSheetByName(sheetName)){
            throw "You cannot create two sheets with the same name" ;
        }
        newSheet = new SheetTest(sheetName, this);
        this.sheets.push(newSheet);
        return newSheet;
    }
};

SpreadsheetTest.prototype.getName = function () {
    return "Test spreadSheet"
};

SpreadsheetTest.prototype.getUrl = function () {
    return "https://docs.google.com/spreadsheets/d/123456789"
};

function SheetTest(sheetName, spreadsheetTest){
    this.name = sheetName;
    var rows = new Array(1000);
    for(var i=0; i < rows.length; i++){
        rows[i] = new Array(100);
        Array.apply(null, rows[i]).map(String.prototype.valueOf, "")
    }
    this.data = rows;
    this.rowFrozen = 0;
    this.spreadsheetTest=spreadsheetTest;
}

SheetTest.prototype.activate = function(){
    var spreadsheetParent = this.spreadsheetTest;
    for(var i=0; i<spreadsheetParent.sheets.length; i++){
        if(this===spreadsheetParent[i]){
            spreadsheetParent.activeSheet = i;
        }
    }
};

SheetTest.prototype.clearContents = function(){
    var rows = new Array(this.data.length);
    for(var i=0; i < rows.length; i++){
        rows[i] = new Array(this.data[i].length);
        Array.apply(null, rows[i]).map(String.prototype.valueOf, "")
    }
    this.data = rows;
};

SheetTest.prototype.clear = function(){
    var rows = new Array(this.data.length);
    for(var i=0; i < rows.length; i++){
        rows[i] = new Array(this.data[i].length);
        Array.apply(null, rows[i]).map(String.prototype.valueOf, "")
    }
    this.data = rows;
};

SheetTest.prototype.deleteColumn = function(numCol){
    this.data.forEach(function(x){
        x.splice(numCol-1,1);
    });
    return this;
};

SheetTest.prototype.getDataRange = function(){
    var numRow=0;
    var numCol=0;
    for(var i=0; i < this.data.length; i++){
        for(var j=0; j < this.data[i].length; j++){
            if (this.data[i][j] != "") {
                numRow=i;
                if (j>numCol){
                    numCol = j;
                }
            }
        }
    }
    return new RangeTest(1, 1, numRow+1, numCol+1, this);
};

SheetTest.prototype.getMaxColumns = function(){
    return this.data[0].length;
};


SheetTest.prototype.getMaxRows = function(){
    return this.data.length;
};

SheetTest.prototype.getLastColumn = function(){
    var i = this.data[0].length;
    var maxColumn = null;
    while (i >= 0) {
        if (this.data[0][i] && i > maxColumn) maxColumn = i;
        i--
    }
    return maxColumn + 1;
};

SheetTest.prototype.getRange = function(row, col, numRow, numCol){
    return new RangeTest(row, col, numRow, numCol, this);
};

SheetTest.prototype.getSheetName = function(){
    return this.name;
};

SheetTest.prototype.insertColumnAfter = function(numCol){
    this.data.map(function(row){
        row.splice(numCol, 0, "");
    })
};

SheetTest.prototype.setFrozenRows = function(number){
    this.rowFrozen = number;
};

SheetTest.prototype.setName = function(newName){
    this.name = newName;
};

function RangeTest(rowPosition, colPosition, rowLength, colLength, sheetTest){
    this.rowPosition = rowPosition;
    this.colPosition = colPosition;
    this.rowLength = rowLength;
    this.colLength = colLength;
    this.sheetTest = sheetTest;
}

RangeTest.prototype.clearContent = function(){
    for (var i=0; i < this.rowLength; i++){
        for (var j=0; j < this.colLength; j++){
            this.sheetTest.data[this.rowPosition - 1][this.colPosition - 1] = "";
        }
    }
    return this;
};

RangeTest.prototype.getValue = function(){
    return this.sheetTest.data[this.rowPosition - 1][this.colPosition - 1];
};

RangeTest.prototype.getValues = function(){
    var rows = [];
    for(var i = this.rowPosition - 1; i < this.rowPosition - 1 + this.rowLength; i++){
        var cols=[];
        for(var j = this.colPosition - 1; j < this.colPosition - 1 + this.rowLength; j++){
            cols.push(this.sheetTest.data[i][j]);
        }
        rows.push(cols);
    }
    return rows;
};

RangeTest.prototype.isBlank = function(){
    return (this.getValue() === undefined || this.getValue() === "");
};

RangeTest.prototype.setValue = function(value){
    this.sheetTest.data[this.rowPosition - 1][this.colPosition - 1] = value;
    return this;
};

RangeTest.prototype.getHeight = function(){ return this.rowLength};

RangeTest.prototype.setValues = function(twoDimArray){
    //TODO: check if the dimensions are valid
    for (var i=0; i < twoDimArray.length; i++){
        for (var j=0; j < twoDimArray[i].length; j++){
            this.sheetTest.data[this.rowPosition - 1+i][this.colPosition - 1+j] = twoDimArray[i][j];
        }
    }
    return this;
};