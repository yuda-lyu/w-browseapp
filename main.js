const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow } = require('electron');

//fdExe
let fdExe = process.env.PORTABLE_EXECUTABLE_DIR || __dirname

//fpSettings
let fpSettings = path.join(fdExe, 'settings.json');
console.log('fpSettings',fpSettings)

//st
let st;
try {
  st = JSON.parse(fs.readFileSync(fpSettings, 'utf8'));
} catch (err) {
  console.error('can not read settings.json', err);
  process.exit(1);
}
console.log('st',st)

// 檢查 st.userDataFolder 是否為有效字串
if (typeof st.userDataFolder !== 'string' || st.userDataFolder.trim() === '' || st.userDataFolder.trim() === '{your folder}') {
  console.error(`invalid st.userDataFolder[${st.userDataFolder}]`);
  process.exit(1);
}

// 檢查 st.dp 是否為有效數字，若不是則設為 1
if (typeof st.dp !== 'number' || st.dp === 0) {
  console.warn(`invalid or missing st.dp[${st.dp}], defaulting to 1.`);
  st.dp = 1;
}

app.once('ready', () => {

  // 設定 userData 資料夾
  if (st.userDataFolder) {
    app.setPath('userData', st.userDataFolder);
  }

  // 建立 BrowserWindow
  const win = new BrowserWindow({
    x: st.x/st.dp,
    y: st.y/st.dp,
    width: st.width/st.dp,
    height: st.height/st.dp,
    useContentSize: true,
    resizable: st.resizable,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
    }
  });

  // 等網頁載入完成再顯示
  win.webContents.on('did-finish-load', () => {
    win.show();
  });

  // 載入指定 URL
  win.loadURL(st.url)
  .then(()=>{
    win.webContents.setAudioMuted(true);
  })
  .catch(err => {
    console.error('load url error', err);
  });
  
});

app.on('window-all-closed', () => {
  app.quit();
});

//package.json:
// "build": {
//   "compression": "store", //不壓縮使開啟最快
//   "asar": true, //先把多檔案包成單檔
//   "win": { "target": ["portable"] },
//   ...
// }

//執行測試: npm run start

//編譯: npm run build
