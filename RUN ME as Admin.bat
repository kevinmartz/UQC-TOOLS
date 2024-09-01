@echo off

:: Find the Photoshop installation directory
for /d %%G in ("%ProgramFiles%\Adobe\Adobe Photoshop*") do (
    set PhotoshopDir=%%G
    goto :found
)

:found
if not defined PhotoshopDir (
    echo Photoshop installation not found.
    exit /b 1
)

set ScriptsDir=%PhotoshopDir%\Presets\Scripts

:: Create the Scripts directory if it doesn't exist
if not exist "%ScriptsDir%" (
    mkdir "%ScriptsDir%"
)

:: Copy the necessary files
copy "%~dp0UQC TOOLS.jsx" "%ScriptsDir%"
copy "%~dp0smart_split.py" "%ScriptsDir%"

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python is already installed.
    goto :skip_python_install
)

:: Python is not installed; proceed with installation
echo Downloading Python installer...
powershell -command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe' -OutFile '%TEMP%\python_installer.exe'"

echo Installing Python...
start /wait "" "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1

:: Ensure pip is available and updated
"%ProgramFiles%\Python311\python.exe" -m ensurepip
"%ProgramFiles%\Python311\python.exe" -m pip install --upgrade pip

:: Cleanup the Python installer
del "%TEMP%\python_installer.exe"

:skip_python_install
:: Install the required Python packages silently
echo Installing Python packages...

:: Check if the packages are installed
python -c "import numpy; import PIL" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Required packages are already installed.
    goto :finish
)

:: Install the packages
python -m pip install numpy pillow --quiet --force-reinstall

:finish
:: Display completion message
echo Script "UQC Tools" is installed.
pause
