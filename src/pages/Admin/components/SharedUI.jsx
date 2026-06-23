import React from 'react';

export function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  
  if (s === 'completed' || s === 'تم التسليم') 
    return <span className="ad-badge ad-badge-success"><span className="ad-badge-dot" />تم التسليم</span>;
  
  if (s === 'pending' || s === 'معلق')   
    return <span className="ad-badge ad-badge-warning"><span className="ad-badge-dot" />معلق</span>;
  
  if (s === 'reviewing' || s === 'قيد المراجعة') 
    return <span className="ad-badge ad-badge-info"><span className="ad-badge-dot" />قيد المراجعة</span>;
  
  if (s === 'printing' || s === 'جاري الطباعة')  
    return <span className="ad-badge ad-badge-accent"><span className="ad-badge-dot" />جاري الطباعة</span>;
  
  if (s === 'shipping' || s === 'في الطريق')  
    return <span className="ad-badge ad-badge-info"><span className="ad-badge-dot" />في الطريق</span>;
    
  if (s === 'failed' || s === 'فشل')    
    return <span className="ad-badge ad-badge-danger"><span className="ad-badge-dot" />فشل</span>;
    
  if (s === 'delayed' || s === 'متأخر')   
    return <span className="ad-badge ad-badge-danger"><span className="ad-badge-dot" />متأخر</span>;
  
  return <span className="ad-badge ad-badge-warning"><span className="ad-badge-dot" />{status || 'معالجة'}</span>;
}

export function FileBadges({ story, onJson, onPdf }) {
  return (
    <div className="ad-actions-row">
      <span className="ad-badge ad-badge-warning clickable" onClick={() => onJson(story)}>JSON</span>
      {story.status === 'completed' && (
        <span className="ad-badge ad-badge-danger clickable" onClick={() => onPdf(story)}>PDF</span>
      )}
    </div>
  );
}

export function StatCard({ accent, icon, iconBg, label, value, trend, trendCls, onClick }) {
  return (
    <div 
      className={`ad-stat-card ${onClick ? 'clickable' : ''}`} 
      style={{ '--card-accent': accent, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {icon && <div className="ad-stat-icon" style={{ background: iconBg }}>{icon}</div>}
      <div className="ad-stat-label">{label}</div>
      <div className="ad-stat-value">{value}</div>
      <div className={`ad-stat-trend ${trendCls}`}>{trend}</div>
    </div>
  );
}
