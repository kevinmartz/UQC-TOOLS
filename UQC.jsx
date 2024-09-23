#target photoshop

function convertWebtoonStandardSize() {
    var doc = app.activeDocument;

    if (!doc) {
        alert("No active document found.");
        return;
    }

    doc.resizeImage(800, null);
    doc.resizeCanvas(doc.width, doc.height, AnchorPosition.MIDDLECENTER);
    alert("Image has been resized to Webtoon Standard size.");
}

function createUI() {
    var win = new Window("dialog", "UQC TOOLS 3.2 - Made by Regis");
    win.orientation = "column";
    win.alignChildren = ["center", "top"];
    win.spacing = 10;
    win.margins = 16;

    // element to hold focus cause its ez ( this is for ext condition and button, if you change it change the main too)
    var focusHolder = win.add("statictext", undefined, "");
    focusHolder.visible = false;

    // Warning text
    var warningGroup = win.add("group");
    warningGroup.orientation = "column";
    warningGroup.alignChildren = ["center", "center"];
    
    var warningText = warningGroup.add("statictext", undefined, "⚠️ WARNING ⚠️");
    warningText.graphics.font = ScriptUI.newFont("Arial", "Bold", 14);
    warningText.graphics.foregroundColor = warningText.graphics.newPen(warningText.graphics.PenType.SOLID_COLOR, [0.8, 0.2, 0.2, 1], 1);
    
    var warningMessage = warningGroup.add("statictext", undefined, "Always save your PSD before using these tools!");
    warningMessage.graphics.font = ScriptUI.newFont("Arial", "Bold", 12);
    warningMessage.graphics.foregroundColor = warningMessage.graphics.newPen(warningMessage.graphics.PenType.SOLID_COLOR, [0.8, 0.2, 0.2, 1], 1);
    
    
    // Main content
    var tabbedPanel = win.add("tabbedpanel");
    tabbedPanel.alignChildren = "fill";
    tabbedPanel.preferredSize = [400, 300];

    // Add Files Tab
    var addFilesTab = tabbedPanel.add("tab", undefined, "Add Files");
    addFilesTab.orientation = "column";
    addFilesTab.alignChildren = ["fill", "top"];
    addFilesTab.spacing = 10;
    addFilesTab.margins = 20;

    var addRawsBtn = addFilesTab.add("button", undefined, "Add Raws");
    var addCLRDBtn = addFilesTab.add("button", undefined, "Add CLRD");

    // Smart Actions Tab
    var smartActionsTab = tabbedPanel.add("tab", undefined, "Smart Actions");
    smartActionsTab.orientation = "column";
    smartActionsTab.alignChildren = ["fill", "top"];
    smartActionsTab.spacing = 10;
    smartActionsTab.margins = 20;

    var smartStitchBtn = smartActionsTab.add("button", undefined, "Smart Stitch");
    smartActionsTab.add("statictext", undefined, "Merge opened documents or selected files into a single vertical PNG.");

    var smartSplitBtn = smartActionsTab.add("button", undefined, "Smart Split");
    smartActionsTab.add("statictext", undefined, "Split a merged PNG into multiple JPGs (custom height).");

    var resizeBtn = smartActionsTab.add("button", undefined, "Convert To Webtoon Standard Size");

    // File Source and Save Location
    var optionsGroup = win.add("group");
    optionsGroup.orientation = "row";
    optionsGroup.alignChildren = ["fill", "top"];
    optionsGroup.spacing = 10;

    var radioGroup = optionsGroup.add("panel", undefined, "File Source");
    radioGroup.orientation = "column";
    radioGroup.alignChildren = ["left", "top"];
    radioGroup.spacing = 5;
    var useOpenedFiles = radioGroup.add("radiobutton", undefined, "Opened Files");
    var useChosenFiles = radioGroup.add("radiobutton", undefined, "Choose Files");
    useOpenedFiles.value = true;

    var saveGroup = optionsGroup.add("group");
    saveGroup.orientation = "column";
    saveGroup.alignChildren = ["fill", "top"];
    var saveLocationBtn = saveGroup.add("button", undefined, "Choose Save Location");
    var saveLocationText = saveGroup.add("statictext", undefined, "No location set");
    saveLocationText.characters = 20;

    // Footer
    var footerGroup = win.add("group");
    footerGroup.orientation = "column";
    footerGroup.alignChildren = ["center", "center"];
    var footer = footerGroup.add("statictext", undefined, "Script by Regis - Feel free to modify, give credit! You Dummo!!");
    footer.graphics.font = ScriptUI.newFont("Arial", "Italic", 10);

    // Buttons
    var buttonGroup = win.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignChildren = ["center", "center"];
    buttonGroup.spacing = 10;
    var exitBtn = buttonGroup.add("button", undefined, "Exit");

    // exit as a element cause idk this ez? and i dont have time to debug or make perfect code eh
    win.cancelElement = exitBtn;

    // Event listeners and functionality ( dont touch it if you are not sure where to add it )
    var saveLocation = null;
    var selectedFiles = null;

    // Escape key handling: Listen globally to the window ( ext condition but more on steroid, cause idk fucking photoshop does not like to exit scripts sometimes )
    win.addEventListener("keydown", function(event) {
        if (event.keyName === "Escape") {
            event.preventDefault();  // FC all
            win.close(-1);  // Return -1
        }
    });

    saveLocationBtn.onClick = function() {
        var folder = Folder.selectDialog("Choose a folder to save your files");
        if (folder) {
            saveLocation = folder.fsName;
            saveLocationText.text = saveLocation;
        }
    };

    addRawsBtn.onClick = function() {
        win.close(1);  // Return 1 for Add Raws
    };

    addCLRDBtn.onClick = function() {
        win.close(2);  // Return 2 for Add CLRD
    };

    // same thing as smart split
    smartStitchBtn.onClick = function() {
        if (!saveLocation) {
            alert("Please choose a save location first.");
            return;
        }
        if (useChosenFiles.value) {
            selectedFiles = File.openDialog("Select files to stitch", "All Files:*.*", true);
            if (selectedFiles) {
                mergeToPNG(selectedFiles, saveLocation, 12);
            }
        } else {
            var saved = confirm("Have you saved your PSDs? If not, they will be closed during merging.");
            if (saved) {
                mergeToPNG(app.documents, saveLocation, 12);
            }
        }
    };

    // conditions for smart actions ( these are important soo make sure have them either in youe main or as a seprate call just like mine )
    smartSplitBtn.onClick = function() {
    if (!saveLocation) {
        alert("Please choose a save location first.");
        return;
    }
    var splitHeight = prompt("Enter the rough output height for each split:", "8000");
    if (splitHeight === null) return;
    splitHeight = parseInt(splitHeight);
    if (isNaN(splitHeight) || splitHeight <= 0) {
        alert("Invalid height entered.");
        return;
    }
    var sensitivity = prompt("Enter sensitivity (1-100, default 100):", "100");
    if (sensitivity === null) return;
    sensitivity = parseInt(sensitivity);
    var scanStep = prompt("Enter scan step (5-100, default 60):", "60");
    if (scanStep === null) return;
    scanStep = parseInt(scanStep);

    if (useChosenFiles.value) {
        selectedFiles = File.openDialog("Select PNG files to split", "*.png", true);
        if (selectedFiles) {
            for (var i = 0; i < selectedFiles.length; i++) {
                splitPNGFile(selectedFiles[i], saveLocation, splitHeight, sensitivity, scanStep);
            }
        }
    } else {
        if (app.documents.length > 0) {
            splitPNG(app.activeDocument, saveLocation, splitHeight, sensitivity, scanStep);
        } else {
            alert("No active document found.");
        }
    }
};

    resizeBtn.onClick = function() {
        convertWebtoonStandardSize();
    };

    exitBtn.onClick = function() {
        win.close(0);
    };

    // Show the window ( for loop )
    return win.show();
}

