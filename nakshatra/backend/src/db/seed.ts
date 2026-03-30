/**
 * Seed demo accounts for Nakshatra
 * 4 accounts: free, pro, guru, admin
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export function seedDemoAccounts(db: Database.Database): void {
  const insert = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, full_name, avatar, role, tier,
      birth_date, birth_time, birth_place, birth_lat, birth_lon, level, xp,
      streak_days, longest_streak, achievements, onboarding_complete)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const accounts = [
    {
      username: 'free_user',
      email: 'free@nakshatra.app',
      password: 'nakshatra123',
      fullName: 'Arjun Sharma',
      avatar: '🌟',
      role: 'user',
      tier: 'free',
      birthDate: '1995-03-15',
      birthTime: '06:30',
      birthPlace: 'Mumbai, India',
      lat: 19.076,
      lon: 72.8777,
      level: 3,
      xp: 450,
      streak: 2,
      longestStreak: 5,
      achievements: JSON.stringify(['first_chart', 'daily_streak_3']),
    },
    {
      username: 'pro_user',
      email: 'pro@nakshatra.app',
      password: 'nakshatra123',
      fullName: 'Priya Patel',
      avatar: '✨',
      role: 'user',
      tier: 'pro',
      birthDate: '1990-08-22',
      birthTime: '14:15',
      birthPlace: 'Delhi, India',
      lat: 28.6139,
      lon: 77.209,
      level: 12,
      xp: 3200,
      streak: 7,
      longestStreak: 14,
      achievements: JSON.stringify(['first_chart', 'daily_streak_3', 'daily_streak_7', 'tarot_master', 'compatibility_check']),
    },
    {
      username: 'guru_user',
      email: 'guru@nakshatra.app',
      password: 'nakshatra123',
      fullName: 'Ravi Krishnamurthy',
      avatar: '🔮',
      role: 'user',
      tier: 'guru',
      birthDate: '1988-01-14',
      birthTime: '04:45',
      birthPlace: 'Chennai, India',
      lat: 13.0827,
      lon: 80.2707,
      level: 28,
      xp: 12500,
      streak: 21,
      longestStreak: 45,
      achievements: JSON.stringify([
        'first_chart', 'daily_streak_3', 'daily_streak_7', 'daily_streak_30',
        'tarot_master', 'compatibility_check', 'numerology_pro', 'vastu_expert',
        'scripture_scholar', 'oracle_seeker',
      ]),
    },
    {
      username: 'admin',
      email: 'admin@nakshatra.app',
      password: 'nakshatra_admin',
      fullName: 'Nakshatra Admin',
      avatar: '👑',
      role: 'admin',
      tier: 'guru',
      birthDate: '1985-11-11',
      birthTime: '11:11',
      birthPlace: 'Varanasi, India',
      lat: 25.3176,
      lon: 82.9739,
      level: 50,
      xp: 50000,
      streak: 100,
      longestStreak: 365,
      achievements: JSON.stringify(['first_chart', 'admin_access']),
    },
  ];

  const insertInTransaction = db.transaction(() => {
    for (const a of accounts) {
      const id = crypto.randomUUID();
      const hash = bcrypt.hashSync(a.password, 10);
      insert.run(
        id, a.username, a.email, hash, a.fullName, a.avatar, a.role, a.tier,
        a.birthDate, a.birthTime, a.birthPlace, a.lat, a.lon,
        a.level, a.xp, a.streak, a.longestStreak, a.achievements, 1
      );
    }

    // Seed default admin settings
    const insertSetting = db.prepare(
      'INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)'
    );
    const defaults: Record<string, string> = {
      free_kundli_limit: '2',
      free_tarot_daily_limit: '3',
      free_oracle_daily_limit: '5',
      free_numerology_limit: '1',
      pro_features: JSON.stringify([
        'compatibility', 'muhurta', 'panchanga', 'unlimited_tarot',
        'oracle_unlimited', 'numerology_full', 'share_cards',
      ]),
      guru_features: JSON.stringify([
        'compatibility', 'muhurta', 'panchanga', 'unlimited_tarot',
        'oracle_unlimited', 'numerology_full', 'share_cards',
        'video_analysis', 'pdf_export', 'priority_support',
      ]),
    };
    for (const [key, value] of Object.entries(defaults)) {
      insertSetting.run(key, value);
    }
  });

  insertInTransaction();
}
