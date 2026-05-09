const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../docs/obsidian/AI業務活用診断レポート_開発メモ.md');
const VAULT_DIR = 'C:\\Users\\yutaa\\OneDrive\\Documents\\Obsidian Vault\\ai-gyomu-diagnosis-report';
const DEST_FILE = path.join(VAULT_DIR, 'AI業務活用診断レポート_開発メモ.md');

function syncObsidian() {
  console.log('--- Obsidian Sync Start ---');

  // ソースファイルの存在確認
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Error: Source file not found at ${SOURCE_FILE}`);
    process.exit(1);
  }

  // 出力先フォルダの作成（存在しない場合）
  try {
    if (!fs.existsSync(VAULT_DIR)) {
      console.log(`Creating directory: ${VAULT_DIR}`);
      fs.mkdirSync(VAULT_DIR, { recursive: true });
    }
  } catch (err) {
    console.error(`Error creating directory: ${err.message}`);
    process.exit(1);
  }

  // ファイルのコピー
  try {
    fs.copyFileSync(SOURCE_FILE, DEST_FILE);
    console.log(`Success: Synced to ${DEST_FILE}`);
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
    process.exit(1);
  }

  console.log('--- Obsidian Sync Complete ---');
}

syncObsidian();
