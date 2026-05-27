# GymBuddy Mobile Setup

## 1. Instant phone testing

Use this while developing. The phone loads the Vite dev server directly from the laptop.

1. Connect the laptop and Android phone to the same Wi-Fi.
2. Start the dev server:

```powershell
npm run dev:phone
```

3. Find the laptop IP:

```powershell
ipconfig
```

4. On the phone, open:

```text
http://YOUR_LAPTOP_IP:3000
```

Example:

```text
http://192.168.1.50:3000
```

If it does not load, allow Node.js through Windows Firewall for private networks.

## 2. Shareable PWA

Deploy the repo to Vercel or Netlify. The app now includes a web manifest and service worker, so Android Chrome can add it to the home screen.

After deploy, open the deployed URL on Android Chrome and choose:

```text
Install app
```

or:

```text
Add to Home screen
```

Every push to the deployed branch updates the hosted app.

## 3. Installed Android app with live reload

Use this when you want a real Android wrapper while still seeing laptop changes on the phone.

Install Android Studio first, then run:

```powershell
npm run android:add
```

Start Vite:

```powershell
npm run dev:phone
```

In another terminal, run live reload using your laptop IP:

```powershell
npm run android:live -- --host YOUR_LAPTOP_IP
```

Example:

```powershell
npm run android:live -- --host 192.168.1.50
```

For a normal APK build after the Android project exists:

```powershell
npm run cap:sync
cd android
.\gradlew assembleDebug
```

The debug APK appears under:

```text
android\app\build\outputs\apk\debug\
```
