import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import { saveDay, seedDefaultDays } from '@/services/daysService';
import { getAllCheckIns } from '@/services/checkInService';
import type { CheckIn, DayConfig } from '@/types';
import { Button, Card } from '@/components/ui';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET ?? 'campfire2024';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';

type AdminTab = 'days' | 'participants' | 'qr';

export function AdminPage() {
  const { state } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [secret, setSecret] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('days');
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [editingDay, setEditingDay] = useState<DayConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedDayQR, setSelectedDayQR] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  useEffect(() => {
    if (authenticated) {
      getAllCheckIns()
        .then(setAllCheckIns)
        .catch(() => null);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      getAllCheckIns()
        .then(setAllCheckIns)
        .catch(() => null);

      getDocs(collection(db, 'users'))
        .then((snap) => {
          const map: Record<string, string> = {};
          snap.docs.forEach((d) => {
            const data = d.data();
            map[d.id] = (data.nickname as string) ?? d.id;
          });
          setUserMap(map);
        })
        .catch(() => null);
    }
  }, [authenticated]);

  function handleAuth() {
    if (secret === ADMIN_SECRET || state.user?.isAdmin) {
      setAuthenticated(true);
    } else {
      alert('Wrong secret.');
    }
  }

  async function handleSaveDay() {
    if (!editingDay) return;
    setSaving(true);
    try {
      await saveDay(editingDay);
      showToast('Day saved ✓');
      setEditingDay(null);
    } catch {
      showToast('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDays() {
    setSeeding(true);
    try {
      await seedDefaultDays();
      showToast('Default days seeded to Firestore ✓');
    } catch {
      showToast('Seed failed');
    } finally {
      setSeeding(false);
    }
  }

  function copyQRLink(dayId: string) {
    const link = `${APP_URL}/checkin/${dayId}`;
    navigator.clipboard.writeText(link).then(() => showToast('Link copied!'));
  }

  // Auth gate
  if (!authenticated) {
    return (
      <div className='flex flex-col items-center justify-center min-h-full px-5 py-12 gap-5'>
        <span className='text-6xl'>🔐</span>
        <h1 className='text-2xl font-black'>Admin Access</h1>
        <input
          type='password'
          placeholder='Enter admin secret'
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          className='w-full max-w-xs bg-surface-800 border border-surface-600 rounded-2xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-fire-500'
        />
        <Button
          onClick={handleAuth}
          className='w-full max-w-xs'>
          Enter Admin Panel
        </Button>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; emoji: string }[] = [
    { id: 'days', label: 'Days', emoji: '📅' },
    { id: 'qr', label: 'QR Codes', emoji: '📷' },
    { id: 'participants', label: 'Participants', emoji: '👥' },
  ];

  // Unique users from check-ins
  const userStats = allCheckIns.reduce<Record<string, string[]>>((acc, ci) => {
    if (!acc[ci.userId]) acc[ci.userId] = [];
    acc[ci.userId].push(ci.dayId);
    return acc;
  }, {});

  return (
    <div className='flex flex-col min-h-full'>
      {/* Tab bar */}
      <div className='flex border-b border-surface-800 bg-surface-900 sticky top-0 z-10'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-fire-400 border-b-2 border-fire-400'
                : 'text-text-muted'
            }`}>
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className='px-5 py-6 flex flex-col gap-4'>
        {/* Days tab */}
        {activeTab === 'days' && (
          <>
            <div className='flex justify-between items-center'>
              <h2 className='font-bold text-lg'>Camp Days</h2>
              <Button
                variant='secondary'
                size='sm'
                loading={seeding}
                onClick={handleSeedDays}>
                Seed defaults
              </Button>
            </div>

            {state.days.map((day) => (
              <Card key={day.id}>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-xs text-fire-400 font-bold uppercase tracking-wider'>
                      Day {day.dayNumber}
                    </p>
                    <h3 className='font-bold text-text-primary'>{day.theme}</h3>
                    <p className='text-xs text-text-muted mt-0.5'>
                      {day.unlockDate}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setEditingDay({ ...day })}>
                    Edit
                  </Button>
                </div>
              </Card>
            ))}

            {/* Edit modal */}
            <AnimatePresence>
              {editingDay && (
                <motion.div
                  key='edit-modal'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='fixed inset-0 bg-surface-950/90 z-50 flex items-end'
                  onClick={(e) =>
                    e.target === e.currentTarget && setEditingDay(null)
                  }>
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className='w-full bg-surface-900 rounded-t-3xl p-6 flex flex-col gap-4 safe-bottom max-h-[90vh] overflow-y-auto'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-bold text-lg'>
                        Edit Day {editingDay.dayNumber}
                      </h3>
                      <button
                        onClick={() => setEditingDay(null)}
                        className='text-text-muted text-2xl'>
                        ×
                      </button>
                    </div>

                    {(
                      [
                        'theme',
                        'verse',
                        'verseRef',
                        'challenge',
                        'unlockDate',
                      ] as const
                    ).map((field) => (
                      <div key={field}>
                        <label className='text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block'>
                          {field}
                        </label>
                        <textarea
                          value={editingDay[field]}
                          onChange={(e) =>
                            setEditingDay({
                              ...editingDay,
                              [field]: e.target.value,
                            })
                          }
                          rows={
                            field === 'verse' || field === 'challenge' ? 3 : 1
                          }
                          className='w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-fire-500 resize-none'
                        />
                      </div>
                    ))}

                    <Button
                      loading={saving}
                      onClick={handleSaveDay}
                      size='lg'
                      className='w-full'>
                      Save changes
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* QR codes tab */}
        {activeTab === 'qr' && (
          <>
            <h2 className='font-bold text-lg'>QR Links</h2>
            <p className='text-text-secondary text-sm -mt-2'>
              Each link should be encoded as a QR code and hidden on location
              for that day.
            </p>
            {state.days.map((day) => {
              const link = `${APP_URL}/checkin/${day.id}`;
              return (
                <Card key={day.id}>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-fire-400 font-bold uppercase tracking-wider mb-0.5'>
                        Day {day.dayNumber}
                      </p>
                      <p className='text-text-primary font-semibold text-sm'>
                        {day.theme}
                      </p>
                      <p className='text-text-muted text-xs mt-1 truncate'>
                        {link}
                      </p>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => copyQRLink(day.id)}>
                        Copy
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setSelectedDayQR(
                            selectedDayQR === day.id ? null : day.id,
                          )
                        }>
                        QR →
                      </Button>
                    </div>
                  </div>

                  {/* QR code display using a public API */}
                  <AnimatePresence>
                    {selectedDayQR === day.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='overflow-hidden'>
                        <div className='mt-4 flex flex-col items-center gap-3'>
                          <div className='bg-white p-3 rounded-xl'>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
                              alt={`QR code for day ${day.dayNumber}`}
                              className='w-48 h-48'
                            />
                          </div>
                          <p className='text-xs text-text-muted text-center'>
                            Screenshot & print this QR code for Day{' '}
                            {day.dayNumber}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </>
        )}

        {/* Participants tab */}
        {activeTab === 'participants' && (
          <>
            <h2 className='font-bold text-lg'>
              Participants · {Object.keys(userStats).length} total
            </h2>
            {Object.entries(userStats).map(([uid, completedDayIds]) => (
              <Card key={uid}>
                <p className='font-bold text-text-primary'>
                  {userMap[uid] ?? 'Unknown'}
                </p>

                <div className='flex items-center gap-2 flex-wrap'>
                  {state.days.map((day) => (
                    <span
                      key={day.id}
                      className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                        completedDayIds.includes(day.id)
                          ? 'bg-fire-500 text-white'
                          : 'bg-surface-700 text-text-muted'
                      }`}>
                      D{day.dayNumber}
                    </span>
                  ))}
                </div>
                <p className='text-xs text-fire-400 mt-2 font-semibold'>
                  {completedDayIds.length}/{state.days.length} days completed
                </p>
              </Card>
            ))}
            {Object.keys(userStats).length === 0 && (
              <p className='text-text-muted text-sm text-center py-6'>
                No check-ins yet.
              </p>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className='fixed bottom-20 left-1/2 -translate-x-1/2 bg-fire-600 text-white rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg z-50'>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
