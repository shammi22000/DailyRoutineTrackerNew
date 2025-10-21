import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('drt.db');
  }
  return dbInstance;
}


export async function initDB() {
  const db = await getDB();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      mobileNumber TEXT NOT NULL,
      birthDay TEXT NOT NULL,
      gender TEXT NOT NULL,
      userName TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      photoUri TEXT,
      cloudId TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      status TEXT DEFAULT 'Pending',
      category TEXT,
      priority TEXT,
      notes TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      notes TEXT,
      UNIQUE(userId, name),
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  console.log('SQLite: users, activities (with userId), categories (with userId) ready');
}


export async function saveUser(user) {
  try {
    const db = await getDB();

    const existing = await db.getAllAsync(
      `SELECT id FROM users WHERE id = ? OR userName = ? LIMIT 1`,
      [user.id || null, user.userName]
    );

    if (existing.length > 0) {
      const duplicate = await db.getAllAsync(
        `SELECT id FROM users WHERE (email = ? OR userName = ?) AND id != ? LIMIT 1`,
        [user.email, user.userName, existing[0].id]
      );
      if (duplicate.length > 0) {
        throw new Error('Username or email already exists');
      }

      await db.runAsync(
        `UPDATE users 
         SET firstName = ?, lastName = ?, email = ?, mobileNumber = ?, 
             birthDay = ?, gender = ?, userName = ?, password = ?, photoUri = ?
         WHERE id = ?`,
        [
          user.firstName,
          user.lastName,
          user.email,
          user.mobileNumber,
          user.birthDay,
          user.gender,
          user.userName,
          user.password,
          user.photoUri,
          existing[0].id,
        ]
      );
      console.log('user updated:', user.userName);
    } else {
      await db.runAsync(
        `INSERT INTO users 
         (firstName, lastName, email, mobileNumber, birthDay, gender, userName, password, photoUri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.firstName,
          user.lastName,
          user.email,
          user.mobileNumber,
          user.birthDay,
          user.gender,
          user.userName,
          user.password,
          user.photoUri,
        ]
      );
      console.log('user saved:', user.userName);
    }

    return true;
  } catch (e) {
    console.error('saveUser error', e);
    throw e;
  }
}

export async function getUserByCredentials(userName, password) {
  const db = await getDB();
  const result = await db.getAllAsync(
    `SELECT * FROM users WHERE userName = ? AND password = ? LIMIT 1`,
    [userName, password]
  );
  return result.length > 0 ? result[0] : null;
}

export async function getAllUsers() {
  const db = await getDB();
  return await db.getAllAsync(`SELECT * FROM users`);
}

export async function getFirstUser() {
  const db = await getDB();
  const result = await db.getAllAsync(`SELECT * FROM users LIMIT 1`);
  return result.length > 0 ? result[0] : null;
}

export async function deleteAllUsers() {
  const db = await getDB();
  await db.runAsync(`DELETE FROM users`);
  console.log('All users deleted from SQLite');
}

export async function markUserSynced(userId, cloudId) {
  const db = await getDB();
  await db.runAsync(`UPDATE users SET synced = 1, cloudId = ? WHERE id = ?`, [
    cloudId,
    userId,
  ]);
  console.log(`User ${userId} marked as synced`);
}


export async function getAllActivities(userId) {
  try {
    const db = await getDB();
    const res = await db.getAllAsync(
      'SELECT * FROM activities WHERE userId = ?',
      [userId]
    );
    return res || [];
  } catch (e) {
    console.error('getAllActivities error', e);
    return [];
  }
}

export async function saveActivity(userId, a) {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO activities 
       (userId, name, date, startTime, endTime, status, category, priority, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        a.name,
        a.date,
        a.startTime || '',
        a.endTime || '',
        a.status || 'Pending',
        a.category || '',
        a.priority || '',
        a.notes || '',
      ]
    );
    console.log('activity saved:', a.name);
  } catch (e) {
    console.error('saveActivity error', e);
    throw e;
  }
}

export async function updateActivity(id, a) {
  try {
    const db = await getDB();
    await db.runAsync(
      `UPDATE activities
       SET name=?, date=?, startTime=?, endTime=?, status=?, category=?, priority=?, notes=?
       WHERE id=?`,
      [
        a.name,
        a.date,
        a.startTime || '',
        a.endTime || '',
        a.status || 'Pending',
        a.category || '',
        a.priority || '',
        a.notes || '',
        id,
      ]
    );
    console.log('activity updated:', id);
  } catch (e) {
    console.error('updateActivity error', e);
    throw e;
  }
}

export async function deleteActivity(id) {
  try {
    const db = await getDB();
    await db.runAsync(`DELETE FROM activities WHERE id=?`, [id]);
    console.log('🗑️ activity deleted:', id);
  } catch (e) {
    console.error('deleteActivity error', e);
  }
}


export async function getAllCategories(userId) {
  try {
    const db = await getDB();
    const res = await db.getAllAsync(
      'SELECT * FROM categories WHERE userId = ? ORDER BY id DESC',
      [userId]
    );
    return res || [];
  } catch (e) {
    console.error('getAllCategories error', e);
    return [];
  }
}

export async function saveCategory(userId, c) {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (userId, name, priority, notes) VALUES (?, ?, ?, ?)`,
      [userId, c.name, c.priority || 'Medium', c.notes || '']
    );
    console.log('🟢 category saved:', c.name);
  } catch (e) {
    console.error('saveCategory error', e);
    throw e;
  }
}

export async function updateCategory(id, c) {
  try {
    const db = await getDB();
    await db.runAsync(
      `UPDATE categories SET name=?, priority=?, notes=? WHERE id=?`,
      [c.name, c.priority || 'Medium', c.notes || '', id]
    );
    console.log('🟡 category updated:', id);
  } catch (e) {
    console.error('updateCategory error', e);
    throw e;
  }
}

export async function deleteCategory(id) {
  try {
    const db = await getDB();
    await db.runAsync(`DELETE FROM categories WHERE id=?`, [id]);
    console.log('🗑️ category deleted:', id);
  } catch (e) {
    console.error('deleteCategory error', e);
  }
}
