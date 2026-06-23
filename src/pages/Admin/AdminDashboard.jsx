import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import './AdminDashboard.css';

import Sidebar    from './components/Sidebar';
import Topbar     from './components/Topbar';
import AdminModal from './components/AdminModal';
import {
  OverviewPage, OrdersPage, UsersPage, JsonPage, PdfPage,
  MonitorPage, AnalyticsPage, SettingsPage, VaultPage
} from './components/DashboardPages';

import { 
  IconDashboard, IconOrders, IconUsers, IconJson, 
  IconPdf, IconMonitor, IconAnalytics, IconSettings, IconWallet 
} from './components/Icons';

import adminApi from '../../api/adminApi';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5267';

const PAGE_TITLES = {
  overview:  'نظرة عامة',
  orders:    'إدارة الطلبات',
  users:     'إدارة المستخدمين',
  vault:     'الخزنة المالية',
  json:      'ملفات JSON',
  pdf:       'القصص المطبوعة',
  monitor:   'مراقبة API',
  analytics: 'الإحصاءات',
  settings:  'إعدادات النظام',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hubRef   = useRef(null);

  // ── State (UI Only) ────────────────────────────────────────────────────────
  const [tab,       setTab]       = useState('overview');
  const [connected, setConnected] = useState(false);
  const [modal,     setModal]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [activity,  setActivity]  = useState([]);

  // ── Queries (Caching & Data Fetching) ─────────────────────────────────────
  const { data: stats }     = useQuery({ queryKey: ['admin_stats'],     queryFn: adminApi.getStats });
  const { data: qStories }  = useQuery({ queryKey: ['admin_orders'],    queryFn: adminApi.getOrders });
  const { data: qJsonFiles } = useQuery({ queryKey: ['admin_json'],      queryFn: adminApi.getJsonFiles });
  const { data: qPdfs }      = useQuery({ queryKey: ['admin_pdfs'],      queryFn: adminApi.getPdfs });
  const { data: qHealth }    = useQuery({ queryKey: ['admin_health'],    queryFn: adminApi.getHealth });
  const { data: qSettings }  = useQuery({ queryKey: ['admin_settings'],  queryFn: adminApi.getSettings });
  const { data: initialActivity } = useQuery({ queryKey: ['admin_activity'], queryFn: adminApi.getActivity });
  const { data: qTopics }    = useQuery({ queryKey: ['admin_analytics'], queryFn: adminApi.getAnalytics });
  const { data: qWeekStats } = useQuery({ queryKey: ['admin_week_stats'],queryFn: adminApi.getWeekStats });

  const stories   = Array.isArray(qStories) ? qStories : [];
  const jsonFiles = Array.isArray(qJsonFiles) ? qJsonFiles : [];
  const pdfs      = Array.isArray(qPdfs) ? qPdfs : [];
  const health    = Array.isArray(qHealth) ? qHealth : [];
  const settings  = Array.isArray(qSettings) ? qSettings : [];
  const topics    = Array.isArray(qTopics) ? qTopics : [];
  const weekStats = Array.isArray(qWeekStats) ? qWeekStats : [];

  useEffect(() => {
    if (initialActivity && Array.isArray(initialActivity) && initialActivity.length > 0 && activity.length === 0) {
        setActivity(initialActivity);
    }
  }, [initialActivity, activity.length]);

  const loading = !stats && stories.length === 0;

  const fetchData = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  // ── Refresh only lightweight stats (called on StatsUpdate signal) ──────────
  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
  }, [queryClient]);

  // ── SignalR real-time connection ────────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (!user || user === 'null') { navigate('/admin'); return; }

    // Restore user info
    try {
      const u = localStorage.getItem('admin_user');
      setAdminUser(u ? JSON.parse(u) : { email: 'admin@hekayti.com' });
    } catch {
      setAdminUser({ email: 'admin@hekayti.com' });
    }

    fetchData();

    // Build hub connection
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/activity`, {
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // 📡 Activity feed — prepend new item, keep max 15
    conn.on('NewActivity', (item) =>
      setActivity(prev => [item, ...prev].slice(0, 15))
    );

    // 📡 New order — invalidate orders query
    conn.on('NewOrder', () => {
        queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    });

    // 📡 Stats changed — refresh stats cards
    conn.on('StatsUpdate', () => refreshStats());

    conn.onreconnecting(() => setConnected(false));
    conn.onreconnected(()   => setConnected(true));
    conn.onclose(()         => setConnected(false));

    conn.start()
      .then(() => { setConnected(true); console.log('✅ SignalR /hubs/activity connected'); })
      .catch(err => { setConnected(false); console.warn('⚠️ SignalR failed:', err.message); });

    hubRef.current = conn;
    return () => conn.stop();
  }, [navigate, fetchData, refreshStats]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdateSettings = async (newSettings) => {
    try {
      await adminApi.updateSettings(newSettings);
      alert('تم تحديث الإعدادات بنجاح');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSeedData = async () => {
    try {
      const data = await adminApi.seedData();
      alert(data?.message || 'تم توليد البيانات بنجاح!');
      fetchData();
    } catch (err) {
      alert('خطأ في الاتصال: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback: Clear ALL possible admin keys to prevent conflicts
      const keysToRemove = [
        'admin_token', 'admin_refresh_token', 'admin_user', 
        'adminToken', 'mock-admin-token' // Legacy keys found in user storage
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      navigate('/admin');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
    } catch (err) {
      alert('فشل تحديث الحالة: ' + err.message);
    }
  };

  const openJson = (story) => setModal({ type: 'json', story });
  const openPdf  = (story) => setModal({ type: 'pdf',  story });

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredStories = (stories || []).filter(s =>
    s?.childName?.toLowerCase().includes(search.toLowerCase()) ||
    s?.topic?.toLowerCase().includes(search.toLowerCase())     ||
    s?.id?.toString().includes(search)
  );

  const navItems = [
    { section: 'الرئيسية', items: [
      { tab: 'overview', icon: <IconDashboard size={18} />, label: 'نظرة عامة' },
      { tab: 'orders',   icon: <IconOrders size={18} />, label: 'الطلبات', badge: stories.length },
      { tab: 'users',    icon: <IconUsers size={18} />, label: 'المستخدمين' },
      { tab: 'vault',    icon: <IconWallet size={18} />, label: 'الخزنة (المالية)' },
    ]},
    { section: 'المحتوى', items: [
      { tab: 'json', icon: <IconJson size={18} />, label: 'ملفات JSON' },
      { tab: 'pdf',  icon: <IconPdf size={18} />,  label: 'PDF مطبوع'  },
    ]},
    { section: 'النظام', items: [
      { tab: 'monitor',   icon: <IconMonitor size={18} />, label: 'مراقبة API'       },
      { tab: 'analytics', icon: <IconAnalytics size={18} />, label: 'الإحصاءات'         },
      { tab: 'settings',  icon: <IconSettings size={18} />, label: 'إعدادات النظام'   },
    ]}
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ad-shell" dir="rtl">
      <Sidebar
        tab={tab} setTab={setTab} navItems={navItems}
        adminUser={adminUser} onLogout={handleLogout}
      />

      <div className="ad-main">
        <Topbar
          title={PAGE_TITLES[tab]} search={search}
          setWithSearch={setSearch} onRefresh={fetchData}
          connected={connected}
        />

        <div className="ad-content">
          {loading ? (
            <div className="ad-loading">جاري تحميل البيانات...</div>
          ) : (
            <>
              {tab === 'overview'  && <OverviewPage  stories={filteredStories} stats={stats} onJson={openJson} onPdf={openPdf} onSwitchTab={setTab} activity={activity} connected={connected} weekStats={weekStats} />}
              {tab === 'orders'    && <OrdersPage    stories={filteredStories} onJson={openJson} onPdf={openPdf} onSeed={handleSeedData} onUpdateStatus={handleUpdateStatus} onAdd={() => alert('قيد التطوير')} />}
              {tab === 'users'     && <UsersPage />}
              {tab === 'vault'     && <VaultPage />}
              {tab === 'json'      && <JsonPage      files={jsonFiles} onJson={openJson} onRefresh={fetchData} />}
              {tab === 'pdf'       && <PdfPage       files={pdfs} onPdf={openPdf} />}
              {tab === 'monitor'   && <MonitorPage   health={health} />}
              {tab === 'analytics' && <AnalyticsPage topics={topics} />}
              {tab === 'settings'  && <SettingsPage  settings={settings} onUpdate={handleUpdateSettings} isLoading={loading} apiBase={API} />}
            </>
          )}
        </div>
      </div>

      <AdminModal data={modal} onClose={() => setModal(null)} apiBase={API} />
    </div>
  );
}
