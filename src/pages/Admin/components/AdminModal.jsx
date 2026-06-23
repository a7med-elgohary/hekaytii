import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import DOMPurify from 'dompurify';

function colorJson(raw) {
  return raw.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="ad-json-key">${match}</span>`;
        return `<span class="ad-json-str">${match}</span>`;
      }
      return `<span class="ad-json-num">${match}</span>`;
    }
  );
}

export default function AdminModal({ data, onClose, apiBase }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.type === 'json') {
      setLoading(true);
      adminApi.getStoryContent(data.story.fileName)
        .then(resData => {
          try {
            setContent(JSON.parse(resData.content));
          } catch {
            // Fallback mock if parsing fails or file not found
            setContent({
                id: data.story.id,
                childName: data.story.childName,
                title: `مغامرة ${data.story.childName} السحرية`,
                language: 'ar',
                hobby: data.story.hobby,
                content: `كان يا مكان، كان هناك بطل صغير يدعى ${data.story.childName}...`,
                pdfUrl: `/assets/story_${data.story.id}_print.pdf`,
                createdAt: new Date().toISOString(),
                storyImages: [
                  { pageNumber: 1, sceneTextAr: 'البداية',   imageUrl: `https://example.com/img_${data.story.id}_1.png` },
                  { pageNumber: 2, sceneTextAr: 'المغامرة',  imageUrl: `https://example.com/img_${data.story.id}_2.png` },
                ],
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [data, apiBase]);

  if (!data) return null;

  return (
    <div className="ad-modal-overlay open" onClick={(e) => { if (e.target.classList.contains('ad-modal-overlay')) onClose(); }}>
      <div className="ad-modal-box">
        <div className="ad-modal-head">
          <span className="ad-modal-head-icon">{data.type === 'json' ? '{ }' : '▣'}</span>
          <div className="ad-modal-head-title">
            {data.type === 'json' ? `story_${data.story.id}.json` : `story_${data.story.id}_print.pdf`}
          </div>
          <div className="ad-actions-row">
            <button className="ad-btn ad-btn-sm">⬇ تحميل</button>
            <button className="ad-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="ad-modal-body">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>جاري تحميل محتوى الملف...</div>
          ) : data.type === 'json' ? (
            <pre
              className="ad-json-pre"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(colorJson(JSON.stringify(content || {}, null, 2))) }}
            />
          ) : (
            <div className="ad-pdf-preview">
              <div className="ad-pdf-icon">▣</div>
              <div>
                <div className="ad-pdf-title">مغامرة {data.story.childName} السحرية</div>
                <div className="ad-pdf-sub">قصة مخصصة — حكايتي للذكاء الاصطناعي</div>
              </div>
              <div className="ad-pdf-excerpt">
                كان يا مكان، في قرية بعيدة بعيدة، كان هناك طفل شجاع يدعى{' '}
                <strong style={{ color: 'var(--text)' }}>{data.story.childName}</strong>.
                <br />
                كان {data.story.childName} يحبّ الاستكشاف ويعشق المغامرات الكبيرة...
                <br />
                <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>— صفحة 1 من 12</span>
              </div>
              <div className="ad-actions-row">
                <a href={`${apiBase}${data.story.url || `/pdfs/${data.story.fileName}`}`} target="_blank" rel="noreferrer" className="ad-btn ad-btn-primary">⬇ تحميل PDF</a>
                <button className="ad-btn">🖨️ طباعة</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
