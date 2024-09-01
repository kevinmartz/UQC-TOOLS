#target photoshop

function convertWebtoonStandardSize() {
    var doc = app.activeDocument;

    if (!doc) {
        alert("No active document found.");
        return;
    }

    doc.resizeImage(
        800,           
        null,          
    );

    doc.resizeCanvas(doc.width, doc.height, AnchorPosition.MIDDLECENTER);

    alert("Image has been resized to Webtoon Standard size.");
}

function showDialog() {
    var dlg = new Window('dialog', 'UQC TOOLS 2.0 - Made by Regis');
    dlg.alignChildren = 'center';

    var warnText = dlg.add('statictext', undefined, 'Always save your PSD you dummo before regretting it!');
    warnText.graphics.font = ScriptUI.newFont("Arial", "Bold", 12);
    warnText.graphics.foregroundColor = warnText.graphics.newPen(warnText.graphics.PenType.SOLID_COLOR, [0.2, 0.6, 0.8, 1], 1);

    var rawsCLRDGroup = dlg.add('group');
    rawsCLRDGroup.orientation = 'row';

    var addRawsPanel = rawsCLRDGroup.add('panel', undefined, 'Add Raws');
    addRawsPanel.orientation = 'column';
    addRawsPanel.add('statictext', undefined, 'Adds raw files as layers below the existing content.');
    var addRawsBtn = addRawsPanel.add('button', undefined, 'Add Raws');

    var addCLRDPanel = rawsCLRDGroup.add('panel', undefined, 'Add CLRD');
    addCLRDPanel.orientation = 'column';
    addCLRDPanel.add('statictext', undefined, 'Adds CLRD files as layers above the existing content.');
    var addCLRDBtn = addCLRDPanel.add('button', undefined, 'Add CLRD');

    var smartActionsGroup = dlg.add('group');
    smartActionsGroup.orientation = 'row';

    var smartStitchPanel = smartActionsGroup.add('panel', undefined, 'Smart Stitch');
    smartStitchPanel.orientation = 'column';
    smartStitchPanel.add('statictext', undefined, 'Merge opened documents or selected files into a single vertical PNG.');
    smartStitchPanel.add('statictext', undefined, 'Always choose your save location before using Smart Stitch or Smart Split.', {name: 'stitchWarn'});
    smartStitchPanel.children['stitchWarn'].graphics.foregroundColor = smartStitchPanel.children['stitchWarn'].graphics.newPen(smartStitchPanel.children['stitchWarn'].graphics.PenType.SOLID_COLOR, [0.2, 0.6, 0.8, 1], 1);
    var smartStitchBtn = smartStitchPanel.add('button', undefined, 'Smart Stitch');

    var smartSplitPanel = smartActionsGroup.add('panel', undefined, 'Smart Split');
    smartSplitPanel.orientation = 'column';
    smartSplitPanel.add('statictext', undefined, 'Split a merged PNG into multiple JPGs (custom height).');
    smartSplitPanel.add('statictext', undefined, 'Close all other opened documents except the "merged" one before splitting.', {name: 'splitWarn'});
    smartSplitPanel.children['splitWarn'].graphics.foregroundColor = smartSplitPanel.children['splitWarn'].graphics.newPen(smartSplitPanel.children['splitWarn'].graphics.PenType.SOLID_COLOR, [0.2, 0.6, 0.8, 1], 1);
    var smartSplitBtn = smartSplitPanel.add('button', undefined, 'Smart Split');
    
    var resizePanel = dlg.add('panel', undefined, 'Convert To Webtoon Standard Size');
    resizePanel.orientation = 'column';
    resizePanel.add('statictext', undefined, 'Resize the image to Webtoon Standard size.');
    var resizeBtn = resizePanel.add('button', undefined, 'Convert To Webtoon Standard Size');

    var saveSourceGroup = dlg.add('group');
    saveSourceGroup.orientation = 'row';

    var saveLocationPanel = saveSourceGroup.add('panel', undefined, 'Save Location');
    saveLocationPanel.orientation = 'column';
    saveLocationPanel.add('statictext', undefined, 'Choose your save location before using Merge or Split.');
    var saveLocationBtn = saveLocationPanel.add('button', undefined, 'Choose Save Location');

    var radioGroup = saveSourceGroup.add('panel', undefined, 'File Source');
    radioGroup.orientation = 'column';
    var useOpenedFiles = radioGroup.add('radiobutton', undefined, 'Opened Files');
    var useChosenFiles = radioGroup.add('radiobutton', undefined, 'Choose Files');
    useOpenedFiles.value = true; 

    var footer = dlg.add('statictext', undefined, 'Change whatever you want in this script, make sure to give me credit lol - Regis');

    var exitBtn = dlg.add('button', undefined, 'Exit');
    dlg.cancelElement = exitBtn;
    
    exitBtn.onClick = function() {
        dlg.close(0);
    };

    dlg.addEventListener('keydown', function(event) {
        if (event.keyName === 'Escape') {
            event.preventDefault();
            dlg.close(0);
        }
    });

    var saveLocation = null;

    addRawsBtn.onClick = function() {
        dlg.close(1);
    };
    
    addCLRDBtn.onClick = function() {
        dlg.close(2);
    };

    smartStitchBtn.onClick = function() {
        dlg.close(3);
    };

    smartSplitBtn.onClick = function() {
        dlg.close(4);
    };

    resizeBtn.onClick = function() {
        convertWebtoonStandardSize();
        dlg.close(5);
    };

    saveLocationBtn.onClick = function() {
        var folder = Folder.selectDialog("Choose a folder to save your files");
        if (folder) {
            saveLocation = folder.fsName;
            alert("Save location set to: " + saveLocation);
        }
    };

    var choice = dlg.show();

    var fileSource;
    if (choice === 1 || choice === 2) {
        fileSource = 'chosen';
    } else {
        fileSource = useOpenedFiles.value ? 'opened' : 'chosen';
    }

    return { choice: choice, saveLocation: saveLocation, fileSource: fileSource };
}

