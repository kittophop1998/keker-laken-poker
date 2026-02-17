'use client';

import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🃏 Kaker Laken Poker</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center' }}>
            เกมโกหกสุดมันส์ที่ต้องใช้ทั้งไหวพริบและหน้านิ่ง!
          </p>
        </div>
        <div className={styles.ctas}>
          <button
            className={styles.primary}
            onClick={() => router.push('/game')}
            style={{
              padding: '20px 40px',
              fontSize: '1.3rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            เริ่มเล่น
          </button>
        </div>
      </main>
    </div>
  );
}
