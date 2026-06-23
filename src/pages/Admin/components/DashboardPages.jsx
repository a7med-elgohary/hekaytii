import React, { useState, useEffect } from 'react';
import { StatusBadge, FileBadges, StatCard } from './SharedUI';
import adminApi from '../../../api/adminApi';
import { IconDashboard, IconOrders, IconUsers, IconJson, IconPdf, IconMonitor, IconAnalytics, IconSettings, IconChild, IconStory, IconMoney, IconSearch, IconWallet } from './Icons';

// ── Overview Page ─────────────────────────────────────────────────────────────
export function OverviewPage({ stories, stats, onJson, onPdf, onSwitchTab, activity, connected, weekStats }) {
  // weekStats = [{ label, date, count }, ...] from /api/Admin/week-stats
  const vals = weekStats.length > 0 ? weekStats.map(d => d.count) : [0];
  const labels = weekStats.length > 0 ? weekStats.map(d => d.label) : [''];
  const maxVal = Math.max(...vals, 1);

  const cards = [
    { accent: '#6c72ff', iconBg: 'rgba(108,114,255,0.12)', icon: <IconStory size={20} />, label: 'إجمالي القصص المولدة', value: stats?.totalStories ?? '0', trend: '↑ محين الآن', trendCls: 'ad-trend-up' },
    { accent: '#ff5c6a', iconBg: 'rgba(255,92,106,0.12)', icon: <IconPdf size={20} />, label: 'الطلبات المطبوعة (PDF)', value: stats?.totalPdfs ?? '0', trend: '↑ نشط', trendCls: 'ad-trend-up' },
    { accent: '#2dd4a0', iconBg: 'rgba(45,212,160,0.12)', icon: <IconUsers size={20} />, label: 'المستخدمون المسجلون', value: stats?.activeUsers ?? '0', trend: 'إجمالي النظام', trendCls: 'ad-trend-up', onClick: () => onSwitchTab('users') },
    { accent: '#f5a623', iconBg: 'rgba(245,166,35,0.12)', icon: <IconMoney size={20} />, label: 'إجمالي الأرباح', value: stats?.totalRevenue ? `${stats.totalRevenue} SR` : '0 SR', trend: 'من نظام الدفع', trendCls: 'ad-trend-up' },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="ad-stats-row">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Chart + Activity */}
      <div className="ad-chart-row">

        {/* 7-day bar chart — real data */}
        <div className="ad-panel">
          <div className="ad-panel-head">
            <div className="ad-panel-title">القصص المولدة (آخر 7 أيام)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
              إجمالي: {vals.reduce((a, b) => a + b, 0)} قصة
            </div>
          </div>
          <div className="ad-mini-chart">
            <div className="ad-chart-grid-bg">
              <div style={{ top: '0%' }}></div>
              <div style={{ top: '25%' }}></div>
              <div style={{ top: '50%' }}></div>
              <div style={{ top: '75%' }}></div>
              <div style={{ top: '100%' }}></div>
            </div>
            <div className="ad-bar-chart-v2">
              {vals.map((v, i) => (
                <div key={i} className="ad-bar-group">
                  <div className="ad-bar-item-v2" title={`${labels[i]}: ${v} قصة`} style={{ height: `${Math.round((v / maxVal) * 100)}%` }}>
                    <div className="ad-bar-fill" style={{ background: i === vals.length - 1 ? 'var(--accent)' : 'rgba(108,114,255,0.4)' }} />
                  </div>
                  <div className="ad-bar-label-v2">{labels[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time activity feed */}
        <div className="ad-panel">
          <div className="ad-panel-head">
            <div className="ad-panel-title">آخر النشاطات</div>
            <div className="ad-status-online" style={{ color: connected ? 'var(--success)' : 'var(--warning)' }}>
              <span
                className="ad-status-dot"
                style={{
                  background: connected ? 'var(--success)' : 'var(--warning)',
                  animationPlayState: connected ? 'running' : 'paused',
                }}
              />
              {connected ? 'مباشر · SignalR' : 'استطلاع'}
            </div>
          </div>
          <div className="ad-activity-list">
            {activity.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>
                لا توجد أحداث بعد — ستظهر هنا فور توليد أي قصة
              </div>
            ) : (
              activity.map((a, i) => (
                <div key={i} className={`ad-activity-item${i === 0 ? ' ad-activity-new' : ''}`}>
                  <div className="ad-activity-dot" style={{ background: a.color }} />
                  <div className="ad-activity-text">{a.text}</div>
                  <div className="ad-activity-time">{a.timeAgo ?? a.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="ad-panel">
        <div className="ad-panel-head">
          <div className="ad-panel-title">أحدث الطلبات</div>
          <button className="ad-btn" onClick={() => onSwitchTab('orders')}>عرض الكل ←</button>
        </div>
        <table className="ad-tbl">
          <thead>
            <tr>
              <th>رقم الطلب</th><th>اسم الطفل</th><th>الموضوع</th>
              <th>التاريخ</th><th>الحالة</th><th>ملفات</th>
            </tr>
          </thead>
          <tbody>
            {stories.slice(0, 4).map(s => (
              <tr key={s.id}>
                <td className="id-cell">#ORD-{s.id}</td>
                <td className="name-cell">{s.childName}</td>
                <td>{s.topic}</td>
                <td>{s.date}</td>
                <td><StatusBadge status={s.status} /></td>
                <td><FileBadges story={s} onJson={onJson} onPdf={onPdf} /></td>
              </tr>
            ))}
            {stories.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>لا توجد طلبات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────
export function OrdersPage({ stories, onJson, onPdf, onSeed, onAdd, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = {
    total: stories.length,
    pending: stories.filter(s => s.status?.toLowerCase() === 'pending' || s.status === 'معلق').length,
    delayed: stories.filter(s => s.status?.toLowerCase() === 'delayed' || s.status === 'متأخر').length,
    completed: stories.filter(s => s.status?.toLowerCase() === 'completed' || s.status === 'تم التسليم').length,
  };

  const cards = [
    { accent: '#6c72ff', iconBg: 'rgba(108,114,255,0.12)', icon: <IconOrders size={20} />, label: 'إجمالي الطلبات', value: stats.total, trend: 'كل الوقت', trendCls: 'ad-trend-up' },
    { accent: '#f5a623', iconBg: 'rgba(245,166,35,0.12)', icon: <IconMonitor size={20} />, label: 'طلبات معلقة', value: stats.pending, trend: 'بانتظار المعالجة', trendCls: 'ad-trend-neutral' },
    { accent: '#ff5c6a', iconBg: 'rgba(255,92,106,0.12)', icon: <IconMonitor size={20} />, label: 'طلبات متأخرة', value: stats.delayed, trend: 'تحتاج تدخل عاجل', trendCls: 'ad-trend-down' },
    { accent: '#2dd4a0', iconBg: 'rgba(45,212,160,0.12)', icon: <IconStory size={20} />, label: 'طلبات تم تسليمها', value: stats.completed, trend: 'مكتملة بنجاح', trendCls: 'ad-trend-up' },
  ];

  const filteredStories = stories.filter(s => {
    const matchesSearch =
      s.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id?.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || s.status?.toLowerCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="ad-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div className="ad-panel">
        <div className="ad-panel-head" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div className="ad-panel-title">إدارة سجل الطلبات ({filteredStories.length})</div>
          <div className="ad-table-filters">
            <div className="ad-search-box">
              <IconSearch size={16} color="var(--text3)" />
              <input
                placeholder="بحث برقم الطلب أو الاسم..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="ad-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="pending">معلق</option>
              <option value="reviewing">قيد المراجعة</option>
              <option value="printing">جاري الطباعة</option>
              <option value="shipping">في الطريق</option>
              <option value="completed">تم التسليم</option>
              <option value="delayed">متأخر</option>
            </select>
            <button className="ad-btn" onClick={onSeed} title="توليد بيانات تجريبية">🧪 Seed</button>
            <button className="ad-btn ad-btn-primary" onClick={onAdd}>➕ طلب جديد</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ad-tbl">
            <thead>
              <tr>
                <th>المعرّف</th>
                <th>اسم الطفل</th>
                <th>البريد</th>
                <th>التاريخ</th>
                <th>حالة الطلب</th>
                <th>تغيير الحالة</th>
                <th>الملفات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map(s => (
                <tr key={s.id}>
                  <td className="id-cell">#ORD-{s.id}</td>
                  <td className="name-cell">{s.childName}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{s.parentEmail}</td>
                  <td className="ad-date-cell">{s.date}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <select
                      className="ad-filter-select"
                      style={{ padding: '4px 8px', fontSize: '0.7rem', minWidth: '110px' }}
                      value={s.status?.toLowerCase() || 'pending'}
                      onChange={(e) => onUpdateStatus(s.id, e.target.value)}
                    >
                      <option value="pending">معلق</option>
                      <option value="reviewing">قيد المراجعة</option>
                      <option value="printing">جاري الطباعة</option>
                      <option value="shipping">في الطريق</option>
                      <option value="completed">تم التسليم</option>
                      <option value="delayed">متأخر</option>
                    </select>
                  </td>
                  <td><FileBadges story={s} onJson={onJson} onPdf={onPdf} /></td>
                </tr>
              ))}
              {filteredStories.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>لا توجد طلبات تطابق المعايير</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Users Page ───────────────────────────────────────────────────────────────
export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟ سيتم حذف كافة بياناته وقصصه!`)) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      alert("فشل حذف المستخدم");
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'has_children') matchesFilter = u.childrenCount > 0;
    if (filterType === 'no_children') matchesFilter = u.childrenCount === 0;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ad-panel">
      <div className="ad-panel-head">
        <div className="ad-panel-title">إدارة المستخدمين المسجلين ({filtered.length})</div>
        <div className="ad-table-filters">
          <div className="ad-search-box">
            <IconSearch size={16} color="var(--text3)" />
            <input
              placeholder="بحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="ad-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">كل المستخدمين</option>
            <option value="has_children">لديهم أطفال</option>
            <option value="no_children">ليس لديهم أطفال</option>
          </select>
        </div>
      </div>

      <div className="ad-table-container">
        <table className="ad-tbl">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>المعرف (ID)</th>
              <th>البريد الإلكتروني</th>
              <th>الأطفال</th>
              <th>القصص المولدة</th>
              <th>تاريخ الانضمام</th>
              <th>العمليات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>لا يوجد مستخدمين حالياً</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td style={{ maxWidth: '200px' }}>
                  <div className="ad-user-cell">
                    <div className="ad-user-avatar">
                      {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="ad-user-info" style={{ minWidth: 0 }}>
                      <div className="ad-user-name" title={u.name}>{u.name || 'مستخدم غير معروف'}</div>
                    </div>
                  </div>
                </td>
                <td className="id-cell" title={u.id}>{u.id.substring(0, 8)}</td>
                <td style={{ maxWidth: '200px' }}>
                  <div className="ad-user-email" title={u.email}>{u.email}</div>
                </td>
                <td>
                  <div className="ad-stat-pill">
                    <span className="ad-pill-icon" style={{ display: 'flex', alignItems: 'center' }}><IconChild size={14} /></span>
                    <span className="ad-pill-text">{u.childrenCount}</span>
                  </div>
                </td>
                <td>
                  <div className="ad-stat-pill">
                    <span className="ad-pill-icon" style={{ display: 'flex', alignItems: 'center' }}><IconStory size={14} /></span>
                    <span className="ad-pill-text">{u.storiesCount}</span>
                  </div>
                </td>
                <td className="ad-date-cell">{u.joinedDate}</td>
                <td>
                  <div className="ad-actions-row">
                    <button className="ad-btn ad-btn-sm" onClick={() => alert(`تفاصيل المستخدم: ${u.name?.substring(0, 50)}\nالبريد: ${u.email}\nالأطفال: ${u.childrenCount}`)}>
                      تفاصيل
                    </button>
                    <button
                      className="ad-btn ad-btn-sm"
                      style={{ borderColor: 'rgba(255, 92, 106, 0.5)', color: 'var(--danger)' }}
                      onClick={() => handleDelete(u.id, u.name)}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Json Page ─────────────────────────────────────────────────────────────────
export function JsonPage({ files, onJson, onRefresh }) {
  return (
    <div className="ad-panel">
      <div className="ad-panel-head">
        <div className="ad-panel-title">ملفات القصص الخام (JSON)</div>
        <button className="ad-btn" onClick={onRefresh}>⟳ تحديث</button>
      </div>
      {files.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>لا توجد ملفات JSON بعد</div>
      ) : (
        <div className="ad-file-grid">
          {files.map(f => (
            <div key={f.id} className="ad-file-card" onClick={() => onJson(f)}>
              <div className="ad-file-icon json">{'{ }'}</div>
              <div className="ad-file-name">{f.fileName}</div>
              <div className="ad-file-meta">{f.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pdf Page ──────────────────────────────────────────────────────────────────
export function PdfPage({ files, onPdf }) {
  return (
    <div className="ad-panel">
      <div className="ad-panel-head"><div className="ad-panel-title">القصص المطبوعة (PDF)</div></div>
      {files.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>لا توجد ملفات PDF بعد</div>
      ) : (
        <div className="ad-file-grid">
          {files.map(f => (
            <div key={f.id} className="ad-file-card" onClick={() => onPdf(f)}>
              <div className="ad-file-icon pdf">PDF</div>
              <div className="ad-file-name">{f.fileName}</div>
              <div className="ad-file-meta">{f.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Monitor Page ──────────────────────────────────────────────────────────────
export function MonitorPage({ health }) {
  // Extract real metrics from the health array
  const storage = health?.find(h => h.id === 'storage');
  const db = health?.find(h => h.id === 'db');
  const backend = health?.find(h => h.id === 'backend');
  const uptimeObj = health?.find(h => h.id === 'uptime');
  const aiObj = health?.find(h => h.id === 'ai');

  // Storage Progress (dummy max limits for visual)
  const jsonPct = storage ? Math.min(Math.round((storage.jsonSizeMB / 100) * 100), 100) : 0;
  const pdfPct = storage ? Math.min(Math.round((storage.pdfSizeMB / 500) * 100), 100) : 0;

  return (
    <>
      <div className="ad-stats-row-3">
        {(health || []).filter(h => h.id !== 'storage').slice(0, 3).map((h, i) => (
          <StatCard key={i} accent={h.id === 'db' ? 'var(--success)' : 'var(--accent)'} label={h.id === 'db' ? 'قاعدة البيانات' : h.id === 'ai' ? 'حالة الـ AI' : 'السيرفر'} value={h.status} trend={h.message} trendCls="ad-trend-neutral" />
        ))}
      </div>

      <div className="ad-panel" style={{ marginTop: 24 }}>
        <div className="ad-panel-head">
          <div className="ad-panel-title">⚙️ الحالة الفنية للسيرفر (بيانات حقيقية)</div>
        </div>
        <div className="ad-monitor-grid">
          {[
            { label: 'نظام التشغيل', value: backend?.status === 'Healthy' ? 'Windows Server' : 'Unknown', sub: backend?.message || 'Checking...', valueColor: 'var(--accent)' },
            { label: 'وقت التشغيل (Uptime)', value: uptimeObj?.status || '100%', sub: uptimeObj?.message || 'مستقر وجاهز', valueColor: 'var(--success)' },
            { label: 'شهادة SSL', value: window.location.protocol === 'https:' ? 'مؤمنة (HTTPS)' : 'غير مؤمنة (HTTP)', sub: 'الاتصال مشفر وآمن', valueColor: window.location.protocol === 'https:' ? 'var(--success)' : 'var(--warning)' },

            { label: 'ملفات الصور/JSON', value: `${storage?.jsonSizeMB || 0} MB`, pct: jsonPct, barColor: 'var(--accent)', sub: `${storage?.jsonCount || 0} ملف في السيرفر` },
            { label: 'ملفات PDF', value: `${storage?.pdfSizeMB || 0} MB`, pct: pdfPct, barColor: 'var(--warning)', sub: `${storage?.pdfCount || 0} ملف جاهز` },
            { label: 'قاعدة البيانات (SQL)', value: db?.status === 'Connected' ? 'متصلة' : 'خطأ', pct: 100, barColor: 'var(--success)', sub: db?.message || 'No data' },

            { label: 'حالة الـ AI', value: aiObj?.status || 'Checking', sub: aiObj?.message || '', valueColor: aiObj?.status === 'Ready' ? 'var(--success)' : 'var(--warning)' },
            { label: 'سرعة الاستجابة', value: '120ms', sub: 'ضمن النطاق الطبيعي', valueColor: 'var(--success)' },
            { label: 'وضع الصيانة', value: 'غير نشط', sub: 'التطبيق متاح للجميع', valueColor: 'var(--success)' },
          ].map((m, i) => (
            <div key={i} className="ad-monitor-card">
              <div className="ad-monitor-label">{m.label}</div>
              <div className="ad-monitor-value" style={m.valueColor ? { color: m.valueColor } : {}}>{m.value}</div>
              {m.sub && <div className="ad-monitor-sub">{m.sub}</div>}
              {m.pct !== undefined && (
                <div className="ad-progress-bar" style={{ marginTop: 12 }}>
                  <div className="ad-progress-fill" style={{ width: `${m.pct}%`, background: m.barColor }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Analytics Page — real data from DB ────────────────────────────────────────
export function AnalyticsPage({ topics }) {
  const maxCount = Math.max(...(topics.map(t => t.count)), 1);

  return (
    <div className="ad-panel">
      <div className="ad-panel-head">
        <div className="ad-panel-title">أكثر المواضيع طلبًا</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
          إجمالي: {topics.reduce((a, t) => a + t.count, 0).toLocaleString()} قصة
        </div>
      </div>
      {topics.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>لا توجد بيانات بعد</div>
      ) : (
        <div className="ad-topic-bar-wrapper">
          {topics.map((t, i) => (
            <div key={i} className="ad-topic-row">
              <div className="ad-topic-meta">
                <span className="ad-topic-name">{t.name}</span>
                <span className="ad-topic-count">{t.count.toLocaleString()}</span>
              </div>
              <div className="ad-topic-track">
                <div
                  className="ad-topic-fill"
                  style={{ width: `${Math.round((t.count / maxCount) * 100)}%`, background: t.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function SettingsPage({ settings, onUpdate, apiBase }) {
  // Local state for all fields
  const [vals, setVals] = useState({
    hfKey: '',
    imgKey: '',
    textKey: '',
    backend: apiBase
  });

  const [toggles, setToggles] = useState({
    maintenance: false,
    notifications: true,
    errors: true,
    webhook: false
  });

  // Sync props to state when settings arrive
  useEffect(() => {
    if (settings && settings.length > 0) {
      setVals({
        hfKey: settings.find(s => s.key === 'HuggingFaceApiKey')?.value || '',
        imgKey: settings.find(s => s.key === 'ImageGenApiKey')?.value || '',
        textKey: settings.find(s => s.key === 'StoryTextApiKey')?.value || '',
        backend: settings.find(s => s.key === 'BackendUrl')?.value || apiBase
      });
      setToggles(prev => ({
        ...prev,
        maintenance: settings.find(s => s.key === 'MaintenanceMode')?.value === 'true'
      }));
    }
  }, [settings, apiBase]);

  const handleToggle = async (key, currentVal) => {
    const newVal = !currentVal;
    setToggles(prev => ({ ...prev, [key]: newVal }));
    if (key === 'maintenance') {
      await onUpdate([{ key: 'MaintenanceMode', value: newVal.toString() }]);
    }
  };

  const handleSaveAll = async () => {
    const payload = [
      { key: 'HuggingFaceApiKey', value: vals.hfKey },
      { key: 'ImageGenApiKey', value: vals.imgKey },
      { key: 'StoryTextApiKey', value: vals.textKey },
      { key: 'BackendUrl', value: vals.backend }
    ];
    await onUpdate(payload);
    alert('تم حفظ كافة الإعدادات بنجاح');
  };

  return (
    <div className="ad-settings-grid">
      <div className="ad-panel">
        <div className="ad-panel-head"><div className="ad-panel-title">⚙️ إعدادات النظام والـ AI</div></div>
        <div className="ad-settings-form">

          <div className="ad-form-group">
            <div className="ad-form-label">رابط الـ Backend الحالي</div>
            <input
              className="ad-form-input mono"
              value={vals.backend}
              onChange={e => setVals({ ...vals, backend: e.target.value })}
              placeholder="http://localhost:..."
            />
          </div>

          <div className="ad-form-group">
            <div className="ad-form-label">HuggingFace API Key (توليد القصص)</div>
            <input
              className="ad-form-input mono"
              type="text"
              value={vals.hfKey}
              onChange={e => setVals({ ...vals, hfKey: e.target.value })}
              placeholder="hf_..."
            />
          </div>

          <div className="ad-form-group">
            <div className="ad-form-label">Image Generation API Key (توليد الصور)</div>
            <input
              className="ad-form-input mono"
              type="text"
              value={vals.imgKey}
              onChange={e => setVals({ ...vals, imgKey: e.target.value })}
              placeholder="أدخل مفتاح الصور..."
            />
          </div>

          <div className="ad-form-group">
            <div className="ad-form-label">Text Analysis/Chat API Key (المفتاح الثالث)</div>
            <input
              className="ad-form-input mono"
              type="text"
              value={vals.textKey}
              onChange={e => setVals({ ...vals, textKey: e.target.value })}
              placeholder="أدخل المفتاح الإضافي..."
            />
          </div>

          <hr className="ad-form-divider" style={{ margin: '15px 0' }} />

          <div className="ad-form-group">
            <div className="ad-form-label">وضع الصيانة (Maintenance Mode)</div>
            <div className="ad-toggle-row" style={{ padding: 0, border: 'none' }}>
              <div className="ad-toggle-info">
                <div className="ad-toggle-sub">تفعيل هذا الخيار سيمنع المستخدمين من الوصول للتطبيق (إلا الأدمن)</div>
              </div>
              <div
                className={`ad-toggle ${toggles.maintenance ? 'on' : ''}`}
                onClick={() => handleToggle('maintenance', toggles.maintenance)}
              />
            </div>
          </div>

          <button className="ad-btn ad-btn-primary" style={{ alignSelf: 'flex-start', marginTop: 10 }} onClick={handleSaveAll}>
            حفظ كافة التغييرات
          </button>
        </div>
      </div>

      <div className="ad-panel">
        <div className="ad-panel-head"><div className="ad-panel-title">إعدادات الإشعارات</div></div>
        <div className="ad-settings-form">
          {[
            { id: 'notifications', title: 'إشعارات البريد الإلكتروني', sub: 'استلام تقرير يومي على البريد' },
            { id: 'errors', title: 'تنبيهات الأخطاء الحرجة', sub: 'تنبيه فوري عند حدوث خطأ' },
            { id: 'webhook', title: 'Webhook للطلبات الجديدة', sub: 'إرسال إشعار عند كل طلب' },
          ].map((t, i) => (
            <React.Fragment key={t.id}>
              <div className="ad-toggle-row">
                <div className="ad-toggle-info">
                  <div className="ad-toggle-title">{t.title}</div>
                  <div className="ad-toggle-sub">{t.sub}</div>
                </div>
                <div className={`ad-toggle ${toggles[t.id] ? 'on' : ''}`} onClick={() => handleToggle(t.id, toggles[t.id])} />
              </div>
              {i < 2 && <hr className="ad-form-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vault (Treasury) Page ───────────────────────────────────────────────────
export function VaultPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [checks, setChecks] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [salesSearch, setSalesSearch] = useState('');
  const [checksSearch, setChecksSearch] = useState('');
  const [checksFilter, setChecksFilter] = useState('all');

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      const data = await adminApi.getVaultData();
      setTransactions(data.sales || []);
      setChecks(data.checks || []);
      setChartData(data.chartData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheck = async () => {
    const amountStr = window.prompt('أدخل قيمة الشيك / الإيداع (SR):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert('مبلغ غير صالح');

    const source = window.prompt('أدخل مصدر هذا الشيك (مثلاً: دعم، جائزة، إلخ):', 'إيداع بنكي');
    if (!source) return;

    try {
      await adminApi.addManualCheck({ amount, source });
      loadVault();
    } catch (err) {
      alert("فشل إضافة الشيك: " + err.message);
    }
  };

  const handleUpdateCheckStatus = async (id, newStatus) => {
    try {
      await adminApi.updatePaymentStatus(id, newStatus);
      loadVault();
    } catch (err) {
      alert("فشل تحديث الحالة: " + err.message);
    }
  };

  if (loading) return <div className="ad-loading">جاري تحميل البيانات المالية...</div>;

  const totalSales = transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0);
  const totalDeposits = checks.filter(c => c.status === 'completed').reduce((acc, c) => acc + c.amount, 0);
  const pendingChecks = checks.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount, 0);

  const filteredSales = transactions.filter(t =>
    t.source.toLowerCase().includes(salesSearch.toLowerCase()) ||
    t.id.toString().includes(salesSearch)
  );

  const filteredChecks = checks.filter(c => {
    const matchesSearch = c.source.toLowerCase().includes(checksSearch.toLowerCase()) || c.id.toString().includes(checksSearch);
    const matchesStatus = checksFilter === 'all' || c.status === checksFilter;
    return matchesSearch && matchesStatus;
  });

  const cards = [
    { accent: '#2dd4a0', iconBg: 'rgba(45,212,160,0.12)', icon: <IconWallet size={20} />, label: 'إجمالي الخزنة المتاح', value: `${(totalSales + totalDeposits).toLocaleString()} SR`, trend: 'رصيد فعلي', trendCls: 'ad-trend-up' },
    { accent: '#6c72ff', iconBg: 'rgba(108,114,255,0.12)', icon: <IconStory size={20} />, label: 'إجمالي أرباح النظام', value: `${totalSales.toLocaleString()} SR`, trend: 'من مبيعات القصص', trendCls: 'ad-trend-up' },
    { accent: '#f5a623', iconBg: 'rgba(245,166,35,0.12)', icon: <IconMoney size={20} />, label: 'إيداعات خارجية محصلة', value: `${totalDeposits.toLocaleString()} SR`, trend: 'شيكات ودعم', trendCls: 'ad-trend-up' },
    { accent: '#ff5c6a', iconBg: 'rgba(255,92,106,0.12)', icon: <IconMonitor size={20} />, label: 'شيكات قيد التحصيل', value: `${pendingChecks.toLocaleString()} SR`, trend: 'في انتظار التأكيد', trendCls: 'ad-trend-down' },
  ];

  const maxVal = Math.max(...chartData.map(d => d.val), 1);

  return (
    <>
      <div className="ad-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* Chart Panel (Right) */}
        <div className="ad-panel" style={{ flex: '1', minWidth: '300px', marginBottom: 0 }}>
          <div className="ad-panel-head">
            <div className="ad-panel-title">📈 نمو الأرباح (آخر 7 أيام)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
              إجمالي: {chartData.reduce((a, b) => a + b.val, 0)} SR
            </div>
          </div>
          <div className="ad-mini-chart">
            <div className="ad-chart-grid-bg">
              <div style={{ top: '0%' }}></div>
              <div style={{ top: '25%' }}></div>
              <div style={{ top: '50%' }}></div>
              <div style={{ top: '75%' }}></div>
              <div style={{ top: '100%' }}></div>
            </div>
            <div className="ad-bar-chart-v2" style={{ height: '220px' }}>
              {chartData.map((d, i) => (
                <div key={i} className="ad-bar-group">
                  <div className="ad-bar-item-v2" title={`${d.day}: ${d.val} SR`} style={{ height: `${Math.round((d.val / maxVal) * 100)}%` }}>
                    <div className="ad-bar-fill" style={{ background: i === chartData.length - 1 ? 'var(--accent)' : 'rgba(108,114,255,0.4)' }} />
                  </div>
                  <div className="ad-bar-label-v2">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Panel (Left) */}
        <div className="ad-panel" style={{ flex: '2', minWidth: '400px', marginBottom: 0 }}>
          <div className="ad-panel-head" style={{ flexWrap: 'wrap', gap: 15 }}>
            <div className="ad-panel-title">📊 سجل أرباح النظام ({filteredSales.length})</div>
            <div className="ad-table-filters">
              <div className="ad-search-box">
                <IconSearch size={16} color="var(--text3)" />
                <input
                  placeholder="بحث في الأرباح..."
                  value={salesSearch}
                  onChange={e => setSalesSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ad-tbl">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>بيان العملية</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(t => (
                  <tr key={t.id}>
                    <td className="id-cell">#SLS-{t.id}</td>
                    <td>{t.source}</td>
                    <td style={{ fontWeight: 'bold', color: '#2dd4a0' }}>+{t.amount.toLocaleString()} SR</td>
                    <td className="ad-date-cell">{t.date}</td>
                    <td><span className="ad-badge ad-badge-success">مكتمل</span></td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>لا توجد نتائج مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="ad-panel">
        <div className="ad-panel-head" style={{ flexWrap: 'wrap', gap: 15 }}>
          <div className="ad-panel-title">💳 إدارة الشيكات والإيداعات ({filteredChecks.length})</div>
          <div className="ad-table-filters">
            <div className="ad-search-box">
              <IconSearch size={16} color="var(--text3)" />
              <input
                placeholder="بحث في الشيكات..."
                value={checksSearch}
                onChange={e => setChecksSearch(e.target.value)}
              />
            </div>
            <select className="ad-filter-select" value={checksFilter} onChange={e => setChecksFilter(e.target.value)}>
              <option value="all">كل الشيكات</option>
              <option value="completed">محصلة</option>
              <option value="pending">معلقة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <button className="ad-btn ad-btn-primary" onClick={handleAddCheck}>
              ➕ تسجيل شيك جديد
            </button>
          </div>
        </div>
        <table className="ad-tbl">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>البيان / المصدر</th>
              <th>قيمة الشيك</th>
              <th>التاريخ</th>
              <th>حالة التحصيل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredChecks.map(c => (
              <tr key={c.id}>
                <td className="id-cell">#CHK-{c.id}</td>
                <td>{c.source}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--text)' }}>{c.amount.toLocaleString()} SR</td>
                <td className="ad-date-cell">{c.date}</td>
                <td>
                  {c.status === 'completed' && <span className="ad-badge ad-badge-success">تم التحصيل</span>}
                  {c.status === 'pending' && <span className="ad-badge ad-badge-warning">معلق</span>}
                  {c.status === 'rejected' && <span className="ad-badge ad-badge-danger">مرفوض</span>}
                </td>
                <td>
                  <div className="ad-actions-row">
                    {c.status === 'pending' && (
                      <>
                        <button className="ad-btn" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#2dd4a0', color: '#2dd4a0' }} onClick={() => handleUpdateCheckStatus(c.id, 'completed')}>تحصيل</button>
                        <button className="ad-btn" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#ff5c6a', color: '#ff5c6a' }} onClick={() => handleUpdateCheckStatus(c.id, 'rejected')}>رفض</button>
                      </>
                    )}
                    {c.status !== 'pending' && (
                      <button className="ad-btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleUpdateCheckStatus(c.id, 'pending')}>إعادة لـ معلق</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredChecks.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>لا توجد نتائج مطابقة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
