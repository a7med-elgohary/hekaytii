import React from 'react';
import { IconSearch, IconBell, IconRefresh } from './Icons';

export default function Topbar({ title, search, setWithSearch, onRefresh, connected }) {
  return (
    <div className="ad-topbar">
      <div className="ad-topbar-title">
        {title}
        {connected && <span className="ad-live-label">مباشر</span>}
      </div>
      <div className="ad-topbar-search">
        <span className="ad-topbar-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
          <IconSearch size={16} />
        </span>
        <input 
          placeholder="بحث في الطلبات، القصص..." 
          value={search}
          onChange={(e) => setWithSearch(e.target.value)}
        />
      </div>
      <div className="ad-topbar-actions">
        <div className="ad-topbar-btn" title="الإشعارات">
          <IconBell size={18} />
          <div className="ad-notif-dot" />
        </div>
        <div className="ad-topbar-btn" title="تحديث البيانات" onClick={onRefresh}>
          <IconRefresh size={18} />
        </div>
        <div className="ad-sb-avatar" style={{ width:34, height:34, fontSize:'0.78rem', cursor:'pointer', borderRadius:8 }}>A</div>
      </div>
    </div>
  );
}