function sortFiles(fileList) {
    fileList.sort(function(a, b) {
        var nameA = a.name.toLowerCase();
        var nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true });
    });
}

// The addFiles function
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

// this shit is still eh if you know how to imnprove it go on you have my thanks!
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

    var tempFile = new File(saveLocation + "/Merged.png");
    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.compression = 0;
    doc.saveAs(tempFile, pngSaveOptions, true, Extension.LOWERCASE);

    var scriptFolder = new Folder($.fileName).parent;
    var pythonScriptFile = new File(scriptFolder + "/smart_split.py");
    
    var isWindows = $.os.toLowerCase().indexOf("windows") >= 0;
    var pythonCmd = isWindows ? "python" : "python3";

    var cmd = pythonCmd + " \"" + pythonScriptFile.fsName + "\" \"" + tempFile.fsName + "\" \"" + saveLocation + "\" " + customHeight + " " + sensitivity + " " + scanStep;

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
    while (!outputFile.eof && progressBar.visible) {
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
    while (true) {
        var userChoice = createUI();

        // Only proceed with the addFiles function if userChoice is 1 or 2
        if (userChoice === -1 || userChoice === 0) {
            break;  // Exit if Escape (-1) or Cancel (0) is pressed
        }

        if (userChoice === 1 || userChoice === 2) {
            var openDocs = app.documents;
            var selectedFiles = File.openDialog("Select the files to be processed", "All Files: *.*", true);

            if (!selectedFiles) {
                alert("No files selected. The operation has been cancelled.");
                continue;
            }

            sortFiles(selectedFiles);
            addFiles(selectedFiles, userChoice, openDocs);
        } else {
        }
    }
}

main();
