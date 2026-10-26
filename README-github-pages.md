# Protein Saathi: how to publish on Google Play

These are the app's website files. You will:
1. Put them on GitHub Pages (free hosting).
2. Use PWABuilder to turn the website into a Play Store file (.aab).
3. Upload that file to Google Play Console.

Budget about one hour for parts A–C, then 14 days of closed testing.

---

## A. Put the app on GitHub Pages (15 minutes)

1. Sign in at **github.com**. Note your username, for example `khedwal`.
2. Click **+ → New repository**.
   - Repository name must be exactly **`yourusername.github.io`** (for example `khedwal.github.io`).
     This matters: the Android app checks a verification file at the root of this address.
   - Choose **Public**, tick **Add a README file**, click **Create repository**.
3. Unzip **Protein_Saathi_app.zip** on your computer.
4. Before uploading, open `privacy.html` in Notepad, replace `CONTACT_EMAIL` with your support email, and save.
5. In the repository click **Add file → Upload files**. Drag in **everything inside** the unzipped folder:
   `index.html, app.js, styles.css, sw.js, manifest.webmanifest, privacy.html, .nojekyll` and the **icons** folder.
   Click **Commit changes**.
   - `.nojekyll` is an empty file and may be hidden on a Mac. If it didn't upload, click
     **Add file → Create new file**, name it `.nojekyll`, leave it empty, and commit.
6. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
7. After 1–2 minutes your app is live at **https://yourusername.github.io/**. Open it on your phone in Chrome to check.

## B. Make the Play Store file with PWABuilder (15 minutes)

1. Go to **www.pwabuilder.com**, paste `https://yourusername.github.io/` and click **Start**.
2. Click **Package for stores → Android → Generate package**. Use these settings:
   - **Package ID:** `io.github.yourusername.proteinsaathi` (all lowercase). This can never be changed after publishing.
   - **App name:** Protein Saathi · **Short name:** Protein Saathi
   - **Version:** 1.0.0 · **Version code:** 1
   - **Signing key:** *Create new*. Enter your name and organisation.
3. Download the zip. Inside you will find:
   - `*.aab`: the file you upload to Google Play
   - `*.apk`: install this on your own phone to test
   - `signing.keystore` and `signing-key-info.txt`: **keep these safe forever**
     (Google Drive plus a pen drive). You need them for every future update.
   - `assetlinks.json`: the verification file for step C.4

## C. Google Play Console

1. **Create app:** Play Console → **Create app** → name *Protein Saathi*, default language English (India), App, Free. Accept the declarations.
2. **Closed testing:** Test and release → Testing → **Closed testing** → Create track → **Create new release**.
   Accept **Play App Signing**, upload the `.aab`, and add release notes ("First release").
3. **Testers:** add an email list of **at least 12 people** (Gmail addresses). Share the opt-in link with them.
   Each must accept, install the app and **stay opted in for 14 days in a row**.
4. **Verification file (hides the browser address bar):**
   - Play Console → Test and release → Setup → **App signing** → copy the **SHA-256 certificate fingerprint** under *App signing key certificate*.
   - Open `assetlinks.json` from PWABuilder. Add the copied fingerprint to the `sha256_cert_fingerprints` list, keeping the one already there:
     `"sha256_cert_fingerprints": ["AA:BB:...(PWABuilder one)", "CC:DD:...(Google Play one)"]`
   - In your GitHub repository: **Add file → Create new file**, name it **`.well-known/assetlinks.json`**, paste the contents and commit.
   - Check it opens at `https://yourusername.github.io/.well-known/assetlinks.json`.
5. **Store listing and App content:** copy the text and answers from `store-listing.txt`, and upload the images from the store-assets folder.
6. After 14 days of testing, go to **Dashboard → Apply for production** and answer Google's short questionnaire.

## Updating the app later

- **Content or design changes:** replace the files on GitHub. Phones pick up the change automatically, with no new Play release needed.
  Also change `CACHE` in `sw.js` (for example `v1.0.1`) so phones fetch the new files.
- **Name, icon or package changes:** regenerate in PWABuilder with the **same signing key** and a higher version code, then upload a new release.

## Privacy

The app makes no network requests with user data. Everything is saved in the phone's local storage.
Users can back up, restore or delete their data from the Profile tab.
