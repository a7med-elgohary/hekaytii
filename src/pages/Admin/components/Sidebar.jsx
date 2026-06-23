import React from 'react';

export default function Sidebar({ tab, setTab, navItems, adminUser, onLogout }) {
  return (
    <aside className="ad-sidebar">
      <div className="ad-sb-logo">
        <div className="ad-sb-logo-icon">ح</div>
        <div>
          <div className="ad-sb-logo-text">حكايتي</div>
          <div className="ad-sb-logo-sub">لوحة التحكم</div>
        </div>
      </div>

      <nav className="ad-sb-nav">
        {navItems.map(group => (
          <React.Fragment key={group.section}>
            <div className="ad-sb-section">{group.section}</div>
            {group.items.map(item => (
              <div
                key={item.tab}
                className={`ad-sb-item ${tab === item.tab ? 'active' : ''}`}
                onClick={() => setTab(item.tab)}
              >
                <span className="ad-sb-icon">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && (
                  <span className="ad-sb-badge">{item.badge}</span>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="ad-sb-user">
        <div className="ad-sb-avatar">A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ad-sb-user-name">المدير العام</div>
          <div className="ad-sb-user-role">{adminUser?.email}</div>
        </div>
        <button className="ad-sb-logout" title="تسجيل الخروج" onClick={onLogout}>⇥</button>
      </div>
    </aside>
  );
}