function sortFiles(fileList) {
    fileList.sort(function(a, b) {
        var nameA = a.name.toLowerCase();
        var nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true });
    });
}

function addFiles(files, option, openDocs) {
    var docCount = Math.min(openDocs.length, files.length);

    for (var i = 0; i < docCount; i++) {
        var doc = openDocs[i];
        app.activeDocument = doc;

        var fileRef = files[i];
        var tempDoc = open(fileRef);

        tempDoc.selection.selectAll();
        tempDoc.selection.copy();
        tempDoc.close(SaveOptions.DONOTSAVECHANGES);

        app.activeDocument = doc;
        var newLayer = app.activeDocument.paste();

        if (option === 1) { 
            if (doc.artLayers[doc.artLayers.length - 1].isBackgroundLayer) {
                doc.artLayers[doc.artLayers.length - 1].isBackgroundLayer = false;
            }
        
            newLayer.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);

        } else if (option === 2) { 
            newLayer.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEBEFORE);
        }
    }
}

function customTrim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

function mergeToPNG(documentsOrFiles, saveLocation, quality) {
    var fileName = prompt("PLEASE DO NOT CHANGE THE NAME:", "merged");

    if (fileName === null || fileName === undefined) {
        alert("No file name entered. The operation has been cancelled.");
        return;
    }

    fileName = customTrim(String(fileName)).replace(/\.png$/i, "");
    if (fileName === "") {
        alert("Invalid file name. The operation has been cancelled.");
        return;
    }

    var totalHeight = 0;
    var maxWidth = 0;
    var docs = [];
    var openDocs = app.documents;

    for (var i = 0; i < documentsOrFiles.length; i++) {
        var doc;
        if (documentsOrFiles[i].typename === "Document") {
            doc = documentsOrFiles[i];
        } else {
            doc = open(documentsOrFiles[i]);
        }
        totalHeight += doc.height;
        maxWidth = Math.max(maxWidth, doc.width);
        docs.push(doc);
    }

    var mergedDoc = app.documents.add(maxWidth, totalHeight, 72, "Merged", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    var currentY = 0;

    for (var i = 0; i < docs.length; i++) {
        app.activeDocument = docs[i];

        docs[i].flatten();

        docs[i].artLayers[0].duplicate(mergedDoc);
        app.activeDocument = mergedDoc;
        mergedDoc.activeLayer = mergedDoc.artLayers[0];
        mergedDoc.activeLayer.translate(0, currentY);
        currentY += docs[i].height;
    }

    for (var j = openDocs.length - 1; j >= 0; j--) {
        if (openDocs[j] !== mergedDoc) {
            openDocs[j].close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    app.activeDocument = mergedDoc;

    alert("Merged file has been created.");
    return saveLocation;
}


function splitPNG(doc, saveLocation, customHeight, sensitivity, scanStep) {
    if (!doc || !saveLocation) {
        alert("No active document or save location selected.");
        return;
    }

    var splitHeight = customHeight;
    var sensitivityInput = sensitivity;
    var scanStepInput = scanStep;

    var tempFile = new File(saveLocation + "/Merged.png");
    
    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.compression = 0;
    doc.saveAs(tempFile, pngSaveOptions, true, Extension.LOWERCASE);

    var scriptFolder = new Folder($.fileName).parent;
    var pythonScriptFile = new File(scriptFolder + "/smart_split.py");

    var isWindows = $.os.toLowerCase().indexOf("windows") >= 0;
    var pythonCmd = isWindows ? "python" : "python3";

    var cmd = pythonCmd + " \"" + pythonScriptFile.fsName + "\" \"" + tempFile.fsName + "\" \"" + saveLocation + "\" " + splitHeight + " " + sensitivityInput + " " + scanStepInput;

    var progressBar = new Window("palette", "Splitting Image...");
    progressBar.progressBar = progressBar.add("progressbar", [20, 20, 300, 50], 0, 100);
    progressBar.statusText = progressBar.add("statictext", [20, 60, 300, 80], "Initializing...");
    progressBar.cancelButton = progressBar.add("button", undefined, "Cancel");
    progressBar.show();

    var cancelled = false;
    progressBar.cancelButton.onClick = function() {
        cancelled = true;
        progressBar.close();
    };

    executeCommand(cmd, progressBar, isWindows, function() {
        if (!cancelled) {
            alert("Smart Split completed. Files saved to: " + saveLocation);
        } else {
            alert("Smart Split cancelled.");
        }
        tempFile.remove();
    });
}

function executeCommand(cmd, progressBar, isWindows, callback) {
    var outputFile = new File(Folder.temp + "/python_output.txt");
    
    if (isWindows) {
        system(cmd + " > \"" + outputFile.fsName + "\" 2>&1");
    } else {
        system("(" + cmd + ") > \"" + outputFile.fsName + "\" 2>&1");
    }
    
    outputFile.open('r');
    while(!outputFile.eof && progressBar.visible) {
        var line = outputFile.readln();
        if (line.indexOf("Progress:") === 0) {
            var progress = parseFloat(line.split(":")[1]);
            progressBar.progressBar.value = progress;
            progressBar.statusText.text = "Processing: " + progress.toFixed(2) + "%";
        } else if (line.indexOf("Total slices:") === 0) {
            var totalSlices = parseInt(line.split(":")[1]);
            progressBar.progressBar.maxvalue = totalSlices;
        } else if (line.indexOf("Slice saved:") === 0) {
            progressBar.progressBar.value++;
            var currentSlice = progressBar.progressBar.value;
            var percentage = (currentSlice / progressBar.progressBar.maxvalue) * 100;
            progressBar.statusText.text = "Processing: " + percentage.toFixed(2) + "%";
        }
        progressBar.update();
    }
    outputFile.close();
    outputFile.remove();
    
    progressBar.close();
    callback();
}

function splitPNGFile(file, saveLocation, customHeight, sensitivity, scanStep) {
    var tempDoc = open(file);
    splitPNG(tempDoc, saveLocation, customHeight, sensitivity, scanStep);
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function main() {
    var saveLocation = null;

    while (true) {
        var userChoice = showDialog();
        if (userChoice.choice === 0) {
            break; 
        }

        saveLocation = userChoice.saveLocation || saveLocation;

        var openDocs = app.documents;
        var selectedFiles = null;

        if (userChoice.fileSource === 'chosen') {
            selectedFiles = File.openDialog("Select the files to be processed", "All Files: *.*", true);
            if (!selectedFiles) {
                alert("No files selected. The operation has been cancelled.");
                continue;
            }
            sortFiles(selectedFiles);
        }

        if (userChoice.choice === 1) {
            addFiles(selectedFiles, 1, openDocs);
        } else if (userChoice.choice === 2) {
            addFiles(selectedFiles, 2, openDocs);
        } else if (userChoice.choice === 3) {
            if (userChoice.fileSource === 'opened') {
                var saved = prompt("Have you saved your PSDs? If not, they will be closed during merging. Type 'Yes' to proceed or 'No' to cancel:", "Yes");
                if (saved === null || saved.toLowerCase() !== 'yes') {
                    alert("Operation cancelled.");
                    continue;
                }
            }
            var autoSave = userChoice.fileSource !== 'opened';
            var documentsOrFiles = userChoice.fileSource === 'opened' ? openDocs : selectedFiles;
            saveLocation = mergeToPNG(documentsOrFiles, saveLocation, 12, autoSave);
        } else if (userChoice.choice === 4) {
            if (!saveLocation) {
                alert("No save location selected. Please choose a save location first.");
                continue;
            }

            if (userChoice.fileSource === 'opened') {
                var doc = app.activeDocument;
                if (doc) {
                    var splitHeight = prompt("Enter the rough output height for each split:", "8000");
                    if (splitHeight === null) {
                        alert("Operation cancelled.");
                        continue;
                    }
                    splitHeight = parseInt(splitHeight);
                    if (!isNaN(splitHeight) && splitHeight > 0) {
                        var sensitivity = prompt("Enter sensitivity (1-100, default 100):", "100");
                        if (sensitivity === null) {
                            alert("Operation cancelled.");
                            continue;
                        }
                        sensitivity = parseInt(sensitivity);
                        var scanStep = prompt("Enter scan step (5-100, default 60):", "60");
                        if (scanStep === null) {
                            alert("Operation cancelled.");
                            continue;
                        }
                        scanStep = parseInt(scanStep);
                        splitPNG(doc, saveLocation, splitHeight, sensitivity, scanStep);
                    } else {
                        alert("Invalid height entered.");
                    }
                } else {
                    alert("No active document found.");
                }
            } else if (userChoice.fileSource === 'chosen' && selectedFiles && selectedFiles.length > 0) {
                var splitHeight = prompt("Enter the rough output height for each split:", "8000");
                if (splitHeight === null) {
                    alert("Operation cancelled.");
                    continue;
                }
                splitHeight = parseInt(splitHeight);
                if (!isNaN(splitHeight) && splitHeight > 0) {
                    var sensitivity = prompt("Enter sensitivity (1-100, default 100):", "100");
                    if (sensitivity === null) {
                        alert("Operation cancelled.");
                        continue;
                    }
                    sensitivity = parseInt(sensitivity);
                    var scanStep = prompt("Enter scan step (5-100, default 60):", "60");
                    if (scanStep === null) {
                        alert("Operation cancelled.");
                        continue;
                    }
                    scanStep = parseInt(scanStep);
                    for (var i = 0; i < selectedFiles.length; i++) {
                        splitPNGFile(selectedFiles[i], saveLocation, splitHeight, sensitivity, scanStep);
                    }
                } else {
                    alert("Invalid height entered.");
                }
            } else {
                alert("No active document or files selected.");
            }
        }
    }
}

main();