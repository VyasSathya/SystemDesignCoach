# First, make sure we're in the project root directory
Set-Location "C:\Users\Vyas\system-design-coach"

# Clean and install client dependencies
if (Test-Path "client\.next") {
    Remove-Item -Recurse -Force "client\.next"
}

# Install root dependencies
npm install

# Install server dependencies
if (Test-Path "server") {
    Set-Location "server"
    npm install
    Set-Location ".."
}

# Install client dependencies
if (Test-Path "client") {
    Set-Location "client"
    npm install
    Set-Location ".."
}

# Run both server and client
npm run dev

