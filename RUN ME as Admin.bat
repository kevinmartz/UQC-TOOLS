@echo off


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


if not exist "%ScriptsDir%" (
    mkdir "%ScriptsDir%"
)


copy "%~dp0UQC TOOLS.jsx" "%ScriptsDir%"
copy "%~dp0smart_split.py" "%ScriptsDir%"


where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python is already installed.
    goto :skip_python_install
)


echo Downloading Python installer...
powershell -command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe' -OutFile '%TEMP%\python_installer.exe'"

echo Installing Python...
start /wait "" "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1


"%ProgramFiles%\Python311\python.exe" -m ensurepip
"%ProgramFiles%\Python311\python.exe" -m pip install --upgrade pip


del "%TEMP%\python_installer.exe"

:skip_python_install

echo Installing Python packages...


python -c "import numpy; import PIL" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Required packages are already installed.
    goto :finish
)


python -m pip install numpy pillow --quiet --force-reinstall

:finish

echo Script "UQC Tools" is installed.
pause
